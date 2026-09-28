package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"go/format"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type RunRequest struct {
	Code string `json:"code"`
	Mode string `json:"mode,omitempty"` // "local" or "playground"
}

type RunResponse struct {
	Output     string `json:"output"`
	Errors     string `json:"errors,omitempty"`
	DurationMs int64  `json:"duration_ms"`
	Source     string `json:"source"` // "local" or "playground"
}

type FmtRequest struct {
	Code string `json:"code"`
}

type FmtResponse struct {
	Code  string `json:"code"`
	Error string `json:"error,omitempty"`
}

type ShareRequest struct {
	Code string `json:"code"`
}

type ShareResponse struct {
	ShareID string `json:"share_id"`
	URL     string `json:"url"`
	Error   string `json:"error,omitempty"`
}

// GoPlaygroundResponse represents https://go.dev/_/compile response
type GoPlaygroundResponse struct {
	Errors    string `json:"Errors"`
	Events    []PlaygroundEvent `json:"Events"`
	VetErrors string `json:"VetErrors"`
}

type PlaygroundEvent struct {
	Message string `json:"Message"`
	Kind    string `json:"Kind"`
	Delay   int64  `json:"Delay"`
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func handleRun(w http.ResponseWriter, r *http.ResponseWriter, req *http.Request) {
	enableCORS(w)
	if req.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if req.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var runReq RunRequest
	if err := json.NewDecoder(req.Body).Decode(&runReq); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	start := time.Now()

	// If mode is specifically playground or if local execution fails, use Go Playground
	if runReq.Mode == "playground" {
		resp, err := runPlayground(runReq.Code)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(RunResponse{
				Errors:     fmt.Sprintf("Playground error: %v", err),
				DurationMs: time.Since(start).Milliseconds(),
				Source:     "playground",
			})
			return
		}
		resp.DurationMs = time.Since(start).Milliseconds()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
		return
	}

	// Try local execution first for ultra-fast response
	out, errStr, err := runLocal(runReq.Code)
	duration := time.Since(start).Milliseconds()

	if err != nil && out == "" && errStr == "" {
		// Fallback to playground
		resp, pgErr := runPlayground(runReq.Code)
		if pgErr == nil {
			resp.DurationMs = time.Since(start).Milliseconds()
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(resp)
			return
		}
	}

	res := RunResponse{
		Output:     out,
		Errors:     errStr,
		DurationMs: duration,
		Source:     "local",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func runLocal(code string) (string, string, error) {
	tempDir, err := os.MkdirTemp("", "godsa-*")
	if err != nil {
		return "", "", err
	}
	defer os.RemoveAll(tempDir)

	filePath := filepath.Join(tempDir, "main.go")
	if err := os.WriteFile(filePath, []byte(code), 0644); err != nil {
		return "", "", err
	}

	// 5 second timeout to prevent infinite loops
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "go", "run", filePath)
	cmd.Dir = tempDir

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err = cmd.Run()
	if ctx.Err() == context.DeadlineExceeded {
		return stdout.String(), "Execution timed out (5s limit exceeded)", ctx.Err()
	}

	// Filter out temp path from error messages to keep output clean
	errOutput := stderr.String()
	if tempDir != "" {
		errOutput = strings.ReplaceAll(errOutput, tempDir+"/", "")
		errOutput = strings.ReplaceAll(errOutput, filePath, "main.go")
	}

	return stdout.String(), errOutput, err
}

func runPlayground(code string) (*RunResponse, error) {
	formData := url.Values{}
	formData.Set("version", "2")
	formData.Set("body", code)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.PostForm("https://go.dev/_/compile", formData)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var pgResp GoPlaygroundResponse
	if err := json.Unmarshal(bodyBytes, &pgResp); err != nil {
		return nil, err
	}

	var outBuilder strings.Builder
	for _, ev := range pgResp.Events {
		outBuilder.WriteString(ev.Message)
	}

	errStr := pgResp.Errors
	if pgResp.VetErrors != "" {
		if errStr != "" {
			errStr += "\n"
		}
		errStr += pgResp.VetErrors
	}

	return &RunResponse{
		Output: outBuilder.String(),
		Errors: errStr,
		Source: "playground",
	}, nil
}

func handleFmt(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req FmtRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	formatted, err := format.Source([]byte(req.Code))
	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		json.NewEncoder(w).Encode(FmtResponse{
			Code:  req.Code,
			Error: err.Error(),
		})
		return
	}

	json.NewEncoder(w).Encode(FmtResponse{
		Code: string(formatted),
	})
}

func handleShare(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ShareRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post("https://go.dev/_/share", "text/plain", strings.NewReader(req.Code))
	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		json.NewEncoder(w).Encode(ShareResponse{
			Error: fmt.Sprintf("Failed to share snippet: %v", err),
		})
		return
	}
	defer resp.Body.Close()

	shareIDBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		json.NewEncoder(w).Encode(ShareResponse{
			Error: fmt.Sprintf("Failed to read response: %v", err),
		})
		return
	}

	shareID := strings.TrimSpace(string(shareIDBytes))
	json.NewEncoder(w).Encode(ShareResponse{
		ShareID: shareID,
		URL:     fmt.Sprintf("https://go.dev/play/p/%s", shareID),
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("/api/run", func(w http.ResponseWriter, r *http.Request) {
		handleRun(w, &w, r)
	})
	mux.HandleFunc("/api/fmt", handleFmt)
	mux.HandleFunc("/api/share", handleShare)
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","server":"godsa-backend"}`))
	})

	// Static assets from frontend/dist or dist
	distDir := "./dist"
	if _, err := os.Stat(distDir); os.IsNotExist(err) {
		distDir = "./frontend/dist"
	}

	if info, err := os.Stat(distDir); err == nil && info.IsDir() {
		log.Printf("Serving static frontend from %s", distDir)
		fileServer := http.FileServer(http.Dir(distDir))
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			path := filepath.Join(distDir, r.URL.Path)
			if _, err := os.Stat(path); os.IsNotExist(err) {
				// SPA fallback to index.html
				http.ServeFile(w, r, filepath.Join(distDir, "index.html"))
				return
			}
			fileServer.ServeHTTP(w, r)
		})
	} else {
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			enableCORS(w)
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			w.Write([]byte(`<!DOCTYPE html><html><body><h1>GoDSA Backend Running</h1><p>Run Vite frontend or build frontend to serve UI.</p></body></html>`))
		})
	}

	serverAddr := ":" + port
	log.Printf("GoDSA server listening on http://localhost%s\n", serverAddr)
	if err := http.ListenAndServe(serverAddr, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

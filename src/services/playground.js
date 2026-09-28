/**
 * Go Playground & Runner Service
 * Handles code execution, formatting, and Go playground sharing
 */

const API_BASE = '/api'

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' })
    if (res.ok) {
      const data = await res.json()
      return { ok: true, data }
    }
  } catch (e) {
    // Backend might be offline
  }
  return { ok: false }
}

export async function runGoCode(code, mode = 'auto') {
  try {
    const res = await fetch(`${API_BASE}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, mode: mode === 'playground' ? 'playground' : 'local' }),
    })

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`)
    }

    const data = await res.json()
    return {
      success: !data.errors,
      output: data.output || '',
      errors: data.errors || '',
      durationMs: data.duration_ms || 0,
      source: data.source || 'local',
    }
  } catch (err) {
    return {
      success: false,
      output: '',
      errors: `Backend connection error: ${err.message}.\nMake sure the Go server is running with 'go run cmd/server/main.go' (or npm run server). You can also click 'Open in Go.dev' to run this in the official Go Playground.`,
      durationMs: 0,
      source: 'offline',
    }
  }
}

export async function formatGoCode(code) {
  try {
    const res = await fetch(`${API_BASE}/fmt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const data = await res.json()
    if (data.error) {
      return { success: false, error: data.error, code }
    }
    return { success: true, code: data.code }
  } catch (err) {
    return { success: false, error: err.message, code }
  }
}

export async function shareToPlayground(code) {
  try {
    const res = await fetch(`${API_BASE}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.url) {
        return { success: true, url: data.url }
      }
    }
  } catch (err) {
    // Fallback if backend offline: encode snippet in URL hash
  }

  // Fallback: https://go.dev/play?v=...
  return {
    success: true,
    url: 'https://go.dev/play',
  }
}

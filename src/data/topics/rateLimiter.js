export const rateLimiterTopic = {
  id: 'token-bucket',
  title: 'Rate Limiting: Token & Leaky Bucket',
  category: 'networking',
  difficulty: 'Intermediate',
  icon: 'Shield',
  summary: 'Traffic shaping, API gateway rate limiting, and burst control algorithms used by Stripe, Cloudflare, and Nginx.',
  timeComplexity: {
    'Allow(tokens)': 'O(1)',
    'Refill': 'O(1) lazy timestamp calculation',
    'Space': 'O(1) per client IP'
  },
  keyPoints: [
    '**Token Bucket**: Tokens accumulate at a fixed refill rate up to maximum capacity. Requests consume tokens. Accommodates bursts up to capacity!',
    '**Leaky Bucket**: Requests enter a queue and drain at a constant, fixed smooth rate. Ideal for smoothing out bursty traffic into steady streams.',
    'Lazy Refill: In production (e.g. Go standard `golang.org/x/time/rate`), rate limiters do not use costly background timers. Instead, they calculate `tokensToAdd = (now - lastRefill) * rate` on each request in $O(1)$.',
    'HTTP 429 Too Many Requests: Standard response header when tokens are depleted with `Retry-After` seconds.'
  ],
  goInternals: `// Production Lazy-Refill Token Bucket in Go:
type TokenBucket struct {
    capacity     float64
    tokens       float64
    refillRate   float64 // tokens per second
    lastRefill   time.Time
    mu           sync.Mutex
}`,
  visualizerType: 'token-bucket',
  codeSamples: {
    core: `package main

import (
	"fmt"
	"sync"
	"time"
)

// TokenBucket rate limiter using lazy timestamp replenishment
type TokenBucket struct {
	capacity   float64
	tokens     float64
	refillRate float64 // tokens per second
	lastRefill time.Time
	mu         sync.Mutex
}

func NewTokenBucket(capacity, refillRate float64) *TokenBucket {
	return &TokenBucket{
		capacity:   capacity,
		tokens:     capacity,
		refillRate: refillRate,
		lastRefill: time.Now(),
	}
}

// Allow checks if n tokens are available and consumes them in O(1)
func (tb *TokenBucket) Allow(tokensNeeded float64) bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(tb.lastRefill).Seconds()
	tb.lastRefill = now

	// 1. Replenish tokens based on elapsed time
	tb.tokens = tb.tokens + elapsed*tb.refillRate
	if tb.tokens > tb.capacity {
		tb.tokens = tb.capacity
	}

	// 2. Consume if sufficient
	if tb.tokens >= tokensNeeded {
		tb.tokens -= tokensNeeded
		return true // Request Allowed (200 OK)
	}

	return false // Rate Limited (429 Too Many Requests)
}

func main() {
	// Capacity 3 tokens, refill 1 token/sec
	limiter := NewTokenBucket(3, 1)

	fmt.Println("=== 1. Initial Burst of 4 Requests ===")
	for i := 1; i <= 4; i++ {
		allowed := limiter.Allow(1)
		fmt.Printf("Request #%d: Allowed = %-5t (Tokens left: %.1f)\\n", 
			i, allowed, limiter.tokens)
	}

	fmt.Println("\\nSleeping 1.2 seconds for refill...")
	time.Sleep(1200 * time.Millisecond)

	fmt.Println("=== 2. Request After Refill ===")
	allowedAfter := limiter.Allow(1)
	fmt.Printf("Request after wait: Allowed = %-5t (Tokens left: %.1f)\\n", 
		allowedAfter, limiter.tokens)
}`,
    practical: `package main

import (
	"fmt"
	"net/http"
	"sync"
)

// PerClientLimiter tracks IP addresses
type PerClientLimiter struct {
	mu      sync.Mutex
	clients map[string]int // IP -> remaining requests in window
}

func NewPerClientLimiter() *PerClientLimiter {
	return &PerClientLimiter{clients: make(map[string]int)}
}

func (l *PerClientLimiter) HandleRequest(ip string) (int, string) {
	l.mu.Lock()
	defer l.mu.Unlock()

	limit := 3
	current := l.clients[ip]
	if current >= limit {
		return http.StatusTooManyRequests, "429 Too Many Requests - IP rate limit reached"
	}
	l.clients[ip] = current + 1
	return http.StatusOK, fmt.Sprintf("200 OK - Request %d/%d accepted", l.clients[ip], limit)
}

func main() {
	limiter := NewPerClientLimiter()
	ip := "192.168.1.42"

	for i := 1; i <= 4; i++ {
		code, msg := limiter.HandleRequest(ip)
		fmt.Printf("[HTTP %d] %s\\n", code, msg)
	}
}`,
    exercise: `package main

import "fmt"

// TASK: Implement FixedWindowCounter.
// Allow at most maxRequests per minute.
type FixedWindowCounter struct {
	count       int
	maxRequests int
}

func (fw *FixedWindowCounter) Allow() bool {
	if fw.count < fw.maxRequests {
		fw.count++
		return true
	}
	return false
}

func main() {
	fw := &FixedWindowCounter{maxRequests: 2}
	fmt.Printf("Req 1: %t (Expected: true)\\n", fw.Allow())
	fmt.Printf("Req 2: %t (Expected: true)\\n", fw.Allow())
	fmt.Printf("Req 3: %t (Expected: false)\\n", fw.Allow())
}`
  }
}

export const hmacTopic = {
  id: 'hmac-signatures',
  title: 'HMAC & API Request Signing',
  category: 'cryptography',
  difficulty: 'Intermediate',
  icon: 'Shield',
  summary: 'Message authentication using Hash-based Message Authentication Code (HMAC) for webhook verification and Application Programming Interface (API) request signing.',
  timeComplexity: {
    'Sign Message': 'O(n) where n is message length',
    'Verify Signature': 'O(1) constant-time comparison',
    'Space': 'O(1) 32 bytes for SHA-256'
  },
  keyPoints: [
    'Hash-based Message Authentication Code (HMAC): A cryptographic authentication algorithm defined in Request for Comments (RFC 2104) combining a cryptographic hash function with a secret key.',
    'Flaw of Naive Hashing: Prepending a secret `Hash(key + message)` is vulnerable to Length Extension Attacks in Merkle-Damgård constructions (SHA-256).',
    'Dual-Hashing Construction: HMAC uses inner and outer padding bytes: $\\text{HMAC}(K, m) = H((K \\oplus \\text{opad}) \\parallel H((K \\oplus \\text{ipad}) \\parallel m))$ where $\\text{ipad} = \\text{0x36}$ and $\\text{opad} = \\text{0x5c}$.',
    'Timing Attacks: When comparing HMAC signatures, developers MUST use constant-time comparison (`hmac.Equal`) to prevent timing side-channel attacks that leak secret bytes via early string loop exits.',
    'Real-World Applications: Stripe and GitHub webhook signatures, Amazon Web Services (AWS) Signature Version 4, and JSON Web Tokens (JWT with HS256).'
  ],
  goInternals: `// In Go, HMAC is provided by "crypto/hmac" and "crypto/sha256":
mac := hmac.New(sha256.New, secretKey)
mac.Write([]byte(message))
signature := mac.Sum(nil)

// Constant-time comparison:
isValid := hmac.Equal(signature, expectedSignature)`,
  visualizerType: 'array',
  codeSamples: {
    core: `package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

// GenerateHMAC signs message with secret key using SHA-256
func GenerateHMAC(secret []byte, message []byte) string {
	mac := hmac.New(sha256.New, secret)
	mac.Write(message)
	return hex.EncodeToString(mac.Sum(nil))
}

// VerifyHMAC verifies signature in constant time
func VerifyHMAC(secret []byte, message []byte, signatureHex string) bool {
	sigBytes, err := hex.DecodeString(signatureHex)
	if err != nil {
		return false
	}

	mac := hmac.New(sha256.New, secret)
	mac.Write(message)
	expectedSig := mac.Sum(nil)

	// hmac.Equal provides constant-time byte comparison!
	return hmac.Equal(sigBytes, expectedSig)
}

func main() {
	secretKey := []byte("whsec_super_secret_webhook_signing_key_42")
	payload := []byte("event=payment.succeeded&amount=9900&currency=USD")

	fmt.Println("=== 1. Generating HMAC-SHA256 Signature ===")
	sig := GenerateHMAC(secretKey, payload)
	fmt.Printf("Payload:   %s\\n", string(payload))
	fmt.Printf("Signature: %s\\n\\n", sig)

	fmt.Println("=== 2. Verifying Authentic Request ===")
	isAuthentic := VerifyHMAC(secretKey, payload, sig)
	fmt.Printf("Signature valid? %t (Expected: true)\\n\\n", isAuthentic)

	fmt.Println("=== 3. Tampered Payload Detection ===")
	tamperedPayload := []byte("event=payment.succeeded&amount=10&currency=USD")
	isTamperedValid := VerifyHMAC(secretKey, tamperedPayload, sig)
	fmt.Printf("Tampered payload valid? %t (Expected: false -> REJECTED)\\n", isTamperedValid)
}`,
    practical: `package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
)

// WebhookHandler simulates verifying inbound webhook headers
func VerifyWebhookHeaders(headerSignature string, body []byte, secret []byte) (int, string) {
	mac := hmac.New(sha256.New, secret)
	mac.Write(body)
	expected := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(headerSignature), []byte(expected)) {
		return http.StatusUnauthorized, "401 Unauthorized: Invalid HMAC signature"
	}
	return http.StatusOK, "200 OK: Webhook authenticated successfully"
}

func main() {
	secret := []byte("stripe_live_secret_key_883")
	body := []byte("charge_id=ch_3N82b8&status=paid")

	// Valid header
	mac := hmac.New(sha256.New, secret)
	mac.Write(body)
	validHeader := hex.EncodeToString(mac.Sum(nil))

	code, msg := VerifyWebhookHeaders(validHeader, body, secret)
	fmt.Printf("Valid Webhook:   [HTTP %d] %s\\n", code, msg)

	// Forged header from malicious sender
	fakeHeader := "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
	fCode, fMsg := VerifyWebhookHeaders(fakeHeader, body, secret)
	fmt.Printf("Spoofed Webhook: [HTTP %d] %s\\n", fCode, fMsg)
}`,
    exercise: `package main

import (
	"crypto/subtle"
	"fmt"
)

// TASK: Implement ConstantTimeEqual.
// Uses crypto/subtle.ConstantTimeCompare to avoid timing side-channel attacks.
func ConstantTimeEqual(a, b []byte) bool {
	return subtle.ConstantTimeCompare(a, b) == 1
}

func main() {
	sig1 := []byte("signature_token_abc_123")
	sig2 := []byte("signature_token_abc_123")
	sig3 := []byte("signature_token_abc_999")

	fmt.Printf("sig1 == sig2: %t (Expected: true)\\n", ConstantTimeEqual(sig1, sig2))
	fmt.Printf("sig1 == sig3: %t (Expected: false)\\n", ConstantTimeEqual(sig1, sig3))
}`
  }
}

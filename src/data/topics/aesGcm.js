export const aesGcmTopic = {
  id: 'aes-gcm',
  title: 'AES-GCM (Authenticated Encryption)',
  category: 'cryptography',
  difficulty: 'Intermediate',
  icon: 'Lock',
  summary: 'Symmetric encryption using Advanced Encryption Standard in Galois/Counter Mode (AES-GCM) with Authenticated Encryption with Associated Data (AEAD).',
  timeComplexity: {
    'Encryption': 'O(n) where n is plaintext size',
    'Decryption': 'O(n)',
    'Authentication Verification': 'O(n)',
    'Key Sizes': '128, 192, or 256 bits'
  },
  keyPoints: [
    'Advanced Encryption Standard (AES): A symmetric block cipher established by the National Institute of Standards and Technology (NIST) in 2001 operating on 128-bit blocks.',
    'Galois/Counter Mode (GCM): Combines Counter (CTR) mode confidentiality with Galois Message Authentication Code (GMAC) integrity verification.',
    'Authenticated Encryption with Associated Data (AEAD): Encrypts the payload while simultaneously generating a 128-bit cryptographic authentication tag. Any tampering with ciphertext causes decryption to immediately fail.',
    'Nonce (Number used once) / Initialization Vector (IV): Standard 12-byte unique value per message. CRITICAL: Never encrypt two distinct messages with the same key and nonce.',
    'Industry Standard: AES-GCM is the primary symmetric cipher for Transport Layer Security (TLS 1.3), HTTPS web traffic, and SSH secure shell communication.'
  ],
  goInternals: `// In Go, AES-GCM is constructed via "crypto/aes" and "crypto/cipher":
block, err := aes.NewCipher(key) // key must be 16, 24, or 32 bytes
gcm, err := cipher.NewGCM(block)
ciphertext := gcm.Seal(nil, nonce, plaintext, additionalData)
plaintext, err := gcm.Open(nil, nonce, ciphertext, additionalData)`,
  visualizerType: 'array',
  codeSamples: {
    core: `package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
)

// EncryptAESGCM encrypts plaintext using AES-256-GCM
// Generates a cryptographically secure 12-byte Nonce (Number used once)
func EncryptAESGCM(key []byte, plaintext []byte) ([]byte, []byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, nil, err
	}

	// 12-byte standard GCM nonce
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, nil, err
	}

	// Seal appends the ciphertext and 16-byte authentication tag
	ciphertext := gcm.Seal(nil, nonce, plaintext, nil)
	return ciphertext, nonce, nil
}

// DecryptAESGCM verifies authentication tag and decrypts
func DecryptAESGCM(key []byte, nonce []byte, ciphertext []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}
	return plaintext, nil
}

func main() {
	// 32-byte key for AES-256 (Advanced Encryption Standard 256-bit)
	key := []byte("passphrasewhichneedstobe32bytes!")
	message := []byte("Confidential Database Record: Account Balance = $1,000,000")

	fmt.Println("=== 1. AES-GCM Encryption ===")
	fmt.Printf("Original Plaintext: %s\\n", string(message))

	ciphertext, nonce, err := EncryptAESGCM(key, message)
	if err != nil {
		panic(err)
	}

	fmt.Printf("12-byte Nonce (hex):      %s\\n", hex.EncodeToString(nonce))
	fmt.Printf("Ciphertext + Tag (hex):   %s\\n\\n", hex.EncodeToString(ciphertext))

	fmt.Println("=== 2. AES-GCM Decryption & Authentication Verification ===")
	decrypted, err := DecryptAESGCM(key, nonce, ciphertext)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Decrypted Plaintext:      %s\\n", string(decrypted))
}`,
    practical: `package main

import (
	"crypto/aes"
	"crypto/cipher"
	"fmt"
)

// Demonstrates AEAD tamper resistance:
// If an attacker flips a single bit in transit, decryption safely aborts.
func main() {
	key := []byte("32-byte-long-key-for-aes-256!!!")
	nonce := []byte("unique-12-b!")
	plaintext := []byte("Transfer $100 to Bob")

	block, _ := aes.NewCipher(key)
	gcm, _ := cipher.NewGCM(block)
	ciphertext := gcm.Seal(nil, nonce, plaintext, nil)

	fmt.Println("Original Ciphertext generated.")

	// Simulated Man-In-The-Middle (MITM) Bit-Flipping Attack
	tamperedCiphertext := make([]byte, len(ciphertext))
	copy(tamperedCiphertext, ciphertext)
	tamperedCiphertext[0] ^= 0x01 // Flip a single bit!

	// Attempt Decryption of tampered ciphertext
	_, err := gcm.Open(nil, nonce, tamperedCiphertext, nil)
	if err != nil {
		fmt.Printf("TAMPER DETECTED: '%v'\\n", err)
		fmt.Println("Decryption safely rejected! Attack thwarted by GCM authentication tag.")
	}
}`,
    exercise: `package main

import "fmt"

// TASK: ValidateKeyLength.
// In AES, valid key lengths must be exactly 16 bytes (AES-128),
// 24 bytes (AES-192), or 32 bytes (AES-256).
func ValidateKeyLength(key []byte) (string, bool) {
	switch len(key) {
	case 16:
		return "AES-128", true
	case 24:
		return "AES-192", true
	case 32:
		return "AES-256", true
	default:
		return "", false
	}
}

func main() {
	k1 := make([]byte, 16)
	k2 := make([]byte, 32)
	k3 := make([]byte, 10)

	name1, ok1 := ValidateKeyLength(k1)
	name2, ok2 := ValidateKeyLength(k2)
	_, ok3 := ValidateKeyLength(k3)

	fmt.Printf("16-byte key: %s (valid: %t)\\n", name1, ok1)
	fmt.Printf("32-byte key: %s (valid: %t)\\n", name2, ok2)
	fmt.Printf("10-byte key: valid: %t (Expected: false)\\n", ok3)
}`
  }
}

export const rsaTopic = {
  id: 'rsa-cryptography',
  title: 'RSA Public-Key Cryptography',
  category: 'cryptography',
  difficulty: 'Advanced',
  icon: 'Key',
  summary: 'Asymmetric encryption based on Rivest-Shamir-Adleman (RSA) and the computational difficulty of prime factorization.',
  timeComplexity: {
    'Key Generation': 'O(k³) where k is bit length',
    'Encryption (m^e mod n)': 'O(k²)',
    'Decryption (c^d mod n)': 'O(k³)',
    'Security Hardness': 'Sub-exponential integer factorization'
  },
  keyPoints: [
    "Rivest-Shamir-Adleman (RSA): An asymmetric cryptosystem invented in 1977 by Ron Rivest, Adi Shamir, and Leonard Adleman.",
    "Asymmetric Pairs: Uses two distinct keys: a Public Key (e, n) distributed openly for encryption, and a Private Key (d, n) kept secret for decryption.",
    "Mathematical Foundation: Two large prime numbers p and q form modulus n = p * q. Euler's Totient is phi(n) = (p-1)*(q-1).",
    "Key Derivation: Public exponent e is chosen coprime to phi(n) (commonly 65537). Private exponent d is the modular multiplicative inverse: d * e = 1 mod phi(n).",
    "Encryption & Decryption: Encryption computes c = m^e mod n. Decryption computes m = c^d mod n. Based on Euler's Totient Theorem, m^(e*d) = m mod n.",
    "Optimal Asymmetric Encryption Padding (OAEP): Real-world RSA always applies random padding (PKCS #1 v2.1 OAEP) to prevent deterministic ciphertext analysis."
  ],
  goInternals: `// In Go, big integer modular arithmetic is handled by "math/big":
// c = m^e mod n:
c := new(big.Int).Exp(m, e, n)

// Standard library RSA package:
// import "crypto/rsa"
// privKey, err := rsa.GenerateKey(rand.Reader, 2048)`,
  visualizerType: 'array',
  codeSamples: {
    core: `package main

import (
	"fmt"
	"math/big"
)

// RSAKeypair holds public and private keys
type RSAKeypair struct {
	N *big.Int // Modulus: n = p * q
	E *big.Int // Public Exponent: e
	D *big.Int // Private Exponent: d
}

// GenerateMiniRSA generates an educational RSA keypair using small primes
func GenerateMiniRSA(pVal, qVal, eVal int64) RSAKeypair {
	p := big.NewInt(pVal)
	q := big.NewInt(qVal)
	e := big.NewInt(eVal)

	// n = p * q
	n := new(big.Int).Mul(p, q)

	// phi(n) = (p - 1) * (q - 1)
	pMinus1 := new(big.Int).Sub(p, big.NewInt(1))
	qMinus1 := new(big.Int).Sub(q, big.NewInt(1))
	phi := new(big.Int).Mul(pMinus1, qMinus1)

	// d = e^(-1) mod phi(n) (Modular Multiplicative Inverse)
	d := new(big.Int).ModInverse(e, phi)

	return RSAKeypair{N: n, E: e, D: d}
}

// Encrypt computes ciphertext: c = m^e mod n
func Encrypt(m *big.Int, e, n *big.Int) *big.Int {
	return new(big.Int).Exp(m, e, n)
}

// Decrypt computes plaintext: m = c^d mod n
func Decrypt(c *big.Int, d, n *big.Int) *big.Int {
	return new(big.Int).Exp(c, d, n)
}

func main() {
	// Primes p = 61, q = 53 (Educational demonstration)
	// n = 61 * 53 = 3233
	// phi(n) = 60 * 52 = 3120
	// Public exponent e = 17
	keypair := GenerateMiniRSA(61, 53, 17)

	fmt.Println("=== 1. RSA Key Pair Generation ===")
	fmt.Printf("Modulus n:          %s (p=61, q=53)\\n", keypair.N)
	fmt.Printf("Public Key (e, n):  (%s, %s)\\n", keypair.E, keypair.N)
	fmt.Printf("Private Key (d, n): (%s, %s)\\n\\n", keypair.D, keypair.N)

	// Secret integer message to encrypt (e.g., numeric secret key = 65)
	message := big.NewInt(65)
	fmt.Println("=== 2. Encryption (c = m^e mod n) ===")
	fmt.Printf("Original Message m: %s\\n", message)

	ciphertext := Encrypt(message, keypair.E, keypair.N)
	fmt.Printf("Encrypted Ciphertext c: %s\\n\\n", ciphertext)

	fmt.Println("=== 3. Decryption (m = c^d mod n) ===")
	decrypted := Decrypt(ciphertext, keypair.D, keypair.N)
	fmt.Printf("Decrypted Message:  %s\\n", decrypted)

	if message.Cmp(decrypted) == 0 {
		fmt.Println("VERIFIED: Decrypted message matches original plaintext!")
	}
}`,
    practical: `package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"fmt"
)

// Production RSA-2048 with Optimal Asymmetric Encryption Padding (OAEP)
func main() {
	// 1. Generate 2048-bit RSA Private Key
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}
	publicKey := &privateKey.PublicKey

	fmt.Println("Generated 2048-bit RSA Keypair.")
	message := []byte("Secret Symmetric AES Session Key: 0x9f83a12b")

	// 2. Encrypt with Public Key using OAEP (Optimal Asymmetric Encryption Padding)
	label := []byte("orders")
	ciphertext, err := rsa.EncryptOAEP(sha256.New(), rand.Reader, publicKey, message, label)
	if err != nil {
		panic(err)
	}
	fmt.Printf("OAEP Ciphertext length: %d bytes\\n", len(ciphertext))

	// 3. Decrypt with Private Key
	decrypted, err := rsa.DecryptOAEP(sha256.New(), rand.Reader, privateKey, ciphertext, label)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Decrypted message: %s\\n", string(decrypted))
}`,
    exercise: `package main

import "fmt"

// TASK: Implement GreatestCommonDivisor (GCD) using the Euclidean Algorithm.
// Used to verify that public exponent e is coprime to totient phi: gcd(e, phi) == 1.
func GCD(a, b int64) int64 {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}

func main() {
	e := int64(17)
	phi := int64(3120)
	g := GCD(e, phi)

	fmt.Printf("GCD(%d, %d) = %d\\n", e, phi, g)
	if g == 1 {
		fmt.Printf("SUCCESS: %d and %d are coprime (valid public exponent)!\\n", e, phi)
	}
}`
  }
}

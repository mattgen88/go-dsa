export const merkleTreeTopic = {
  id: 'sha256-merkle-tree',
  title: 'SHA-256 & Merkle Trees',
  category: 'cryptography',
  difficulty: 'Intermediate',
  icon: 'ShieldCheck',
  summary: 'Cryptographic hashing using Secure Hash Algorithm 256-bit (SHA-256) and Merkle Tree hierarchical verification in Git, Bitcoin, and Certificate Transparency.',
  timeComplexity: {
    'SHA-256 Block': 'O(n) where n is byte length',
    'Merkle Tree Build': 'O(N) for N data blocks',
    'Merkle Proof Verify': 'O(log N) hashes',
    'Tamper Detection': 'O(1) root hash comparison',
    'Space': 'O(N)'
  },
  keyPoints: [
    'Secure Hash Algorithm 256-bit (SHA-256): A cryptographic hash function published by the National Institute of Standards and Technology (NIST) that produces a deterministic, irreversible 256-bit (32-byte) digest.',
    'Avalanche Effect: A minor modification of even a single bit in the input produces an entirely different, uncorrelated hash digest.',
    'Merkle Tree (Hash Tree): A binary tree structure where each leaf node contains the cryptographic hash of a raw data block, and every non-leaf parent node stores the hash of its concatenated children.',
    'Merkle Proofs: A client can prove that a specific transaction exists in a block of size N by verifying only log₂(N) intermediate sibling hashes, without downloading the entire dataset.',
    'Real-World Systems: Git commits and objects, Bitcoin and Ethereum blockchain blocks, InterPlanetary File System (IPFS), and TLS Certificate Transparency logs.'
  ],
  goInternals: `// In Go, SHA-256 is implemented in standard package "crypto/sha256":
import "crypto/sha256"

// sha256.Sum256 returns an immutable [32]byte array:
digest := sha256.Sum256([]byte("data payload"))
hexString := hex.EncodeToString(digest[:])`,
  visualizerType: 'merkle',
  codeSamples: {
    core: `package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

// ComputeSHA256 returns hex-encoded digest of data
func ComputeSHA256(data string) string {
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}

// MerkleNode represents a node in the cryptographic hash tree
type MerkleNode struct {
	Hash  string
	Left  *MerkleNode
	Right *MerkleNode
}

// BuildMerkleTree builds a Merkle Tree from raw data blocks
func BuildMerkleTree(dataBlocks []string) *MerkleNode {
	if len(dataBlocks) == 0 {
		return nil
	}

	// 1. Create leaf nodes with SHA-256 digests of raw data
	var nodes []*MerkleNode
	for _, block := range dataBlocks {
		nodes = append(nodes, &MerkleNode{Hash: ComputeSHA256(block)})
	}

	// If odd number of leaves, duplicate the last leaf
	if len(nodes)%2 != 0 {
		nodes = append(nodes, nodes[len(nodes)-1])
	}

	// 2. Iteratively hash pairs of nodes until only the root remains
	for len(nodes) > 1 {
		var nextLevel []*MerkleNode
		for i := 0; i < len(nodes); i += 2 {
			combinedHash := ComputeSHA256(nodes[i].Hash + nodes[i+1].Hash)
			parent := &MerkleNode{
				Hash:  combinedHash,
				Left:  nodes[i],
				Right: nodes[i+1],
			}
			nextLevel = append(nextLevel, parent)
		}
		nodes = nextLevel
	}

	return nodes[0] // Merkle Root
}

func main() {
	transactions := []string{
		"Tx1: Alice sends 1.5 BTC to Bob",
		"Tx2: Bob sends 0.4 BTC to Charlie",
		"Tx3: Charlie sends 0.1 BTC to Dave",
		"Tx4: Dave sends 2.0 BTC to Eve",
	}

	fmt.Println("=== 1. Building Merkle Tree from Transactions ===")
	tree := BuildMerkleTree(transactions)
	fmt.Printf("Top Merkle Root Hash:\\n  %s\\n\\n", tree.Hash)

	fmt.Println("=== 2. Avalanche Effect & Tamper Detection ===")
	// Modify a single character in transaction 2
	tamperedTransactions := []string{
		"Tx1: Alice sends 1.5 BTC to Bob",
		"Tx2: Bob sends 999 BTC to Hacker", // Tampered!
		"Tx3: Charlie sends 0.1 BTC to Dave",
		"Tx4: Dave sends 2.0 BTC to Eve",
	}
	tamperedTree := BuildMerkleTree(tamperedTransactions)
	fmt.Printf("Tampered Merkle Root Hash:\\n  %s\\n\\n", tamperedTree.Hash)

	if tree.Hash != tamperedTree.Hash {
		fmt.Println("INTEGRITY CHECK FAILED: Root hash mismatch! Tampering successfully caught.")
	}
}`,
    practical: `package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

func hash(s string) string {
	h := sha256.Sum256([]byte(s))
	return hex.EncodeToString(h[:])
}

// MerkleProof: Verifying inclusion of Tx1 without full tree
// To verify Tx1, client only needs: Tx1 data, sibling Hash(Tx2), and uncle Hash(Tx3+Tx4)
func VerifyProof(tx string, siblingHash string, uncleHash string, expectedRoot string) bool {
	hTx := hash(tx)
	hParent := hash(hTx + siblingHash)
	calculatedRoot := hash(hParent + uncleHash)
	return calculatedRoot == expectedRoot
}

func main() {
	tx1 := "Tx1: Alice sends 1.5 BTC to Bob"
	tx2 := "Tx2: Bob sends 0.4 BTC to Charlie"
	tx3 := "Tx3: Charlie sends 0.1 BTC to Dave"
	tx4 := "Tx4: Dave sends 2.0 BTC to Eve"

	h1 := hash(tx1)
	h2 := hash(tx2)
	h3 := hash(tx3)
	h4 := hash(tx4)

	h12 := hash(h1 + h2)
	h34 := hash(h3 + h4)
	merkleRoot := hash(h12 + h34)

	// Lightweight verification with only 2 intermediate hashes
	valid := VerifyProof(tx1, h2, h34, merkleRoot)
	fmt.Printf("Lightweight Merkle Proof Verification for '%s': %t (Expected: true)\\n", 
		tx1, valid)
}`,
    exercise: `package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

// TASK: Implement HashPair.
// Given two 64-character hex strings, concatenate them and return the SHA-256 hex digest.
func HashPair(leftHex, rightHex string) string {
	combined := leftHex + rightHex
	digest := sha256.Sum256([]byte(combined))
	return hex.EncodeToString(digest[:])
}

func main() {
	h1 := "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
	h2 := "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"

	result := HashPair(h1, h2)
	fmt.Printf("Combined HashPair result: %s\\n", result)
	if len(result) == 64 {
		fmt.Println("SUCCESS: Valid 256-bit (64 hex char) digest generated!")
	}
}`
  }
}

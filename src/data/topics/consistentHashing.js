export const consistentHashingTopic = {
  id: 'consistent-hashing',
  title: 'Consistent Hashing & Virtual Nodes',
  category: 'distributed',
  difficulty: 'Advanced',
  icon: 'Server',
  summary: 'Distributed hash ring routing used in Amazon DynamoDB, Apache Cassandra, Discord, and Envoy load balancers.',
  timeComplexity: {
    'Key Routing': 'O(log N) via binary search on ring',
    'Node Addition': 'O(K / N) key migration',
    'Node Removal': 'O(K / N) key migration',
    'Space': 'O(N * V) where V is virtual nodes'
  },
  keyPoints: [
    'Traditional hashing `hash(key) % N` causes nearly 100% of keys to migrate when a single node $N$ is added or removed, crashing downstream caches in a thundering herd.',
    'Consistent Hashing places both Nodes and Keys on a circular ring ($0 \dots 2^{32}-1$). A key maps to the **first server encountered clockwise**.',
    'When a server joins or leaves, **only keys between it and its predecessor migrate** ($K/N$ on average).',
    'Virtual Nodes (Vnodes): Each physical server receives multiple replica hashes on the ring (e.g. `nodeA#1`, `nodeA#2`), ensuring even load distribution without hot spots.'
  ],
  goInternals: `// In Go, binary search on sorted ring of uint32 hashes:
idx := sort.Search(len(ring.keys), func(i int) bool {
    return ring.keys[i] >= keyHash
})
if idx == len(ring.keys) {
    idx = 0 // wrap around circle
}`,
  visualizerType: 'consistent-hashing',
  codeSamples: {
    core: `package main

import (
	"fmt"
	"hash/fnv"
	"sort"
	"strconv"
)

type HashRing struct {
	virtualReplicas int
	ring            []uint32          // sorted hash tokens
	nodeMap         map[uint32]string // token -> physical node ID
}

func NewHashRing(replicas int) *HashRing {
	return &HashRing{
		virtualReplicas: replicas,
		nodeMap:         make(map[uint32]string),
	}
}

func hashStr(key string) uint32 {
	h := fnv.New32a()
	h.Write([]byte(key))
	return h.Sum32()
}

// AddNode adds physical server with multiple virtual tokens on ring
func (hr *HashRing) AddNode(node string) {
	for i := 0; i < hr.virtualReplicas; i++ {
		vtoken := hashStr(node + "#" + strconv.Itoa(i))
		hr.ring = append(hr.ring, vtoken)
		hr.nodeMap[vtoken] = node
	}
	sort.Slice(hr.ring, func(i, j int) bool {
		return hr.ring[i] < hr.ring[j]
	})
}

// GetNode routes key clockwise to nearest node
func (hr *HashRing) GetNode(key string) string {
	if len(hr.ring) == 0 {
		return ""
	}
	h := hashStr(key)

	// Binary search for first node token >= h
	idx := sort.Search(len(hr.ring), func(i int) bool {
		return hr.ring[i] >= h
	})

	// Wrap around ring if beyond the largest token
	if idx == len(hr.ring) {
		idx = 0
	}

	return hr.nodeMap[hr.ring[idx]]
}

func main() {
	// Ring with 3 virtual replicas per node
	ring := NewHashRing(3)
	ring.AddNode("Server-A")
	ring.AddNode("Server-B")
	ring.AddNode("Server-C")

	keys := []string{"user:101", "user:204", "order:88", "session:abc", "video:99"}
	fmt.Println("Initial Key Routing Across 3 Servers:")
	for _, k := range keys {
		fmt.Printf("  %-12s -> %s\\n", k, ring.GetNode(k))
	}

	fmt.Println("\\nAdding Server-D to ring...")
	ring.AddNode("Server-D")

	fmt.Println("Re-routed Keys after Adding Server-D:")
	for _, k := range keys {
		fmt.Printf("  %-12s -> %s\\n", k, ring.GetNode(k))
	}
}`,
    practical: `package main

import (
	"fmt"
	"hash/fnv"
)

// Demonstrates the disaster of traditional Modulo Hashing vs Consistent Hashing
func main() {
	keys := make([]string, 1000)
	for i := 0; i < 1000; i++ {
		keys[i] = fmt.Sprintf("key-%d", i)
	}

	// 1. Modulo Hashing with 10 servers vs 11 servers
	reassignedMod := 0
	for _, k := range keys {
		h := fnv.New32a()
		h.Write([]byte(k))
		val := int(h.Sum32())

		serverBefore := val % 10
		serverAfter := val % 11
		if serverBefore != serverAfter {
			reassignedMod++
		}
	}

	fmt.Println("=== Cache Rebalance Impact (1,000 Keys) ===")
	fmt.Printf("Modulo Hashing:      %d / 1000 keys (%.1f%%) migrated! (Cache wiped!)\\n", 
		reassignedMod, float64(reassignedMod)/10.0)
	fmt.Printf("Consistent Hashing:  ~%d / 1000 keys (%.1f%%) migrated! (Minimal rebalance)\\n", 
		1000/11, 100.0/11.0)
}`,
    exercise: `package main

import "fmt"

// TASK: Implement ClockwiseLookup on sorted slice of uint32 tokens
func ClockwiseLookup(ring []uint32, target uint32) uint32 {
	if len(ring) == 0 {
		return 0
	}
	low, high := 0, len(ring)-1
	ans := ring[0] // wrap around fallback

	for low <= high {
		mid := low + (high-low)/2
		if ring[mid] >= target {
			ans = ring[mid]
			high = mid - 1 // try smaller clockwise token
		} else {
			low = mid + 1
		}
	}
	return ans
}

func main() {
	ring := []uint32{100, 300, 700, 950}
	token := ClockwiseLookup(ring, 250)
	fmt.Printf("Lookup 250 on ring %v -> found token: %d (Expected: 300)\\n", ring, token)
	if token == 300 {
		fmt.Println("SUCCESS: Clockwise routing passed!")
	}
}`
  }
}

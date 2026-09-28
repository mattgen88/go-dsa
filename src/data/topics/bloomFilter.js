export const bloomFilterTopic = {
  id: 'bloom-filter',
  title: 'Bloom Filters in Storage Engines',
  category: 'databases',
  difficulty: 'Intermediate',
  icon: 'Database',
  summary: 'Space-efficient probabilistic data structure used in RocksDB, Cassandra, and Postgres to prevent unnecessary disk I/O.',
  timeComplexity: {
    'Insert': 'O(k) where k is hash count',
    'Lookup': 'O(k)',
    'Space': 'O(m) bits',
    'False Positives': 'Possible (tunable)',
    'False Negatives': '0% (Never)'
  },
  keyPoints: [
    'A Bloom Filter is a bit array of size $m$ paired with $k$ independent hash functions.',
    'Fundamental Guarantee: It can report **"Definitely NOT in set"** (100% true negative) or **"PROBABLY in set"** (small tunable false positive rate).',
    'Database Optimization: RocksDB and Cassandra check the Bloom filter in RAM before reading an SSTable from NVMe/SSD disk, saving millions of costly disk seek operations.',
    'Deletions cannot be performed on standard Bloom filters (clearing a bit could delete other keys sharing that bit).'
  ],
  goInternals: `// Idiomatic Bitset in Go:
type BloomFilter struct {
    bits    []uint64 // bitset backed by 64-bit words
    size    uint64   // total bits m
    numHash int      // number of hash functions k
}`,
  visualizerType: 'bloom-filter',
  codeSamples: {
    core: `package main

import (
	"fmt"
	"hash/fnv"
)

type BloomFilter struct {
	bitset  []bool
	size    uint32
	numHash uint32
}

func NewBloomFilter(size, numHash uint32) *BloomFilter {
	return &BloomFilter{
		bitset:  make([]bool, size),
		size:    size,
		numHash: numHash,
	}
}

// hash returns the bit index for the i-th hash iteration
func (bf *BloomFilter) hash(data string, seed uint32) uint32 {
	h := fnv.New32a()
	h.Write([]byte(data))
	// Combine FNV hash with seed
	return (h.Sum32() + seed*0x9e3779b9) % bf.size
}

// Add sets k bits for the string
func (bf *BloomFilter) Add(item string) {
	for i := uint32(0); i < bf.numHash; i++ {
		idx := bf.hash(item, i)
		bf.bitset[idx] = true
	}
}

// Contains checks if item might be present
func (bf *BloomFilter) Contains(item string) bool {
	for i := uint32(0); i < bf.numHash; i++ {
		idx := bf.hash(item, i)
		if !bf.bitset[idx] {
			return false // Definitely NOT in set!
		}
	}
	return true // Probably in set!
}

func main() {
	bf := NewBloomFilter(32, 3)

	elements := []string{"account:101", "account:102", "order:550"}
	fmt.Println("Adding to Bloom Filter:", elements)
	for _, el := range elements {
		bf.Add(el)
	}

	testCases := []string{"account:101", "order:550", "account:999", "hacker:404"}
	fmt.Println("\\nTesting Membership:")
	for _, tc := range testCases {
		exists := bf.Contains(tc)
		if exists {
			fmt.Printf("  %-12s -> PROBABLY in set (Proceed to read disk)\\n", tc)
		} else {
			fmt.Printf("  %-12s -> DEFINITELY NOT in set (Saved disk I/O!)\\n", tc)
		}
	}
}`,
    practical: `package main

import (
	"fmt"
	"math"
)

// CalculateOptimalParams computes optimal bit size m and hash count k
// given expected elements n and acceptable false positive rate p.
func CalculateOptimalParams(n int, p float64) (m uint32, k uint32) {
	// m = - (n * ln(p)) / (ln(2)^2)
	mFloat := -float64(n) * math.Log(p) / math.Pow(math.Log(2), 2)
	// k = (m / n) * ln(2)
	kFloat := (mFloat / float64(n)) * math.Log(2)

	return uint32(math.Ceil(mFloat)), uint32(math.Ceil(kFloat))
}

func main() {
	// For 1,000,000 database keys with 1% false positive rate (0.01)
	n := 1000000
	p := 0.01

	m, k := CalculateOptimalParams(n, p)
	bytesNeeded := m / 8 / 1024 / 1024 // Megabytes

	fmt.Printf("For %d keys with %.1f%% false positive rate:\\n", n, p*100)
	fmt.Printf("  Optimal bit size m: %d bits (~%d MB in RAM)\\n", m, bytesNeeded+1)
	fmt.Printf("  Optimal hash functions k: %d\\n", k)
}`,
    exercise: `package main

import "fmt"

// TASK: Implement CountingBloomFilter item removal.
// A counting bloom filter replaces single bits with 4-bit counters,
// allowing deletions!
type CountingBloomFilter struct {
	counts []int
	size   int
}

func NewCounting(size int) *CountingBloomFilter {
	return &CountingBloomFilter{counts: make([]int, size), size: size}
}

func (c *CountingBloomFilter) Add(hashIdx int) {
	c.counts[hashIdx%c.size]++
}

func (c *CountingBloomFilter) Remove(hashIdx int) bool {
	idx := hashIdx % c.size
	if c.counts[idx] > 0 {
		c.counts[idx]--
		return true
	}
	return false
}

func main() {
	cbf := NewCounting(8)
	cbf.Add(3)
	fmt.Printf("Count at index 3: %d\\n", cbf.counts[3])

	cbf.Remove(3)
	fmt.Printf("Count at index 3 after removal: %d\\n", cbf.counts[3])
	if cbf.counts[3] == 0 {
		fmt.Println("SUCCESS: Counting bloom filter correctly decremented slot!")
	}
}`
  }
}

export const hashMapsTopic = {
  id: 'hash-maps',
  title: 'Hash Tables & Go Maps',
  category: 'linear-structures',
  difficulty: 'Beginner',
  icon: 'Hash',
  summary: 'Deep dive into Go map internals (hmap, buckets, overflow), collision resolution, and custom hash tables.',
  timeComplexity: {
    access: 'O(1) avg / O(n) worst',
    search: 'O(1) avg / O(n) worst',
    insertion: 'O(1) avg / O(n) worst',
    deletion: 'O(1) avg / O(n) worst',
    space: 'O(n)'
  },
  keyPoints: [
    'Go built-in `map[K]V` is a pointer to an `hmap` struct holding an array of buckets (`bmap`).',
    'Each bucket holds up to 8 key-value pairs; if more collide, an overflow bucket is linked.',
    'Map iteration order in Go is randomized intentionally by the runtime to prevent reliance on order.',
    'Go maps are NOT safe for concurrent goroutine access—use `sync.RWMutex` or `sync.Map` for concurrent writes.'
  ],
  goInternals: `// Conceptual anatomy of Go runtime hmap:
type hmap struct {
    count     int            // number of live elements
    flags     uint8
    B         uint8          // log_2 of number of buckets (2^B buckets)
    hash0     uint32         // random hash seed
    buckets   unsafe.Pointer // array of 2^B Buckets
    oldbuckets unsafe.Pointer// prior bucket array during incremental evacuation
}

// Comma-ok idiom check:
if val, exists := myMap[key]; exists {
    // key is present!
}`,
  visualizerType: 'hash-map',
  codeSamples: {
    core: `package main

import (
	"fmt"
	"hash/fnv"
)

// Simple custom Hash Table to demonstrate bucket hashing & chaining
type KeyValue struct {
	Key   string
	Value string
}

type HashTable struct {
	buckets [][]KeyValue
	size    int
}

func NewHashTable(capacity int) *HashTable {
	return &HashTable{
		buckets: make([][]KeyValue, capacity),
		size:    capacity,
	}
}

func (ht *HashTable) hash(key string) int {
	h := fnv.New32a()
	h.Write([]byte(key))
	return int(h.Sum32()) % ht.size
}

func (ht *HashTable) Put(key, val string) {
	idx := ht.hash(key)
	bucket := ht.buckets[idx]

	// Update if key exists
	for i, kv := range bucket {
		if kv.Key == key {
			bucket[i].Value = val
			return
		}
	}
	// Append new pair
	ht.buckets[idx] = append(ht.buckets[idx], KeyValue{Key: key, Value: val})
}

func (ht *HashTable) Get(key string) (string, bool) {
	idx := ht.hash(key)
	for _, kv := range ht.buckets[idx] {
		if kv.Key == key {
			return kv.Value, true
		}
	}
	return "", false
}

func main() {
	fmt.Println("=== 1. Go Built-in Map Idioms ===")
	inventory := make(map[string]int)
	inventory["gopher"] = 42
	inventory["ferris"] = 12

	// Comma-ok idiom
	if count, ok := inventory["gopher"]; ok {
		fmt.Printf("Found gopher: %d in stock\\n", count)
	}

	delete(inventory, "ferris")
	fmt.Printf("Map size after delete: %d\\n\\n", len(inventory))

	fmt.Println("=== 2. Custom Hash Table Demo ===")
	ht := NewHashTable(5)
	ht.Put("user:1", "Alice")
	ht.Put("user:2", "Bob")
	ht.Put("user:3", "Charlie")
	ht.Put("user:6", "Diana (Potential collision)")

	for i, b := range ht.buckets {
		fmt.Printf("Bucket %d: %v\\n", i, b)
	}

	val, found := ht.Get("user:2")
	fmt.Printf("Get user:2 -> %s (found: %t)\\n", val, found)
}`,
    practical: `package main

import "fmt"

// TwoSum finds indices of two numbers such that they add up to target.
// Time: O(n), Space: O(n) using a hash map lookup.
func TwoSum(nums []int, target int) []int {
	seen := make(map[int]int, len(nums)) // val -> index

	for currIdx, num := range nums {
		diff := target - num
		if prevIdx, found := seen[diff]; found {
			return []int{prevIdx, currIdx}
		}
		seen[num] = currIdx
	}
	return nil
}

func main() {
	nums := []int{2, 7, 11, 15}
	target := 9

	indices := TwoSum(nums, target)
	fmt.Printf("Nums: %v, Target: %d\\n", nums, target)
	fmt.Printf("Result indices: %v (values: %d + %d = %d)\\n",
		indices, nums[indices[0]], nums[indices[1]], target)
}`,
    exercise: `package main

import (
	"fmt"
	"sort"
	"strings"
)

// TASK: Implement GroupAnagrams.
// Given an array of strings, group the anagrams together in any order.
func GroupAnagrams(strs []string) [][]string {
	groups := make(map[string][]string)

	for _, s := range strs {
		// Create a sorted character signature
		chars := strings.Split(s, "")
		sort.Strings(chars)
		key := strings.Join(chars, "")

		groups[key] = append(groups[key], s)
	}

	result := make([][]string, 0, len(groups))
	for _, group := range groups {
		result = append(result, group)
	}
	return result
}

func main() {
	words := []string{"eat", "tea", "tan", "ate", "nat", "bat"}
	grouped := GroupAnagrams(words)

	fmt.Println("Input words:", words)
	fmt.Println("Grouped anagrams:")
	for _, g := range grouped {
		fmt.Printf("  %v\\n", g)
	}

	if len(grouped) == 3 {
		fmt.Println("SUCCESS: Correctly partitioned into 3 anagram groups!")
	}
}`
  }
}

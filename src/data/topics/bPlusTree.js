export const bPlusTreeTopic = {
  id: 'b-plus-tree',
  title: 'B+ Trees & Database Indexing',
  category: 'databases',
  difficulty: 'Advanced',
  icon: 'Database',
  summary: 'The primary indexing data structure of relational databases (MySQL InnoDB, PostgreSQL, SQLite) enabling fast range scans.',
  timeComplexity: {
    'Search': 'O(log_B n)',
    'Range Scan': 'O(log_B n + k)',
    'Insert': 'O(log_B n)',
    'Delete': 'O(log_B n)'
  },
  keyPoints: [
    'A B+ Tree is a self-balancing, multi-way search tree where internal nodes contain only routing keys, and **all actual data pointers reside in leaf nodes**.',
    'Leaves are linked sequentially in a doubly-linked list, allowing fast range queries (`WHERE id BETWEEN 10 AND 50`) without re-traversing the root.',
    'High Fan-Out ($B = 100 \dots 1000$ keys per node) matches disk/SSD block page sizes (typically 4KB–16KB), keeping tree height low (3–4 levels for millions of rows).',
    'Node splits: When a leaf reaches capacity $M$, it splits into two halves, and copies its middle key to the parent node.'
  ],
  goInternals: `// Conceptual B+ Tree Node in Go:
type BPlusNode struct {
    isLeaf   bool
    keys     []int
    children []*BPlusNode // for internal nodes
    values   []string     // for leaf nodes
    next     *BPlusNode   // linked list pointer across leaves!
}`,
  visualizerType: 'tree',
  codeSamples: {
    core: `package main

import (
	"fmt"
	"sort"
)

// MiniBPlusTree demonstrating internal routing vs leaf chained range scans
type LeafNode struct {
	keys   []int
	values []string
	next   *LeafNode // sequential pointer to next leaf
}

type BPlusTree struct {
	root     *LeafNode
	leafHead *LeafNode
}

func NewBPlusTree() *BPlusTree {
	leaf := &LeafNode{}
	return &BPlusTree{
		root:     leaf,
		leafHead: leaf,
	}
}

// Insert into leaf (simplified single/split demo)
func (t *BPlusTree) Insert(key int, val string) {
	curr := t.root

	// Find insertion position
	idx := sort.SearchInts(curr.keys, key)
	if idx < len(curr.keys) && curr.keys[idx] == key {
		curr.values[idx] = val
		return
	}

	curr.keys = append(curr.keys, 0)
	curr.values = append(curr.values, "")
	copy(curr.keys[idx+1:], curr.keys[idx:])
	copy(curr.values[idx+1:], curr.values[idx:])
	curr.keys[idx] = key
	curr.values[idx] = val
}

// RangeScan traverses sequentially via leaf.next pointers
// Time: O(log n + k) where k is number of items in range
func (t *BPlusTree) RangeScan(minKey, maxKey int) []string {
	var results []string
	curr := t.leafHead

	for curr != nil {
		for i, k := range curr.keys {
			if k >= minKey && k <= maxKey {
				results = append(results, fmt.Sprintf("[%d: %s]", k, curr.values[i]))
			}
			if k > maxKey {
				return results // Done with range!
			}
		}
		curr = curr.next
	}
	return results
}

func main() {
	bpt := NewBPlusTree()

	// Insert primary key records
	bpt.Insert(10, "Alice")
	bpt.Insert(20, "Bob")
	bpt.Insert(25, "Charlie")
	bpt.Insert(30, "David")
	bpt.Insert(45, "Emma")
	bpt.Insert(50, "Frank")

	fmt.Println("=== B+ Tree Range Scan Demonstration ===")
	fmt.Println("Query: SELECT * WHERE key BETWEEN 20 AND 45")
	rangeResults := bpt.RangeScan(20, 45)
	for _, row := range rangeResults {
		fmt.Printf("  %s\\n", row)
	}
	// Expected: Bob, Charlie, David, Emma
}`,
    practical: `package main

import "fmt"

// Explains how relational database engines calculate B+ Tree Depth
func CalculateTreeCapacity(branchingFactor, depth int) int {
	total := 1
	for i := 0; i < depth; i++ {
		total *= branchingFactor
	}
	return total
}

func main() {
	// A 16KB InnoDB database page holds ~1,000 keys (branching factor B = 1000)
	b := 1000

	fmt.Println("InnoDB 16KB Page B+ Tree Scaling:")
	for depth := 1; depth <= 4; depth++ {
		records := CalculateTreeCapacity(b, depth)
		fmt.Printf("  Depth %d: holds up to %'d records in just %d disk seeks!\\n", 
			depth, records, depth)
	}
}`,
    exercise: `package main

import "fmt"

// TASK: Implement LeafSearch.
// Locate index of key in a sorted leaf node using binary search.
func LeafSearch(keys []int, target int) (int, bool) {
	low, high := 0, len(keys)-1
	for low <= high {
		mid := low + (high-low)/2
		if keys[mid] == target {
			return mid, true
		} else if keys[mid] < target {
			low = mid + 1
		} else {
			high = mid - 1
		}
	}
	return -1, false
}

func main() {
	keys := []int{5, 12, 18, 24, 31, 47}
	idx, found := LeafSearch(keys, 24)
	fmt.Printf("LeafSearch 24: index=%d, found=%t\\n", idx, found)
	if found && idx == 3 {
		fmt.Println("SUCCESS: Leaf key found!")
	}
}`
  }
}

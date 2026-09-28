export const lsmTreeTopic = {
  id: 'lsm-tree',
  title: 'LSM-Trees, WAL & SSTables',
  category: 'databases',
  difficulty: 'Advanced',
  icon: 'Database',
  summary: 'Write-optimized storage engine architecture powering RocksDB, Cassandra, CockroachDB, and LevelDB.',
  timeComplexity: {
    'Write (Append)': 'O(1) sequential I/O',
    'MemTable Insert': 'O(log n)',
    'Read (Point)': 'O(log n) to O(levels)',
    'Compaction': 'O(n) merge sort'
  },
  keyPoints: [
    'Traditional B-Trees perform random writes on disk (slow for HDDs/SSDs). LSM-Trees convert all writes into fast **sequential appends**.',
    'Write Path: (1) Append entry to disk Write-Ahead Log (WAL) for crash recovery -> (2) Insert into in-memory sorted **MemTable** -> ACK client.',
    'Flushing: When MemTable fills, it freezes into an immutable table and flushes sequentially to disk as a **Sorted String Table (SSTable)**.',
    'Compaction: Background worker goroutines periodically merge-sort overlapping SSTables into new levels, discarding overwritten values and tombstones.'
  ],
  goInternals: `// Conceptual LSM Architecture in Go:
type LSMTree struct {
    wal      *os.File          // sequential append-only log
    memTable map[string]string // in-memory sorted map/skiplist
    ssTables [][]KeyValuePair // disk-backed sorted runs
    mu       sync.RWMutex
}`,
  visualizerType: 'array',
  codeSamples: {
    core: `package main

import (
	"fmt"
	"sort"
	"sync"
)

type KeyValue struct {
	Key       string
	Value     string
	Tombstone bool // For deletions
}

// MiniLSM demonstrates the core components of an LSM-Tree:
// 1. MemTable (RAM)
// 2. WAL simulation
// 3. Immutable flushed SSTables (Disk runs)
type MiniLSM struct {
	mu           sync.RWMutex
	memTable     map[string]KeyValue
	memTableSize int
	maxMemSize   int
	ssTables     [][]KeyValue // Simulated immutable disk SSTable runs
}

func NewMiniLSM(maxMemSize int) *MiniLSM {
	return &MiniLSM{
		memTable:   make(map[string]KeyValue),
		maxMemSize: maxMemSize,
	}
}

// Put writes sequentially to WAL and MemTable
func (lsm *MiniLSM) Put(key, val string) {
	lsm.mu.Lock()
	defer lsm.mu.Unlock()

	// 1. Log to WAL (Simulated)
	fmt.Printf("[WAL] Appending: SET %s = %s\\n", key, val)

	// 2. Insert into MemTable
	lsm.memTable[key] = KeyValue{Key: key, Value: val}
	lsm.memTableSize++

	// 3. Check if MemTable reached threshold -> Flush to SSTable
	if lsm.memTableSize >= lsm.maxMemSize {
		lsm.flushMemTable()
	}
}

// Delete writes a tombstone record
func (lsm *MiniLSM) Delete(key string) {
	lsm.mu.Lock()
	defer lsm.mu.Unlock()

	fmt.Printf("[WAL] Appending: DELETE %s (Tombstone)\\n", key)
	lsm.memTable[key] = KeyValue{Key: key, Tombstone: true}
	lsm.memTableSize++

	if lsm.memTableSize >= lsm.maxMemSize {
		lsm.flushMemTable()
	}
}

func (lsm *MiniLSM) flushMemTable() {
	fmt.Println(" -> [FLUSH] MemTable reached limit. Flushing sorted SSTable to disk...")

	// Sort memtable entries
	var sorted []KeyValue
	for _, kv := range lsm.memTable {
		sorted = append(sorted, kv)
	}
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Key < sorted[j].Key
	})

	lsm.ssTables = append(lsm.ssTables, sorted)
	lsm.memTable = make(map[string]KeyValue) // Fresh empty MemTable
	lsm.memTableSize = 0
}

// Get checks MemTable first (newest), then scans SSTables from newest to oldest
func (lsm *MiniLSM) Get(key string) (string, bool) {
	lsm.mu.RLock()
	defer lsm.mu.RUnlock()

	// 1. Check in-memory MemTable
	if kv, ok := lsm.memTable[key]; ok {
		if kv.Tombstone {
			return "", false // Deleted by tombstone
		}
		return kv.Value, true
	}

	// 2. Check SSTables from newest to oldest
	for i := len(lsm.ssTables) - 1; i >= 0; i-- {
		sstable := lsm.ssTables[i]
		// Binary search on sorted SSTable
		idx := sort.Search(len(sstable), func(j int) bool {
			return sstable[j].Key >= key
		})
		if idx < len(sstable) && sstable[idx].Key == key {
			if sstable[idx].Tombstone {
				return "", false
			}
			return sstable[idx].Value, true
		}
	}

	return "", false
}

func main() {
	lsm := NewMiniLSM(2) // Flushes every 2 entries

	fmt.Println("=== 1. Writes and Flushes ===")
	lsm.Put("user:1", "Alice")
	lsm.Put("user:2", "Bob")     // Triggers flush to SSTable-0!
	lsm.Put("user:3", "Charlie")
	lsm.Put("user:1", "Alice-Updated") // Triggers flush to SSTable-1!

	fmt.Println("\\n=== 2. Reads Across MemTable and SSTables ===")
	val1, _ := lsm.Get("user:1")
	fmt.Printf("Get 'user:1': %s (Expected: Alice-Updated)\\n", val1)

	val2, _ := lsm.Get("user:2")
	fmt.Printf("Get 'user:2': %s (Expected: Bob)\\n", val2)

	fmt.Println("\\n=== 3. Deletions (Tombstones) ===")
	lsm.Delete("user:2")
	_, found := lsm.Get("user:2")
	fmt.Printf("Get 'user:2' after tombstone: found=%t\\n", found)
}`,
    practical: `package main

import (
	"fmt"
	"sort"
)

type Record struct {
	Key string
	Val string
}

// CompactSSTables merges two sorted SSTables into one, removing older duplicate keys
func CompactSSTables(table1, table2 []Record) []Record {
	mergedMap := make(map[string]string)

	// Older table first
	for _, r := range table1 {
		mergedMap[r.Key] = r.Val
	}
	// Newer table overwrites older keys!
	for _, r := range table2 {
		mergedMap[r.Key] = r.Val
	}

	var compacted []Record
	for k, v := range mergedMap {
		compacted = append(compacted, Record{Key: k, Val: v})
	}
	sort.Slice(compacted, func(i, j int) bool {
		return compacted[i].Key < compacted[j].Key
	})
	return compacted
}

func main() {
	sstable0 := []Record{{"a", "1"}, {"b", "2"}, {"c", "3"}}
	sstable1 := []Record{{"b", "20 (updated)"}, {"d", "4"}}

	fmt.Println("SSTable 0 (Old):", sstable0)
	fmt.Println("SSTable 1 (New):", sstable1)

	compacted := CompactSSTables(sstable0, sstable1)
	fmt.Println("\\nCompacted Output:", compacted)
}`,
    exercise: `package main

import "fmt"

// TASK: Implement BinarySearchSSTable.
// Given a sorted slice of key-value records, locate the value for target key.
type KV struct {
	Key string
	Val string
}

func BinarySearchSSTable(records []KV, targetKey string) (string, bool) {
	low, high := 0, len(records)-1

	for low <= high {
		mid := low + (high-low)/2
		if records[mid].Key == targetKey {
			return records[mid].Val, true
		} else if records[mid].Key < targetKey {
			low = mid + 1
		} else {
			high = mid - 1
		}
	}
	return "", false
}

func main() {
	sstable := []KV{{"alpha", "10"}, {"beta", "20"}, {"gamma", "30"}}
	val, found := BinarySearchSSTable(sstable, "beta")
	fmt.Printf("Search 'beta' -> %s (found: %t)\\n", val, found)
	if found && val == "20" {
		fmt.Println("SUCCESS: SSTable binary search matched correctly!")
	}
}`
  }
}

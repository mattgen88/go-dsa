export const lruCacheTopic = {
  id: 'lru-cache',
  title: 'LRU Cache (Hash Map + DLL)',
  category: 'interview-prep',
  difficulty: 'Intermediate',
  icon: 'Layers',
  summary: 'The #1 most frequently asked interview systems problem: O(1) Get and Put using Hash Map and Doubly Linked List.',
  timeComplexity: {
    'Get(key)': 'O(1)',
    'Put(key, val)': 'O(1)',
    'Eviction': 'O(1)',
    'Space': 'O(capacity)'
  },
  keyPoints: [
    'Combines two data structures: a Hash Map for O(1) key lookups, and a Doubly Linked List to maintain temporal access order in O(1).',
    'Head sentinel represents Most Recently Used (MRU), Tail sentinel represents Least Recently Used (LRU).',
    'On `Get(key)`: If key exists, detach node from its position and move it to Head (MRU).',
    'On `Put(key, val)`: If key exists, update value and move to Head. If new and capacity is reached, evict `tail.Prev` (LRU) and delete from map.'
  ],
  goInternals: `// Idiomatic Go LRU Cache with Dummy Sentinels:
type Node struct {
    key, val   int
    prev, next *Node
}

type LRUCache struct {
    capacity   int
    cache      map[int]*Node
    head, tail *Node // sentinels eliminate nil checks!
}`,
  visualizerType: 'lru',
  codeSamples: {
    core: `package main

import "fmt"

type Node struct {
	key, val   int
	prev, next *Node
}

type LRUCache struct {
	capacity int
	cache    map[int]*Node
	head     *Node // Dummy MRU head
	tail     *Node // Dummy LRU tail
}

func Constructor(capacity int) LRUCache {
	head := &Node{}
	tail := &Node{}
	head.next = tail
	tail.prev = head

	return LRUCache{
		capacity: capacity,
		cache:    make(map[int]*Node),
		head:     head,
		tail:     tail,
	}
}

// removeNode removes an existing node from the linked list
func (c *LRUCache) removeNode(node *Node) {
	node.prev.next = node.next
	node.next.prev = node.prev
}

// addToHead inserts a node right after head sentinel (MRU position)
func (c *LRUCache) addToHead(node *Node) {
	node.next = c.head.next
	node.prev = c.head
	c.head.next.prev = node
	c.head.next = node
}

// moveToHead promotes a accessed node to MRU
func (c *LRUCache) moveToHead(node *Node) {
	c.removeNode(node)
	c.addToHead(node)
}

// Get returns the value in O(1) and marks it as MRU
func (c *LRUCache) Get(key int) int {
	if node, exists := c.cache[key]; exists {
		c.moveToHead(node)
		return node.val
	}
	return -1
}

// Put inserts or updates a key-value in O(1)
func (c *LRUCache) Put(key int, value int) {
	if node, exists := c.cache[key]; exists {
		node.val = value
		c.moveToHead(node)
		return
	}

	newNode := &Node{key: key, val: value}
	c.cache[key] = newNode
	c.addToHead(newNode)

	// If over capacity, evict the LRU node right before tail sentinel
	if len(c.cache) > c.capacity {
		lru := c.tail.prev
		c.removeNode(lru)
		delete(c.cache, lru.key)
		fmt.Printf(" [Evicted LRU key: %d]\\n", lru.key)
	}
}

func (c *LRUCache) Print() {
	fmt.Print("Cache (MRU -> LRU): ")
	curr := c.head.next
	for curr != c.tail {
		fmt.Printf("[%d:%d] ", curr.key, curr.val)
		curr = curr.next
	}
	fmt.Println()
}

func main() {
	lru := Constructor(2)

	fmt.Println("Put(1, 10)")
	lru.Put(1, 10)
	lru.Print()

	fmt.Println("Put(2, 20)")
	lru.Put(2, 20)
	lru.Print()

	fmt.Printf("Get(1) -> %d (promoted to MRU)\\n", lru.Get(1))
	lru.Print()

	fmt.Println("Put(3, 30) -> Should evict key 2!")
	lru.Put(3, 30)
	lru.Print()

	fmt.Printf("Get(2) -> %d (Expected: -1 because evicted)\\n", lru.Get(2))
	fmt.Printf("Get(3) -> %d\\n", lru.Get(3))
}`,
    practical: `package main

import (
	"fmt"
	"sync"
	"time"
)

// ThreadSafeLRU adds concurrency control via sync.RWMutex
type SafeLRUCache struct {
	mu    sync.RWMutex
	cache map[string]string
}

func NewSafeLRU() *SafeLRUCache {
	return &SafeLRUCache{cache: make(map[string]string)}
}

func (c *SafeLRUCache) Set(key, val string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.cache[key] = val
}

func (c *SafeLRUCache) Get(key string) (string, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	val, ok := c.cache[key]
	return val, ok
}

func main() {
	cache := NewSafeLRU()
	var wg sync.WaitGroup

	// Concurrent writes
	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			cache.Set(fmt.Sprintf("session:%d", id), fmt.Sprintf("token-%d", id))
		}(i)
	}

	wg.Wait()
	fmt.Println("Concurrent session cache populated safely!")
	val, _ := cache.Get("session:3")
	fmt.Printf("session:3 value: %s\\n", val)
}`,
    exercise: `package main

import "fmt"

// TASK: Implement a function to verify if key exists without updating its MRU status
// Also known as Peek(key).
type SimpleCache struct {
	data map[string]int
}

func (c *SimpleCache) Peek(key string) (int, bool) {
	val, ok := c.data[key]
	return val, ok
}

func main() {
	sc := &SimpleCache{data: map[string]int{"alpha": 100, "beta": 200}}
	val, ok := sc.Peek("alpha")
	fmt.Printf("Peek 'alpha': %d (exists: %t)\\n", val, ok)
	if ok && val == 100 {
		fmt.Println("SUCCESS: Key read without mutating cache order!")
	}
}`
  }
}

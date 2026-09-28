export const heapsTopic = {
  id: 'heaps-priority-queues',
  title: 'Heaps & Priority Queues',
  category: 'hierarchical',
  difficulty: 'Intermediate',
  icon: 'Triangle',
  summary: 'Array-backed complete binary trees, heap invariants, and Go container/heap interface.',
  timeComplexity: {
    access: 'O(1) (find-min/max)',
    search: 'O(n)',
    insertion: 'O(log n)',
    deletion: 'O(log n) (extract-min/max)',
    space: 'O(n)'
  },
  keyPoints: [
    'A binary heap is stored compactly in a slice without pointer overhead: parent is at `(i-1)/2`, left child at `2i+1`, right child at `2i+2`.',
    'Min-Heap invariant: parent <= children. Root is always the minimum element in O(1).',
    'Go provides standard package `container/heap` which requires implementing 5 methods: `Len()`, `Less()`, `Swap()`, `Push()`, and `Pop()`.',
    'Pushing and popping require O(log n) heapify (sift-up / sift-down) steps.'
  ],
  goInternals: `// To turn any slice into a priority queue in Go,
// implement container/heap.Interface (which embeds sort.Interface):
type Interface interface {
    sort.Interface // Len() int, Less(i, j int) bool, Swap(i, j int)
    Push(x any)
    Pop() any
}

// Then use heap.Init(&h), heap.Push(&h, x), heap.Pop(&h)`,
  visualizerType: 'heap',
  codeSamples: {
    core: `package main

import (
	"container/heap"
	"fmt"
)

// IntHeap is a min-heap of ints.
type IntHeap []int

func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] } // < for Min-Heap, > for Max-Heap
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

func (h *IntHeap) Push(x any) {
	*h = append(*h, x.(int))
}

func (h *IntHeap) Pop() any {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[0 : n-1]
	return x
}

func main() {
	h := &IntHeap{21, 5, 12, 1, 9}
	heap.Init(h) // Converts slice into a valid min-heap in O(n)
	fmt.Printf("Initialized Min-Heap slice: %v\\n", *h)

	fmt.Println("Pushing 3...")
	heap.Push(h, 3)
	fmt.Printf("Heap slice after push: %v\\n", *h)

	fmt.Printf("Smallest element: %d\\n", (*h)[0])

	fmt.Println("Extracting minimums in priority order:")
	for h.Len() > 0 {
		fmt.Printf("%d ", heap.Pop(h))
	}
	fmt.Println()
}`,
    practical: `package main

import (
	"container/heap"
	"fmt"
)

// Task represents a prioritized job
type Task struct {
	Name     string
	Priority int // Lower number = higher priority
}

type PriorityQueue []*Task

func (pq PriorityQueue) Len() int           { return len(pq) }
func (pq PriorityQueue) Less(i, j int) bool { return pq[i].Priority < pq[j].Priority }
func (pq PriorityQueue) Swap(i, j int)      { pq[i], pq[j] = pq[j], pq[i] }

func (pq *PriorityQueue) Push(x any) {
	*pq = append(*pq, x.(*Task))
}

func (pq *PriorityQueue) Pop() any {
	old := *pq
	n := len(old)
	item := old[n-1]
	*pq = old[0 : n-1]
	return item
}

func main() {
	pq := &PriorityQueue{}
	heap.Init(pq)

	heap.Push(pq, &Task{Name: "Send weekly newsletter", Priority: 3})
	heap.Push(pq, &Task{Name: "Fix critical production crash", Priority: 1})
	heap.Push(pq, &Task{Name: "Refactor legacy tests", Priority: 4})
	heap.Push(pq, &Task{Name: "Review pull request", Priority: 2})

	fmt.Println("Processing tasks in order of urgency:")
	for pq.Len() > 0 {
		task := heap.Pop(pq).(*Task)
		fmt.Printf("  [Priority %d] %s\\n", task.Priority, task.Name)
	}
}`,
    exercise: `package main

import (
	"container/heap"
	"fmt"
)

type MinHeap []int

func (h MinHeap) Len() int           { return len(h) }
func (h MinHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h MinHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *MinHeap) Push(x any)        { *h = append(*h, x.(int)) }
func (h *MinHeap) Pop() any {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[0 : n-1]
	return x
}

// TASK: FindKthLargest in an unsorted array.
// Maintain a min-heap of size k!
func FindKthLargest(nums []int, k int) int {
	h := &MinHeap{}
	heap.Init(h)

	for _, num := range nums {
		heap.Push(h, num)
		if h.Len() > k {
			heap.Pop(h)
		}
	}
	return (*h)[0]
}

func main() {
	nums := []int{3, 2, 1, 5, 6, 4}
	k := 2
	result := FindKthLargest(nums, k)
	fmt.Printf("Array: %v, %d-nd largest is: %d (Expected: 5)\\n", nums, k, result)

	nums2 := []int{3, 2, 3, 1, 2, 4, 5, 5, 6}
	k2 := 4
	result2 := FindKthLargest(nums2, k2)
	fmt.Printf("Array: %v, %d-th largest is: %d (Expected: 4)\\n", nums2, k2, result2)
}`
  }
}

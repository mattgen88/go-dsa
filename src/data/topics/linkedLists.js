export const linkedListsTopic = {
  id: 'linked-lists',
  title: 'Singly & Doubly Linked Lists',
  category: 'linear-structures',
  difficulty: 'Beginner',
  icon: 'GitCommit',
  summary: 'Node-pointer chains in Go with generics, sentinel heads, and in-place pointer manipulation.',
  timeComplexity: {
    access: 'O(n)',
    search: 'O(n)',
    insertion: 'O(1) at head',
    deletion: 'O(1) at head',
    space: 'O(n)'
  },
  keyPoints: [
    'Unlike slices with contiguous memory, linked list nodes are allocated on the heap and linked via pointers `*Node[T]`.',
    'Provides O(1) insertion/deletion at endpoints without array resizing or element shifting.',
    'Cache locality is poorer than slices because nodes are scattered across memory.',
    'Sentinel (dummy) nodes drastically simplify edge cases when modifying the list head or empty lists.'
  ],
  goInternals: `// In modern Go (1.18+), we define generic linked list nodes:
type Node[T comparable] struct {
    Val  T
    Next *Node[T]
    Prev *Node[T] // Optional for Doubly Linked List
}

// Memory note: Each node has heap allocation overhead (object header + pointer).
// For small data types (like int), slices are often faster due to CPU cache lines!`,
  visualizerType: 'linked-list',
  codeSamples: {
    core: `package main

import "fmt"

// Node represents an element in a singly linked list
type Node[T comparable] struct {
	Val  T
	Next *Node[T]
}

// LinkedList encapsulates head pointer and length
type LinkedList[T comparable] struct {
	head *Node[T]
	len  int
}

// Prepend adds a new value at the beginning in O(1)
func (l *LinkedList[T]) Prepend(val T) {
	newNode := &Node[T]{Val: val, Next: l.head}
	l.head = newNode
	l.len++
}

// Append adds a new value at the end in O(n) or O(1) with tail
func (l *LinkedList[T]) Append(val T) {
	newNode := &Node[T]{Val: val}
	if l.head == nil {
		l.head = newNode
		l.len++
		return
	}
	curr := l.head
	for curr.Next != nil {
		curr = curr.Next
	}
	curr.Next = newNode
	l.len++
}

// Delete removes the first occurrence of val
func (l *LinkedList[T]) Delete(val T) bool {
	if l.head == nil {
		return false
	}
	if l.head.Val == val {
		l.head = l.head.Next
		l.len--
		return true
	}
	curr := l.head
	for curr.Next != nil && curr.Next.Val != val {
		curr = curr.Next
	}
	if curr.Next != nil {
		curr.Next = curr.Next.Next
		l.len--
		return true
	}
	return false
}

// Print outputs the list as [1] -> [2] -> [3] -> nil
func (l *LinkedList[T]) Print() {
	curr := l.head
	for curr != nil {
		fmt.Printf("[%v] -> ", curr.Val)
		curr = curr.Next
	}
	fmt.Println("nil")
}

func main() {
	list := &LinkedList[int]{}
	fmt.Println("Appending 10, 20, 30...")
	list.Append(10)
	list.Append(20)
	list.Append(30)
	list.Print()

	fmt.Println("Prepending 5...")
	list.Prepend(5)
	list.Print()

	fmt.Println("Deleting 20...")
	list.Delete(20)
	list.Print()

	fmt.Printf("Total count: %d\\n", list.len)
}`,
    practical: `package main

import "fmt"

type ListNode struct {
	Val  int
	Next *ListNode
}

// HasCycle uses Floyd's Tortoise and Hare algorithm
// Time: O(n), Space: O(1)
func HasCycle(head *ListNode) bool {
	if head == nil || head.Next == nil {
		return false
	}

	slow := head
	fast := head

	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next

		if slow == fast {
			return true // Cycle detected!
		}
	}
	return false
}

func main() {
	// Construct list: 3 -> 2 -> 0 -> -4 -> points back to node 2
	node1 := &ListNode{Val: 3}
	node2 := &ListNode{Val: 2}
	node3 := &ListNode{Val: 0}
	node4 := &ListNode{Val: -4}

	node1.Next = node2
	node2.Next = node3
	node3.Next = node4
	node4.Next = node2 // Create cycle!

	fmt.Printf("Has cycle: %t (Expected: true)\\n", HasCycle(node1))

	// Break cycle
	node4.Next = nil
	fmt.Printf("Has cycle after break: %t (Expected: false)\\n", HasCycle(node1))
}`,
    exercise: `package main

import "fmt"

type ListNode struct {
	Val  int
	Next *ListNode
}

// TASK: Implement ReverseList in-place.
// Given the head of a singly linked list, reverse the list,
// and return the reversed list's head.
func ReverseList(head *ListNode) *ListNode {
	var prev *ListNode
	curr := head

	// TODO: Iterate and reverse pointers
	for curr != nil {
		nextTemp := curr.Next
		curr.Next = prev
		prev = curr
		curr = nextTemp
	}
	return prev
}

func printList(head *ListNode) {
	curr := head
	for curr != nil {
		fmt.Printf("%d -> ", curr.Val)
		curr = curr.Next
	}
	fmt.Println("nil")
}

func main() {
	// Build 1 -> 2 -> 3 -> 4 -> 5 -> nil
	head := &ListNode{Val: 1, Next: &ListNode{Val: 2, Next: &ListNode{Val: 3, Next: &ListNode{Val: 4, Next: &ListNode{Val: 5}}}}}
	
	fmt.Print("Original: ")
	printList(head)

	reversed := ReverseList(head)
	fmt.Print("Reversed: ")
	printList(reversed)

	if reversed != nil && reversed.Val == 5 && reversed.Next.Val == 4 {
		fmt.Println("SUCCESS: Linked list reversed correctly!")
	} else {
		fmt.Println("FAILURE: Result does not match expected output.")
	}
}`
  }
}

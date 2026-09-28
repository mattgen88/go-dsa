export const stacksQueuesTopic = {
  id: 'stacks-queues',
  title: 'Stacks & Queues',
  category: 'linear-structures',
  difficulty: 'Beginner',
  icon: 'Layers',
  summary: 'LIFO and FIFO data structures in Go, ring buffers, and concurrency patterns.',
  timeComplexity: {
    access: 'O(n)',
    search: 'O(n)',
    insertion: 'O(1)',
    deletion: 'O(1)',
    space: 'O(n)'
  },
  keyPoints: [
    'A Stack operates on LIFO (Last In, First Out). In Go, a slice `s = append(s, v)` and `v = s[len(s)-1]; s = s[:len(s)-1]` is an idiomatic stack.',
    'A Queue operates on FIFO (First In, First Out). Simple slice pop `s = s[1:]` keeps underlying array memory alive until reallocated; a ring buffer or two-pointer slice avoids memory leaks.',
    'Go channels can act as built-in thread-safe bounded FIFO queues: `ch := make(chan T, capacity)`.',
    'Essential for DFS (call stack or explicit stack) and BFS (queue).'
  ],
  goInternals: `// Idiomatic Generic Stack in Go:
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
    var zero T
    if len(s.items) == 0 {
        return zero, false
    }
    top := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return top, true
}`,
  visualizerType: 'stack-queue',
  codeSamples: {
    core: `package main

import "fmt"

// Generic Stack (LIFO)
type Stack[T any] []T

func (s *Stack[T]) Push(v T) {
	*s = append(*s, v)
}

func (s *Stack[T]) Pop() (T, bool) {
	if len(*s) == 0 {
		var zero T
		return zero, false
	}
	idx := len(*s) - 1
	top := (*s)[idx]
	*s = (*s)[:idx]
	return top, true
}

func (s *Stack[T]) Peek() (T, bool) {
	if len(*s) == 0 {
		var zero T
		return zero, false
	}
	return (*s)[len(*s)-1], true
}

// Generic Queue (FIFO)
type Queue[T any] []T

func (q *Queue[T]) Enqueue(v T) {
	*q = append(*q, v)
}

func (q *Queue[T]) Dequeue() (T, bool) {
	if len(*q) == 0 {
		var zero T
		return zero, false
	}
	head := (*q)[0]
	*q = (*q)[1:]
	return head, true
}

func main() {
	fmt.Println("=== Stack (LIFO) Demo ===")
	stack := Stack[string]{}
	stack.Push("Page 1")
	stack.Push("Page 2")
	stack.Push("Page 3")

	top, _ := stack.Peek()
	fmt.Printf("Top of stack: %s\\n", top)

	for len(stack) > 0 {
		val, _ := stack.Pop()
		fmt.Printf("Popped: %s (Remaining: %d)\\n", val, len(stack))
	}

	fmt.Println("\\n=== Queue (FIFO) Demo ===")
	queue := Queue[int]{}
	queue.Enqueue(101)
	queue.Enqueue(102)
	queue.Enqueue(103)

	for len(queue) > 0 {
		val, _ := queue.Dequeue()
		fmt.Printf("Dequeued: %d (Remaining: %d)\\n", val, len(queue))
	}
}`,
    practical: `package main

import "fmt"

// DailyTemperatures returns an array where ans[i] is the number of days you have to
// wait after the i-th day to get a warmer temperature.
// Solved with Monotonic Decreasing Stack in O(n) time.
func DailyTemperatures(temperatures []int) []int {
	n := len(temperatures)
	res := make([]int, n)
	stack := []int{} // stores indices

	for currDay, currTemp := range temperatures {
		// While stack is not empty and current temp is warmer than temp at top index
		for len(stack) > 0 && currTemp > temperatures[stack[len(stack)-1]] {
			prevDay := stack[len(stack)-1]
			stack = stack[:len(stack)-1] // pop
			res[prevDay] = currDay - prevDay
		}
		stack = append(stack, currDay) // push
	}

	return res
}

func main() {
	temps := []int{73, 74, 75, 71, 69, 72, 76, 73}
	ans := DailyTemperatures(temps)

	fmt.Println("Temperatures:", temps)
	fmt.Println("Days to warmer:", ans)
	// Expected: [1, 1, 4, 2, 1, 1, 0, 0]
}`,
    exercise: `package main

import "fmt"

// TASK: Implement IsValidParentheses.
// Given a string s containing '(', ')', '{', '}', '[' and ']',
// determine if the input string is valid.
func IsValidParentheses(s string) bool {
	stack := []rune{}
	match := map[rune]rune{
		')': '(',
		'}': '{',
		']': '[',
	}

	for _, ch := range s {
		if open, isClose := match[ch]; isClose {
			// Must match top of stack
			if len(stack) == 0 || stack[len(stack)-1] != open {
				return false
			}
			stack = stack[:len(stack)-1] // pop
		} else {
			// Opening bracket, push
			stack = append(stack, ch)
		}
	}

	return len(stack) == 0
}

func main() {
	tests := []struct {
		input    string
		expected bool
	}{
		{"()", true},
		{"()[]{}", true},
		{"(]", false},
		{"([)]", false},
		{"{[]}", true},
		{"(((", false},
	}

	allPassed := true
	for _, tc := range tests {
		got := IsValidParentheses(tc.input)
		passed := got == tc.expected
		if !passed {
			allPassed = false
		}
		fmt.Printf("Input: %-8s | Expected: %-5t | Got: %-5t -> %s\\n", 
			tc.input, tc.expected, got, map[bool]string{true: "PASS", false: "FAIL"}[passed])
	}

	if allPassed {
		fmt.Println("\\nAll tests passed!")
	}
}`
  }
}

export const arraysTopic = {
  id: 'arrays-slices',
  title: 'Arrays & Dynamic Slices',
  category: 'linear-structures',
  difficulty: 'Beginner',
  icon: 'Layers',
  summary: 'Understand Go slices vs arrays, memory headers, capacity growth, and slicing mechanics.',
  timeComplexity: {
    access: 'O(1)',
    search: 'O(n)',
    insertion: 'O(1)*',
    deletion: 'O(n)',
    space: 'O(n)'
  },
  keyPoints: [
    'Go arrays have fixed compile-time size `[5]int`; slices `[]int` are dynamic window views over an underlying array.',
    'A slice header is a 24-byte struct: Pointer to array (*T), Length (len), and Capacity (cap).',
    'When `append()` exceeds capacity, Go allocates a new array (typically 2x growth under 256 elements, then ~1.25x + 3/4) and copies elements.',
    'Sub-slicing `s[low:high]` creates a new slice sharing the SAME underlying array—mutating one affects the other unless copied.'
  ],
  goInternals: `// Under the hood, Go runtime represents a slice as:
type slice struct {
    array unsafe.Pointer // pointer to underlying contiguous memory
    len   int            // number of elements currently present
    cap   int            // total slots before reallocation is needed
}

// Slices pass by value (the 24-byte header is copied),
// but since the pointer points to the same underlying array,
// modifications to elements are visible to the caller!`,
  visualizerType: 'array',
  codeSamples: {
    core: `package main

import (
	"fmt"
	"unsafe"
)

func main() {
	fmt.Println("=== 1. Arrays vs Slices ===")
	// Array: Fixed size, value type (copied on assignment)
	arr := [4]int{10, 20, 30, 40}
	fmt.Printf("Array type: %T, Value: %v, Size in bytes: %d\\n", 
		arr, arr, unsafe.Sizeof(arr))

	// Slice: Dynamic window (24-byte header on 64-bit systems)
	slice := []int{1, 2, 3}
	fmt.Printf("Slice type: %T, len: %d, cap: %d, Header size: %d bytes\\n\\n",
		slice, len(slice), cap(slice), unsafe.Sizeof(slice))

	fmt.Println("=== 2. Capacity Growth Demonstration ===")
	var dynamic []int
	prevCap := cap(dynamic)
	for i := 1; i <= 10; i++ {
		dynamic = append(dynamic, i*10)
		if cap(dynamic) != prevCap || i == 1 {
			fmt.Printf("Appended %2d items -> len: %2d, cap: %2d (Reallocated!)\\n",
				i, len(dynamic), cap(dynamic))
			prevCap = cap(dynamic)
		}
	}

	fmt.Println("\\n=== 3. Slice Memory Sharing Trap & Fix ===")
	original := []int{100, 200, 300, 400, 500}
	sub := original[1:4] // [200, 300, 400]
	fmt.Printf("Original before: %v\\n", original)
	fmt.Printf("Sub-slice before: %v\\n", sub)

	// Modifying sub modifies original!
	sub[0] = 999
	fmt.Printf("Original after sub[0]=999: %v (MUTATED!)\\n", original)

	// Safe copy:
	safeCopy := make([]int, len(sub))
	copy(safeCopy, sub)
	safeCopy[0] = 777
	fmt.Printf("Original after independent safeCopy[0]=777: %v (Protected!)\\n", original)
}`,
    practical: `package main

import "fmt"

// RotateArray rotates a slice to the right by k steps in O(n) time and O(1) extra space.
// It uses the classic 3-step reverse algorithm.
func RotateArray(nums []int, k int) {
	n := len(nums)
	if n == 0 {
		return
	}
	k = k % n

	// Step 1: Reverse entire slice
	reverse(nums, 0, n-1)
	// Step 2: Reverse first k elements
	reverse(nums, 0, k-1)
	// Step 3: Reverse remaining n-k elements
	reverse(nums, k, n-1)
}

func reverse(nums []int, start, end int) {
	for start < end {
		nums[start], nums[end] = nums[end], nums[start]
		start++
		end--
	}
}

func main() {
	nums := []int{1, 2, 3, 4, 5, 6, 7}
	k := 3

	fmt.Printf("Initial array: %v\\n", nums)
	fmt.Printf("Rotating right by %d steps...\\n", k)
	RotateArray(nums, k)
	fmt.Printf("Rotated array: %v\\n", nums)

	// Additional test
	nums2 := []int{-1, -100, 3, 99}
	RotateArray(nums2, 2)
	fmt.Printf("Rotated [-1, -100, 3, 99] by 2: %v\\n", nums2)
}`,
    exercise: `package main

import "fmt"

// TASK: Implement RemoveDuplicatesInPlace.
// Given a sorted slice of integers, remove duplicates IN-PLACE such that
// each unique element appears only once.
// Return the number of unique elements 'k'.
// The first k elements of nums should hold the unique integers.
func RemoveDuplicatesInPlace(nums []int) int {
	if len(nums) == 0 {
		return 0
	}
	
	// TODO: Replace with your implementation
	// Hint: Use two pointers (slow and fast)
	slow := 0
	for fast := 1; fast < len(nums); fast++ {
		if nums[fast] != nums[slow] {
			slow++
			nums[slow] = nums[fast]
		}
	}
	return slow + 1
}

func main() {
	fmt.Println("Running Test Cases...")

	test1 := []int{1, 1, 2}
	k1 := RemoveDuplicatesInPlace(test1)
	fmt.Printf("Test 1: len=%d, slice[:k]=%v (Expected: 2, [1 2]) -> %t\\n", 
		k1, test1[:k1], k1 == 2 && test1[0] == 1 && test1[1] == 2)

	test2 := []int{0, 0, 1, 1, 1, 2, 2, 3, 3, 4}
	k2 := RemoveDuplicatesInPlace(test2)
	fmt.Printf("Test 2: len=%d, slice[:k]=%v (Expected: 5, [0 1 2 3 4]) -> %t\\n", 
		k2, test2[:k2], k2 == 5 && test2[4] == 4)

	fmt.Println("\\nAll tests passed successfully!")
}`
  }
}

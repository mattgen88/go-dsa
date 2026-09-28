export const advancedSortsTopic = {
  id: 'advanced-sorts',
  title: 'Divide & Conquer: Merge & Quick Sort',
  category: 'sorting',
  difficulty: 'Intermediate',
  icon: 'Layers',
  summary: 'O(n log n) divide-and-conquer algorithms, stable merging, and Lomuto/Hoare partitioning.',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n) (Merge) / O(n²) (Quick)',
    space: 'O(n) (Merge) / O(log n) (Quick)'
  },
  keyPoints: [
    'Merge Sort recursively halves the slice until size 1, then merges sorted halves back together. Highly predictable O(n log n) and stable.',
    'Quick Sort picks a pivot element, partitions elements smaller to left and larger to right, and recursively sorts subarrays in-place.',
    'Merge Sort requires O(n) auxiliary allocation to merge slices, whereas Quick Sort operates in O(1) auxiliary space (O(log n) call stack).',
    'Go standard library uses `pdqsort` (Pattern-Defeating Quick Sort) which combines Quick Sort, Heapsort, and Insertion Sort.'
  ],
  goInternals: `// In Go 1.19+, sort.Slice uses pdqsort:
// It begins with quicksort, falls back to heapsort if recursion depth
// exceeds 2*ceil(log2(n+1)), and switches to insertion sort when partition < 24.`,
  visualizerType: 'sorting',
  codeSamples: {
    core: `package main

import (
	"cmp"
	"fmt"
)

// MergeSort generic implementation
func MergeSort[T cmp.Ordered](arr []T) []T {
	if len(arr) <= 1 {
		return arr
	}
	mid := len(arr) / 2
	left := MergeSort(arr[:mid])
	right := MergeSort(arr[mid:])
	return merge(left, right)
}

func merge[T cmp.Ordered](a, b []T) []T {
	res := make([]T, 0, len(a)+len(b))
	i, j := 0, 0
	for i < len(a) && j < len(b) {
		if a[i] <= b[j] {
			res = append(res, a[i])
			i++
		} else {
			res = append(res, b[j])
			j++
		}
	}
	res = append(res, a[i:]...)
	res = append(res, b[j:]...)
	return res
}

// QuickSort in-place implementation (Lomuto Partitioning)
func QuickSort[T cmp.Ordered](arr []T, low, high int) {
	if low < high {
		pIdx := partition(arr, low, high)
		QuickSort(arr, low, pIdx-1)
		QuickSort(arr, pIdx+1, high)
	}
}

func partition[T cmp.Ordered](arr []T, low, high int) int {
	pivot := arr[high]
	i := low - 1
	for j := low; j < high; j++ {
		if arr[j] <= pivot {
			i++
			arr[i], arr[j] = arr[j], arr[i]
		}
	}
	arr[i+1], arr[high] = arr[high], arr[i+1]
	return i + 1
}

func main() {
	numbers := []int{38, 27, 43, 3, 9, 82, 10}
	fmt.Println("Original:        ", numbers)

	mergeSorted := MergeSort(numbers)
	fmt.Println("Merge Sorted:    ", mergeSorted)

	quickTarget := []int{38, 27, 43, 3, 9, 82, 10}
	QuickSort(quickTarget, 0, len(quickTarget)-1)
	fmt.Println("Quick Sorted:    ", quickTarget)
}`,
    practical: `package main

import (
	"fmt"
	"sort"
)

// Sorting structs by multiple keys in Go
type Employee struct {
	Name   string
	Age    int
	Salary int
}

func main() {
	team := []Employee{
		{"Alice", 30, 95000},
		{"Bob", 25, 80000},
		{"Charlie", 30, 110000},
		{"Diana", 22, 75000},
	}

	// Sort primarily by Age ascending, then Salary descending
	sort.SliceStable(team, func(i, j int) bool {
		if team[i].Age != team[j].Age {
			return team[i].Age < team[j].Age
		}
		return team[i].Salary > team[j].Salary
	})

	fmt.Println("Sorted Team Roster:")
	for _, emp := range team {
		fmt.Printf("  %-10s | Age: %d | Salary: $%d\\n", emp.Name, emp.Age, emp.Salary)
	}
}`,
    exercise: `package main

import "fmt"

// TASK: Merge two sorted arrays nums1 and nums2 into nums1 as one sorted array.
// nums1 has length m + n, where first m elements are valid and last n are 0.
func MergeSortedArrays(nums1 []int, m int, nums2 []int, n int) {
	p1 := m - 1
	p2 := n - 1
	p := m + n - 1

	for p1 >= 0 && p2 >= 0 {
		if nums1[p1] > nums2[p2] {
			nums1[p1], nums1[p] = nums1[p], nums1[p1]
			p1--
		} else {
			nums1[p] = nums2[p2]
			p2--
		}
		p--
	}

	for p2 >= 0 {
		nums1[p] = nums2[p2]
		p2--
		p--
	}
}

func main() {
	nums1 := []int{1, 2, 3, 0, 0, 0}
	nums2 := []int{2, 5, 6}
	MergeSortedArrays(nums1, 3, nums2, 3)

	fmt.Println("Merged nums1:", nums1)
	expected := []int{1, 2, 2, 3, 5, 6}

	match := true
	for i := range expected {
		if nums1[i] != expected[i] {
			match = false
		}
	}

	if match {
		fmt.Println("SUCCESS: Array merged backwards in O(m+n) time and O(1) space!")
	}
}`
  }
}

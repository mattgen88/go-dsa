export const binarySearchTopic = {
  id: 'binary-search',
  title: 'Binary Search & Bounds',
  category: 'searching',
  difficulty: 'Beginner',
  icon: 'Search',
  summary: 'Logarithmic search on sorted slices, avoiding integer overflow, lower/upper bounds, and standard library slices.BinarySearch.',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    space: 'O(1)'
  },
  keyPoints: [
    'Halves the search space on each iteration: only applicable to sorted collections or monotonic answer spaces.',
    'Always calculate midpoint with `mid = low + (high-low)/2` rather than `(low+high)/2` to prevent 32-bit integer overflow.',
    'Go 1.21+ includes `slices.BinarySearch(slice, target)` returning `(index, found)`.',
    'Binary Search can also be applied to continuous predicate functions: "Binary Search on Answer".'
  ],
  goInternals: `// In Go standard library slices package:
func BinarySearch[S ~[]E, E cmp.Ordered](x S, target E) (int, bool) {
    n := len(x)
    i, j := 0, n
    for i < j {
        h := int(uint(i+j) >> 1) // fast bitwise division avoiding overflow
        if x[h] < target {
            i = h + 1
        } else {
            j = h
        }
    }
    return i, i < n && x[i] == target
}`,
  visualizerType: 'binary-search',
  codeSamples: {
    core: `package main

import (
	"fmt"
	"slices"
	"sort"
)

// Iterative Binary Search
func BinarySearch(arr []int, target int) int {
	low, high := 0, len(arr)-1

	for low <= high {
		mid := low + (high-low)/2

		if arr[mid] == target {
			return mid
		} else if arr[mid] < target {
			low = mid + 1
		} else {
			high = mid - 1
		}
	}
	return -1
}

func main() {
	nums := []int{2, 5, 8, 12, 16, 23, 38, 56, 72, 91}
	fmt.Println("Sorted slice:", nums)

	target := 23
	idx := BinarySearch(nums, target)
	fmt.Printf("Custom BinarySearch for %d: found at index %d\\n", target, idx)

	// Go 1.21+ slices.BinarySearch
	idx2, found := slices.BinarySearch(nums, target)
	fmt.Printf("slices.BinarySearch for %d: found=%t, index=%d\\n", target, found, idx2)

	// sort.Search for lower bound (first element >= 30)
	threshold := 30
	firstGE := sort.Search(len(nums), func(i int) bool {
		return nums[i] >= threshold
	})
	fmt.Printf("First element >= %d is %d at index %d\\n", threshold, nums[firstGE], firstGE)
}`,
    practical: `package main

import "fmt"

// FindRange finds starting and ending position of target in sorted array
// Time: O(log n)
func FindRange(nums []int, target int) []int {
	first := findBound(nums, target, true)
	if first == -1 {
		return []int{-1, -1}
	}
	last := findBound(nums, target, false)
	return []int{first, last}
}

func findBound(nums []int, target int, isFirst bool) int {
	low, high := 0, len(nums)-1
	ans := -1

	for low <= high {
		mid := low + (high-low)/2
		if nums[mid] == target {
			ans = mid
			if isFirst {
				high = mid - 1 // keep searching left
			} else {
				low = mid + 1 // keep searching right
			}
		} else if nums[mid] < target {
			low = mid + 1
		} else {
			high = mid - 1
		}
	}
	return ans
}

func main() {
	nums := []int{5, 7, 7, 8, 8, 8, 10}
	target := 8
	result := FindRange(nums, target)
	fmt.Printf("Target %d range in %v: %v (Expected: [3, 5])\\n", target, nums, result)
}`,
    exercise: `package main

import "fmt"

// TASK: Search in Rotated Sorted Array.
// Given an array sorted in ascending order and rotated at an unknown pivot,
// return the index of target, or -1 if not found. Run in O(log n) time!
func SearchRotated(nums []int, target int) int {
	low, high := 0, len(nums)-1

	for low <= high {
		mid := low + (high-low)/2
		if nums[mid] == target {
			return mid
		}

		// Determine which half is normally sorted
		if nums[low] <= nums[mid] {
			// Left half is sorted
			if nums[low] <= target && target < nums[mid] {
				high = mid - 1
			} else {
				low = mid + 1
			}
		} else {
			// Right half is sorted
			if nums[mid] < target && target <= nums[high] {
				low = mid + 1
			} else {
				high = mid - 1
			}
		}
	}
	return -1
}

func main() {
	nums := []int{4, 5, 6, 7, 0, 1, 2}
	fmt.Printf("Search 0 in %v -> index: %d (Expected: 4)\\n", nums, SearchRotated(nums, 0))
	fmt.Printf("Search 3 in %v -> index: %d (Expected: -1)\\n", nums, SearchRotated(nums, 3))
}`
  }
}

export const basicSortsTopic = {
  id: 'basic-sorts',
  title: 'Basic Sorts: Bubble, Insertion & Selection',
  category: 'sorting',
  difficulty: 'Beginner',
  icon: 'ArrowDownUp',
  summary: 'Foundational O(n²) comparison sorts, in-place mechanics, and why Go uses Insertion Sort for small slices.',
  timeComplexity: {
    best: 'O(n) (Insertion)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)'
  },
  keyPoints: [
    'Bubble Sort repeatedly steps through the list, swaps adjacent elements if out of order, bubbling the largest to the end.',
    'Selection Sort repeatedly finds the minimum remaining element and swaps it to the front.',
    'Insertion Sort builds the final sorted array one item at a time by shifting larger elements right. Best case is O(n) on nearly sorted data!',
    'Go’s internal `sort` and `pdqsort` algorithm actually fall back to Insertion Sort for partitions smaller than 24 elements due to negligible constant factor and cache efficiency.'
  ],
  goInternals: `// In Go standard library (sort/zsortinterface.go), insertionSort is defined as:
func insertionSort(data Interface, a, b int) {
    for i := a + 1; i < b; i++ {
        for j := i; j > a && data.Less(j, j-1); j-- {
            data.Swap(j, j-1)
        }
    }
}`,
  visualizerType: 'sorting',
  codeSamples: {
    core: `package main

import "fmt"

func BubbleSort(arr []int) {
	n := len(arr)
	for i := 0; i < n-1; i++ {
		swapped := false
		for j := 0; j < n-i-1; j++ {
			if arr[j] > arr[j+1] {
				arr[j], arr[j+1] = arr[j+1], arr[j]
				swapped = true
			}
		}
		if !swapped {
			break // Early exit if already sorted!
		}
	}
}

func SelectionSort(arr []int) {
	n := len(arr)
	for i := 0; i < n-1; i++ {
		minIdx := i
		for j := i + 1; j < n; j++ {
			if arr[j] < arr[minIdx] {
				minIdx = j
			}
		}
		arr[i], arr[minIdx] = arr[minIdx], arr[i]
	}
}

func InsertionSort(arr []int) {
	for i := 1; i < len(arr); i++ {
		key := arr[i]
		j := i - 1
		for j >= 0 && arr[j] > key {
			arr[j+1] = arr[j]
			j--
		}
		arr[j+1] = key
	}
}

func main() {
	bArr := []int{64, 34, 25, 12, 22, 11, 90}
	BubbleSort(bArr)
	fmt.Println("Bubble Sorted:   ", bArr)

	sArr := []int{64, 25, 12, 22, 11}
	SelectionSort(sArr)
	fmt.Println("Selection Sorted:", sArr)

	iArr := []int{12, 11, 13, 5, 6}
	InsertionSort(iArr)
	fmt.Println("Insertion Sorted:", iArr)
}`,
    practical: `package main

import (
	"fmt"
	"time"
)

// In real-world data pipelines, streams are often almost sorted.
// Insertion sort excels here!
func InsertionSortNearlySorted(arr []int) {
	for i := 1; i < len(arr); i++ {
		key := arr[i]
		j := i - 1
		for j >= 0 && arr[j] > key {
			arr[j+1] = arr[j]
			j--
		}
		arr[j+1] = key
	}
}

func main() {
	// Simulated timestamp log with 2 out-of-order events
	timestamps := []int{100, 102, 105, 103, 108, 112, 110, 115, 120}

	fmt.Println("Out-of-order stream: ", timestamps)
	start := time.Now()
	InsertionSortNearlySorted(timestamps)
	duration := time.Since(start)

	fmt.Println("Ordered stream:       ", timestamps)
	fmt.Printf("Sorted in %v\\n", duration)
}`,
    exercise: `package main

import "fmt"

// TASK: Implement InsertionSort for strings in alphabetical order.
func InsertionSortStrings(arr []string) {
	for i := 1; i < len(arr); i++ {
		key := arr[i]
		j := i - 1
		for j >= 0 && arr[j] > key {
			arr[j+1] = arr[j]
			j--
		}
		arr[j+1] = key
	}
}

func main() {
	words := []string{"zebra", "apple", "mango", "banana", "cherry"}
	InsertionSortStrings(words)
	fmt.Println("Sorted words:", words)

	if words[0] == "apple" && words[4] == "zebra" {
		fmt.Println("SUCCESS: Words sorted correctly!")
	}
}`
  }
}

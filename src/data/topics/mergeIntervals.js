export const mergeIntervalsTopic = {
  id: 'merge-intervals',
  title: 'Interval Scheduling & Merging',
  category: 'interview-prep',
  difficulty: 'Intermediate',
  icon: 'Calendar',
  summary: 'Sweep-line and greedy techniques for overlapping intervals, meeting rooms, and calendar merges.',
  timeComplexity: {
    'Sorting Phase': 'O(n log n)',
    'Linear Scan': 'O(n)',
    'Total Time': 'O(n log n)',
    'Space': 'O(n)'
  },
  keyPoints: [
    'Canonical interview technique: Sort intervals by their start time `a[0] < b[0]`.',
    'Iterate through sorted intervals: If `current.start <= previous.end`, they overlap! Merge them by setting `previous.end = max(previous.end, current.end)`.',
    'Meeting Rooms II (Minimum meeting rooms required): Tracks active rooms via Min-Heap of end times or Two-Pointer sweep on sorted starts and ends.',
    'Non-overlapping Interval Scheduling: To maximize disjoint events, greedily sort by **earliest end time**.'
  ],
  goInternals: `// In Go, sort intervals slice using sort.Slice:
sort.Slice(intervals, func(i, j int) bool {
    return intervals[i][0] < intervals[j][0]
})`,
  visualizerType: 'intervals',
  codeSamples: {
    core: `package main

import (
	"fmt"
	"sort"
)

// Merge takes a collection of intervals and merges all overlapping intervals.
// Time: O(n log n), Space: O(n)
func Merge(intervals [][]int) [][]int {
	if len(intervals) <= 1 {
		return intervals
	}

	// 1. Sort intervals by start time ascending
	sort.Slice(intervals, func(i, j int) bool {
		return intervals[i][0] < intervals[j][0]
	})

	merged := [][]int{intervals[0]}

	// 2. Iterate and merge overlapping blocks
	for i := 1; i < len(intervals); i++ {
		prev := merged[len(merged)-1]
		curr := intervals[i]

		if curr[0] <= prev[1] {
			// Overlap detected: extend end boundary
			if curr[1] > prev[1] {
				prev[1] = curr[1]
			}
		} else {
			// Disjoint interval: append as new block
			merged = append(merged, curr)
		}
	}

	return merged
}

func main() {
	input := [][]int{{1, 3}, {2, 6}, {8, 10}, {15, 18}}
	fmt.Printf("Input intervals:  %v\\n", input)

	result := Merge(input)
	fmt.Printf("Merged intervals: %v\\n", result)
	// Expected: [[1, 6], [8, 10], [15, 18]]

	input2 := [][]int{{1, 4}, {4, 5}}
	fmt.Printf("\\nInput intervals:  %v\\n", input2)
	fmt.Printf("Merged intervals: %v\\n", Merge(input2))
	// Expected: [[1, 5]]
}`,
    practical: `package main

import (
	"fmt"
	"sort"
)

// MinMeetingRooms calculates the minimum conference rooms needed
// Using two-pointer sweep on starts and ends
func MinMeetingRooms(intervals [][]int) int {
	n := len(intervals)
	starts := make([]int, n)
	ends := make([]int, n)

	for i, inv := range intervals {
		starts[i] = inv[0]
		ends[i] = inv[1]
	}

	sort.Ints(starts)
	sort.Ints(ends)

	rooms := 0
	endPtr := 0

	for startPtr := 0; startPtr < n; startPtr++ {
		if starts[startPtr] < ends[endPtr] {
			// A meeting starts before the earliest room frees up -> need new room
			rooms++
		} else {
			// A room freed up -> advance end pointer
			endPtr++
		}
	}

	return rooms
}

func main() {
	meetings := [][]int{{0, 30}, {5, 10}, {15, 20}}
	fmt.Println("Meetings schedule:", meetings)
	fmt.Printf("Minimum meeting rooms required: %d (Expected: 2)\\n", MinMeetingRooms(meetings))
}`,
    exercise: `package main

import "fmt"

// TASK: InsertInterval.
// Insert newInterval into non-overlapping sorted intervals,
// merging if necessary.
func InsertInterval(intervals [][]int, newInterval []int) [][]int {
	var result [][]int
	i := 0
	n := len(intervals)

	// 1. Add all intervals ending before newInterval starts
	for i < n && intervals[i][1] < newInterval[0] {
		result = append(result, intervals[i])
		i++
	}

	// 2. Merge all overlapping intervals
	for i < n && intervals[i][0] <= newInterval[1] {
		if intervals[i][0] < newInterval[0] {
			newInterval[0] = intervals[i][0]
		}
		if intervals[i][1] > newInterval[1] {
			newInterval[1] = intervals[i][1]
		}
		i++
	}
	result = append(result, newInterval)

	// 3. Add remaining intervals
	for i < n {
		result = append(result, intervals[i])
		i++
	}

	return result
}

func main() {
	intervals := [][]int{{1, 3}, {6, 9}}
	newInv := []int{2, 5}
	res := InsertInterval(intervals, newInv)

	fmt.Printf("Original: %v, Inserting: %v -> Result: %v\\n", intervals, newInv, res)
	if len(res) == 2 && res[0][0] == 1 && res[0][1] == 5 {
		fmt.Println("SUCCESS: Interval inserted and merged correctly!")
	}
}`
  }
}

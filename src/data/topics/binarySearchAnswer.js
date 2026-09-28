export const binarySearchAnswerTopic = {
  id: 'binary-search-answer',
  title: 'Binary Search on Answer Space',
  category: 'interview-prep',
  difficulty: 'Intermediate',
  icon: 'Search',
  summary: 'Finding optimal thresholds by applying binary search to monotonic feasibility functions (e.g. Koko Eating Bananas).',
  timeComplexity: {
    'Search Range': 'O(log(max - min))',
    'Feasibility Check': 'O(n)',
    'Total Time': 'O(n log(max))',
    'Space': 'O(1)'
  },
  keyPoints: [
    'Instead of binary searching through an existing sorted array, we binary search over the **range of possible answers** `[low, high]`.',
    'Requires a **monotonic predicate** function `canAchieve(speed) bool`: If speed $S$ is valid, then all speeds $> S$ are also valid.',
    'Common interview questions: Koko Eating Bananas, Capacity To Ship Packages Within D Days, Split Array Largest Sum, Aggressive Cows.',
    'Reduces exponential or high linear brute-force searches into logarithmic steps.'
  ],
  goInternals: `// Monotonic Pattern:
low, high := 1, maxVal
ans := high

for low <= high {
    mid := low + (high-low)/2
    if isValid(mid) {
        ans = mid
        high = mid - 1 // try smaller
    } else {
        low = mid + 1  // must increase
    }
}`,
  visualizerType: 'binary-search',
  codeSamples: {
    core: `package main

import (
	"fmt"
)

// MinEatingSpeed (Koko Eating Bananas)
// Piles of bananas. Must eat all within h hours.
// Return minimum integer speed k (bananas per hour).
func MinEatingSpeed(piles []int, h int) int {
	// Search space: speed can be from 1 to max(piles)
	low := 1
	high := 0
	for _, p := range piles {
		if p > high {
			high = p
		}
	}

	ans := high

	// Binary search on answer space
	for low <= high {
		midSpeed := low + (high-low)/2

		if canFinish(piles, midSpeed, h) {
			ans = midSpeed
			high = midSpeed - 1 // Try smaller speed
		} else {
			low = midSpeed + 1  // Too slow, must speed up
		}
	}

	return ans
}

func canFinish(piles []int, speed int, h int) bool {
	hoursNeeded := 0
	for _, p := range piles {
		// Ceiling division: (p + speed - 1) / speed
		hoursNeeded += (p + speed - 1) / speed
	}
	return hoursNeeded <= h
}

func main() {
	piles := []int{3, 6, 7, 11}
	hours := 8

	fmt.Printf("Banana piles: %v, Time limit: %d hours\\n", piles, hours)
	speed := MinEatingSpeed(piles, hours)
	fmt.Printf("Minimum eating speed: %d bananas/hour (Expected: 4)\\n", speed)

	piles2 := []int{30, 11, 23, 4, 20}
	fmt.Printf("\\nPiles: %v, Hours: 5 -> Speed: %d (Expected: 30)\\n", 
		piles2, MinEatingSpeed(piles2, 5))
}`,
    practical: `package main

import "fmt"

// ShipWithinDays finds minimum weight capacity of boat to ship all packages within D days
func ShipWithinDays(weights []int, days int) int {
	low := 0  // Max single package (cannot split packages)
	high := 0 // Sum of all packages
	for _, w := range weights {
		if w > low {
			low = w
		}
		high += w
	}

	ans := high
	for low <= high {
		midCap := low + (high-low)/2
		if canShip(weights, midCap, days) {
			ans = midCap
			high = midCap - 1
		} else {
			low = midCap + 1
		}
	}
	return ans
}

func canShip(weights []int, capacity int, days int) bool {
	daysNeeded := 1
	currentLoad := 0

	for _, w := range weights {
		if currentLoad+w > capacity {
			daysNeeded++
			currentLoad = w
		} else {
			currentLoad += w
		}
	}
	return daysNeeded <= days
}

func main() {
	packages := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	days := 5
	fmt.Println("Package weights:", packages)
	fmt.Printf("Min ship capacity for %d days: %d (Expected: 15)\\n", 
		days, ShipWithinDays(packages, days))
}`,
    exercise: `package main

import "fmt"

// TASK: Implement SplitArray (Split Array Largest Sum)
// Split nums into k non-empty subarrays such that the largest sum among them is minimized.
func SplitArray(nums []int, k int) int {
	low, high := 0, 0
	for _, n := range nums {
		if n > low {
			low = n
		}
		high += n
	}

	ans := high
	for low <= high {
		midSum := low + (high-low)/2
		pieces := 1
		currSum := 0

		for _, n := range nums {
			if currSum+n > midSum {
				pieces++
				currSum = n
			} else {
				currSum += n
			}
		}

		if pieces <= k {
			ans = midSum
			high = midSum - 1
		} else {
			low = midSum + 1
		}
	}
	return ans
}

func main() {
	nums := []int{7, 2, 5, 10, 8}
	k := 2
	result := SplitArray(nums, k)
	fmt.Printf("Array: %v, k: %d -> Minimized largest sum: %d (Expected: 18)\\n", nums, k, result)
	if result == 18 {
		fmt.Println("SUCCESS: Correctly partitioned with minimized maximum sum!")
	}
}`
  }
}

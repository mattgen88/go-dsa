export const twoPointersTopic = {
  id: 'two-pointers',
  title: 'Two Pointers & Sliding Window',
  category: 'searching',
  difficulty: 'Beginner',
  icon: 'MoveHorizontal',
  summary: 'Converging pointers, fast/slow runner patterns, and dynamic sliding windows in linear time.',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(1) to O(k)'
  },
  keyPoints: [
    'Two Pointers technique avoids nested loops by moving two index markers toward each other or in the same direction.',
    'Fast & Slow pointers (Tortoise & Hare) detect linked list cycles or locate midpoints.',
    'Sliding Window dynamically maintains a valid subset/window `[left, right]` by expanding `right` and contracting `left` when invariants break.',
    'Transforms brute force O(n²) subarray and substring problems into clean O(n) passes.'
  ],
  goInternals: `// Generic Sliding Window Pattern in Go:
left := 0
for right := 0; right < len(arr); right++ {
    // 1. Add arr[right] to window state
    for /* window condition violated */ {
        // 2. Remove arr[left] from state
        left++
    }
    // 3. Update answer with window size (right - left + 1)
}`,
  visualizerType: 'two-pointers',
  codeSamples: {
    core: `package main

import (
	"fmt"
	"strings"
	"unicode"
)

// Two Sum II: Input array is sorted
// Time: O(n), Space: O(1)
func TwoSumSorted(numbers []int, target int) []int {
	left, right := 0, len(numbers)-1

	for left < right {
		sum := numbers[left] + numbers[right]
		if sum == target {
			return []int{left + 1, right + 1} // 1-indexed
		} else if sum < target {
			left++
		} else {
			right--
		}
	}
	return nil
}

// IsPalindrome ignores non-alphanumeric and casing
func IsPalindrome(s string) bool {
	s = strings.ToLower(s)
	runes := []rune(s)
	left, right := 0, len(runes)-1

	for left < right {
		for left < right && !unicode.IsLetter(runes[left]) && !unicode.IsDigit(runes[left]) {
			left++
		}
		for left < right && !unicode.IsLetter(runes[right]) && !unicode.IsDigit(runes[right]) {
			right--
		}
		if runes[left] != runes[right] {
			return false
		}
		left++
		right--
	}
	return true
}

func main() {
	nums := []int{2, 7, 11, 15}
	target := 9
	fmt.Printf("TwoSumSorted %v for %d: indices %v\\n", nums, target, TwoSumSorted(nums, target))

	phrase := "A man, a plan, a canal: Panama"
	fmt.Printf("Is '%s' a palindrome? %t\\n", phrase, IsPalindrome(phrase))
}`,
    practical: `package main

import "fmt"

// LengthOfLongestSubstring finds length of longest substring without repeating characters
// Time: O(n), Space: O(min(m, n))
func LengthOfLongestSubstring(s string) int {
	lastSeen := make(map[byte]int)
	maxLen := 0
	left := 0

	for right := 0; right < len(s); right++ {
		char := s[right]

		if prevIdx, found := lastSeen[char]; found && prevIdx >= left {
			left = prevIdx + 1 // shrink window past duplicate
		}

		lastSeen[char] = right
		windowLen := right - left + 1
		if windowLen > maxLen {
			maxLen = windowLen
		}
	}

	return maxLen
}

func main() {
	tests := []string{"abcabcbb", "bbbbb", "pwwkew", ""}
	for _, str := range tests {
		fmt.Printf("String: %-10q | Longest unique substring length: %d\\n", 
			str, LengthOfLongestSubstring(str))
	}
}`,
    exercise: `package main

import "fmt"

// TASK: Container With Most Water.
// Given n non-negative integers representing heights of vertical lines,
// find two lines that together with the x-axis form a container holding the most water.
// Return max area.
func MaxArea(height []int) int {
	left, right := 0, len(height)-1
	maxWater := 0

	for left < right {
		w := right - left
		h := height[left]
		if height[right] < h {
			h = height[right]
		}
		area := w * h
		if area > maxWater {
			maxWater = area
		}

		// Move pointer pointing to shorter line
		if height[left] < height[right] {
			left++
		} else {
			right--
		}
	}

	return maxWater
}

func main() {
	heights := []int{1, 8, 6, 2, 5, 4, 8, 3, 7}
	result := MaxArea(heights)
	fmt.Printf("Heights: %v\\nMax Water Area: %d (Expected: 49)\\n", heights, result)
}`
  }
}

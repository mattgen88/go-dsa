export const dynamicProgrammingTopic = {
  id: 'dynamic-programming',
  title: 'Dynamic Programming: Memoization & Tabulation',
  category: 'advanced',
  difficulty: 'Advanced',
  icon: 'Zap',
  summary: 'Solving complex problems by breaking them into overlapping subproblems with optimal substructure.',
  timeComplexity: {
    best: 'O(n) to O(n * k)',
    average: 'O(n) to O(n * k)',
    worst: 'O(n) to O(n * k)',
    space: 'O(1) to O(n * k)'
  },
  keyPoints: [
    'Dynamic Programming applies when problems exhibit (1) Overlapping Subproblems and (2) Optimal Substructure.',
    'Top-Down with Memoization: Use recursion combined with a lookup table/map to store previously calculated answers.',
    'Bottom-Up Tabulation: Iteratively solve smaller base cases first and build up answers inside an array/table.',
    'Space Optimization: Many DP problems only require states from previous 1 or 2 steps, reducing space from O(n) to O(1)!'
  ],
  goInternals: `// 2D DP slice allocation in Go:
dp := make([][]int, rows)
for i := range dp {
    dp[i] = make([]int, cols)
}

// Or contiguous 1D slice simulation:
dp := make([]int, rows * cols)
// access: dp[r*cols + c]`,
  visualizerType: 'dp',
  codeSamples: {
    core: `package main

import "fmt"

// 1. Top-Down Memoization (Fibonacci)
func FibMemo(n int, memo map[int]int) int {
	if n <= 1 {
		return n
	}
	if val, ok := memo[n]; ok {
		return val
	}
	memo[n] = FibMemo(n-1, memo) + FibMemo(n-2, memo)
	return memo[n]
}

// 2. Bottom-Up Tabulation with O(1) Space
func FibTabulation(n int) int {
	if n <= 1 {
		return n
	}
	prev2, prev1 := 0, 1
	for i := 2; i <= n; i++ {
		curr := prev1 + prev2
		prev2 = prev1
		prev1 = curr
	}
	return prev1
}

func main() {
	n := 10
	memo := make(map[int]int)

	fmt.Printf("Fibonacci(%d) via Memoization: %d\\n", n, FibMemo(n, memo))
	fmt.Printf("Fibonacci(%d) via Tabulation:  %d\\n", n, FibTabulation(n))

	fmt.Println("\\nFirst 10 Fibonacci numbers:")
	for i := 0; i <= 10; i++ {
		fmt.Printf("F(%d)=%d ", i, FibTabulation(i))
	}
	fmt.Println()
}`,
    practical: `package main

import (
	"fmt"
	"math"
)

// CoinChange calculates the fewest number of coins needed to make up amount.
// dp[i] = min(dp[i], dp[i - coin] + 1)
func CoinChange(coins []int, amount int) int {
	dp := make([]int, amount+1)
	for i := 1; i <= amount; i++ {
		dp[i] = math.MaxInt32
	}
	dp[0] = 0

	for i := 1; i <= amount; i++ {
		for _, coin := range coins {
			if i-coin >= 0 && dp[i-coin] != math.MaxInt32 {
				if dp[i-coin]+1 < dp[i] {
					dp[i] = dp[i-coin] + 1
				}
			}
		}
	}

	if dp[amount] == math.MaxInt32 {
		return -1
	}
	return dp[amount]
}

func main() {
	coins := []int{1, 2, 5}
	amount := 11
	fmt.Printf("Coins: %v, Amount: %d\\n", coins, amount)
	fmt.Printf("Minimum coins needed: %d (e.g. 5+5+1)\\n", CoinChange(coins, amount))
}`,
    exercise: `package main

import "fmt"

// TASK: House Robber.
// You cannot rob two adjacent houses.
// Determine the maximum amount of money you can rob tonight without alerting the police.
func Rob(nums []int) int {
	if len(nums) == 0 {
		return 0
	}
	if len(nums) == 1 {
		return nums[0]
	}

	robPrev2 := 0
	robPrev1 := 0

	for _, money := range nums {
		currentMax := robPrev1
		if robPrev2+money > currentMax {
			currentMax = robPrev2 + money
		}
		robPrev2 = robPrev1
		robPrev1 = currentMax
	}

	return robPrev1
}

func main() {
	test1 := []int{1, 2, 3, 1}
	fmt.Printf("Houses: %v -> Max Loot: %d (Expected: 4)\\n", test1, Rob(test1))

	test2 := []int{2, 7, 9, 3, 1}
	fmt.Printf("Houses: %v -> Max Loot: %d (Expected: 12)\\n", test2, Rob(test2))
}`
  }
}

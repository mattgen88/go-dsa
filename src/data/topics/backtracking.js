export const backtrackingTopic = {
  id: 'backtracking',
  title: 'Recursion & Backtracking',
  category: 'advanced',
  difficulty: 'Advanced',
  icon: 'Compass',
  summary: 'State-space tree exploration, pruning dead ends, and undoing choices to explore combinatorial solutions.',
  timeComplexity: {
    best: 'O(n) with heavy pruning',
    average: 'O(k^n) or O(n!)',
    worst: 'O(n!)',
    space: 'O(n) call stack depth'
  },
  keyPoints: [
    'Backtracking builds candidate solutions incrementally and abandons (backtracks) a candidate as soon as it violates constraints.',
    'Follows the canonical pattern: Choose -> Explore (Recurse) -> Unchoose (Backtrack).',
    'In Go, when passing slices down recursion paths, beware of slice mutation: pass a cloned slice or explicitly pop after returning.',
    'Classic problems include Subsets, Permutations, Sudoku Solver, and N-Queens.'
  ],
  goInternals: `// Crucial Go Backtracking idiom for tracking path:
path = append(path, candidate) // Choose
backtrack(nextState, path)     // Explore
path = path[:len(path)-1]      // Unchoose (pop last)

// When saving path to results, make a copy to prevent mutation!
snapshot := make([]int, len(path))
copy(snapshot, path)
results = append(results, snapshot)`,
  visualizerType: 'backtracking',
  codeSamples: {
    core: `package main

import "fmt"

// GenerateSubsets returns all subsets (the power set) of a slice
func GenerateSubsets(nums []int) [][]int {
	var result [][]int
	var current []int

	var backtrack func(start int)
	backtrack = func(start int) {
		// Take snapshot of current path
		snapshot := make([]int, len(current))
		copy(snapshot, current)
		result = append(result, snapshot)

		for i := start; i < len(nums); i++ {
			current = append(current, nums[i]) // Choose
			backtrack(i + 1)                   // Explore
			current = current[:len(current)-1] // Unchoose
		}
	}

	backtrack(0)
	return result
}

// GeneratePermutations returns all permutations
func GeneratePermutations(nums []int) [][]int {
	var result [][]int
	var current []int
	used := make([]bool, len(nums))

	var backtrack func()
	backtrack = func() {
		if len(current) == len(nums) {
			snapshot := make([]int, len(current))
			copy(snapshot, current)
			result = append(result, snapshot)
			return
		}

		for i := 0; i < len(nums); i++ {
			if used[i] {
				continue
			}
			used[i] = true
			current = append(current, nums[i]) // Choose
			backtrack()                        // Explore
			current = current[:len(current)-1] // Unchoose
			used[i] = false
		}
	}

	backtrack()
	return result
}

func main() {
	nums := []int{1, 2, 3}
	subsets := GenerateSubsets(nums)
	fmt.Printf("Subsets of %v (%d total):\\n", nums, len(subsets))
	for _, s := range subsets {
		fmt.Printf("  %v\\n", s)
	}

	perms := GeneratePermutations(nums)
	fmt.Printf("\\nPermutations of %v (%d total):\\n", nums, len(perms))
	for _, p := range perms {
		fmt.Printf("  %v\\n", p)
	}
}`,
    practical: `package main

import "fmt"

// SolveNQueens solves the N-Queens puzzle on an N x N chessboard
func SolveNQueens(n int) [][]string {
	var res [][]string
	cols := make(map[int]bool)
	diag1 := make(map[int]bool) // r - c
	diag2 := make(map[int]bool) // r + c

	board := make([][]byte, n)
	for i := range board {
		board[i] = make([]byte, n)
		for j := range board[i] {
			board[i][j] = '.'
		}
	}

	var backtrack func(r int)
	backtrack = func(r int) {
		if r == n {
			var snapshot []string
			for _, row := range board {
				snapshot = append(snapshot, string(row))
			}
			res = append(res, snapshot)
			return
		}

		for c := 0; c < n; c++ {
			if cols[c] || diag1[r-c] || diag2[r+c] {
				continue
			}

			// Place queen
			board[r][c] = 'Q'
			cols[c] = true
			diag1[r-c] = true
			diag2[r+c] = true

			backtrack(r + 1)

			// Remove queen
			board[r][c] = '.'
			cols[c] = false
			diag1[r-c] = false
			diag2[r+c] = false
		}
	}

	backtrack(0)
	return res
}

func main() {
	solutions := SolveNQueens(4)
	fmt.Printf("Found %d solutions for 4-Queens:\\n\\n", len(solutions))
	for i, sol := range solutions {
		fmt.Printf("Solution %d:\\n", i+1)
		for _, row := range sol {
			fmt.Printf("  %s\\n", row)
		}
		fmt.Println()
	}
}`,
    exercise: `package main

import "fmt"

// TASK: Combination Sum.
// Given an array of distinct integers candidates and a target integer,
// return a list of all unique combinations where the chosen numbers sum to target.
// The same number may be chosen unlimited times.
func CombinationSum(candidates []int, target int) [][]int {
	var res [][]int
	var path []int

	var backtrack func(start, remain int)
	backtrack = func(start, remain int) {
		if remain == 0 {
			snapshot := make([]int, len(path))
			copy(snapshot, path)
			res = append(res, snapshot)
			return
		}
		if remain < 0 {
			return
		}

		for i := start; i < len(candidates); i++ {
			path = append(path, candidates[i])
			backtrack(i, remain-candidates[i]) // i instead of i+1 because reuse is allowed
			path = path[:len(path)-1]
		}
	}

	backtrack(0, target)
	return res
}

func main() {
	candidates := []int{2, 3, 6, 7}
	target := 7
	result := CombinationSum(candidates, target)

	fmt.Printf("Candidates: %v, Target: %d\\n", candidates, target)
	fmt.Println("Combinations:")
	for _, c := range result {
		fmt.Printf("  %v\\n", c)
	}
	// Expected: [2, 2, 3] and [7]
}`
  }
}

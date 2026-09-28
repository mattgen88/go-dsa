export const treesTopic = {
  id: 'binary-search-tree',
  title: 'Binary Search Trees & Traversals',
  category: 'hierarchical',
  difficulty: 'Intermediate',
  icon: 'GitFork',
  summary: 'Ordered tree structures, recursive & iterative tree traversals (DFS/BFS), and balancing principles.',
  timeComplexity: {
    access: 'O(log n) avg / O(n) worst',
    search: 'O(log n) avg / O(n) worst',
    insertion: 'O(log n) avg / O(n) worst',
    deletion: 'O(log n) avg / O(n) worst',
    space: 'O(n)'
  },
  keyPoints: [
    'A Binary Search Tree (BST) maintains the invariant: left child < node <= right child.',
    'In-order traversal (`Left -> Node -> Right`) of a BST yields elements in strictly ascending sorted order.',
    'Level-order traversal uses a FIFO queue to process nodes row by row (Breadth-First Search).',
    'Unbalanced BSTs can degenerate into linked lists with O(n) operations; self-balancing trees (AVL, Red-Black) guarantee O(log n).'
  ],
  goInternals: `// Generic Ordered BST Node in Go:
import "cmp"

type TreeNode[T cmp.Ordered] struct {
    Val   T
    Left  *TreeNode[T]
    Right *TreeNode[T]
}

// In Go, recursive traversals are clean and idiomatic,
// while BFS level-order traversal uses a slice as a FIFO queue.`,
  visualizerType: 'tree',
  codeSamples: {
    core: `package main

import (
	"cmp"
	"fmt"
)

type TreeNode[T cmp.Ordered] struct {
	Val   T
	Left  *TreeNode[T]
	Right *TreeNode[T]
}

// Insert adds a value maintaining BST property
func Insert[T cmp.Ordered](root *TreeNode[T], val T) *TreeNode[T] {
	if root == nil {
		return &TreeNode[T]{Val: val}
	}
	if val < root.Val {
		root.Left = Insert(root.Left, val)
	} else if val > root.Val {
		root.Right = Insert(root.Right, val)
	}
	return root
}

// Search searches for a target value
func Search[T cmp.Ordered](root *TreeNode[T], target T) bool {
	if root == nil {
		return false
	}
	if root.Val == target {
		return true
	}
	if target < root.Val {
		return Search(root.Left, target)
	}
	return Search(root.Right, target)
}

// PreOrder traversal: Root -> Left -> Right
func PreOrder[T cmp.Ordered](root *TreeNode[T], result *[]T) {
	if root == nil {
		return
	}
	*result = append(*result, root.Val)
	PreOrder(root.Left, result)
	PreOrder(root.Right, result)
}

// InOrder traversal: Left -> Root -> Right (Produces sorted order)
func InOrder[T cmp.Ordered](root *TreeNode[T], result *[]T) {
	if root == nil {
		return
	}
	InOrder(root.Left, result)
	*result = append(*result, root.Val)
	InOrder(root.Right, result)
}

// PostOrder traversal: Left -> Right -> Root
func PostOrder[T cmp.Ordered](root *TreeNode[T], result *[]T) {
	if root == nil {
		return
	}
	PostOrder(root.Left, result)
	PostOrder(root.Right, result)
	*result = append(*result, root.Val)
}

// LevelOrder traversal (BFS) using slice queue
func LevelOrder[T cmp.Ordered](root *TreeNode[T]) [][]T {
	if root == nil {
		return nil
	}
	var res [][]T
	queue := []*TreeNode[T]{root}

	for len(queue) > 0 {
		levelSize := len(queue)
		var currentLevel []T

		for i := 0; i < levelSize; i++ {
			node := queue[0]
			queue = queue[1:]
			currentLevel = append(currentLevel, node.Val)

			if node.Left != nil {
				queue = append(queue, node.Left)
			}
			if node.Right != nil {
				queue = append(queue, node.Right)
			}
		}
		res = append(res, currentLevel)
	}
	return res
}

func main() {
	var root *TreeNode[int]
	values := []int{50, 30, 70, 20, 40, 60, 80}

	fmt.Println("Inserting values:", values)
	for _, v := range values {
		root = Insert(root, v)
	}

	var preOrderVals []int
	var inOrderVals []int
	var postOrderVals []int

	PreOrder(root, &preOrderVals)
	fmt.Printf("Pre-Order Traversal  (Root->L->R): %v\\n", preOrderVals)

	InOrder(root, &inOrderVals)
	fmt.Printf("In-Order Traversal   (L->Root->R): %v (Sorted!)\\n", inOrderVals)

	PostOrder(root, &postOrderVals)
	fmt.Printf("Post-Order Traversal (L->R->Root): %v\\n", postOrderVals)

	levels := LevelOrder(root)
	fmt.Println("Level-Order Traversal (BFS row by row):")
	for i, lvl := range levels {
		fmt.Printf("  Level %d: %v\\n", i, lvl)
	}

	fmt.Printf("\\nSearch 40: %t (Expected: true)\\n", Search(root, 40))
	fmt.Printf("Search 99: %t (Expected: false)\\n", Search(root, 99))
}`,
    practical: `package main

import "fmt"

type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

// LowestCommonAncestor finds the lowest common ancestor of two nodes in a BST
func LowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
	curr := root
	for curr != nil {
		if p.Val < curr.Val && q.Val < curr.Val {
			curr = curr.Left
		} else if p.Val > curr.Val && q.Val > curr.Val {
			curr = curr.Right
		} else {
			return curr // Found split point!
		}
	}
	return nil
}

func main() {
	// Construct BST:
	//        6
	//      /   \\
	//     2     8
	//    / \\   / \\
	//   0   4 7   9
	root := &TreeNode{Val: 6}
	p := &TreeNode{Val: 2}
	q := &TreeNode{Val: 8}
	root.Left = p
	root.Right = q
	p.Left = &TreeNode{Val: 0}
	p.Right = &TreeNode{Val: 4}
	q.Left = &TreeNode{Val: 7}
	q.Right = &TreeNode{Val: 9}

	lca := LowestCommonAncestor(root, p, q)
	fmt.Printf("LCA of %d and %d is: %d (Expected: 6)\\n", p.Val, q.Val, lca.Val)
}`,
    exercise: `package main

import (
	"fmt"
	"math"
)

type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

// TASK: Implement IsValidBST.
// Determine if a binary tree is a valid Binary Search Tree.
func IsValidBST(root *TreeNode) bool {
	return validate(root, math.MinInt64, math.MaxInt64)
}

func validate(node *TreeNode, min, max int) bool {
	if node == nil {
		return true
	}
	if node.Val <= min || node.Val >= max {
		return false
	}
	return validate(node.Left, min, node.Val) && validate(node.Right, node.Val, max)
}

func main() {
	// Tree 1 (Valid): [2, 1, 3]
	validTree := &TreeNode{Val: 2, Left: &TreeNode{Val: 1}, Right: &TreeNode{Val: 3}}
	fmt.Printf("Valid Tree check: %t (Expected: true)\\n", IsValidBST(validTree))

	// Tree 2 (Invalid): [5, 1, 4, nil, nil, 3, 6]
	invalidTree := &TreeNode{
		Val:   5,
		Left:  &TreeNode{Val: 1},
		Right: &TreeNode{Val: 4, Left: &TreeNode{Val: 3}, Right: &TreeNode{Val: 6}},
	}
	fmt.Printf("Invalid Tree check: %t (Expected: false)\\n", IsValidBST(invalidTree))
}`
  }
}

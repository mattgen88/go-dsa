export const treeTraversalsTopic = {
  id: 'tree-traversals',
  title: 'Tree Traversals: DFS & BFS',
  category: 'hierarchical',
  difficulty: 'Intermediate',
  icon: 'GitFork',
  summary: 'Master Pre-Order, In-Order, Post-Order, and Level-Order traversals on Binary, BST, and N-ary trees in Go.',
  timeComplexity: {
    'Pre-Order DFS': 'O(n) time / O(h) space',
    'In-Order DFS': 'O(n) time / O(h) space',
    'Post-Order DFS': 'O(n) time / O(h) space',
    'Level-Order BFS': 'O(n) time / O(w) space',
    'N-ary DFS': 'O(n) time / O(h) space'
  },
  keyPoints: [
    'Pre-Order (Root -> Left -> Right): Visits root before subtrees. Ideal for cloning, copying, or serializing a tree.',
    'In-Order (Left -> Root -> Right): Visits left subtree, then root, then right. On a BST, it produces strictly ascending sorted order.',
    'Post-Order (Left -> Right -> Root): Visits children before root. Essential for bottom-up computation (e.g., directory size calculation, tree deletion, syntax expression evaluation).',
    'Level-Order (BFS): Explores nodes row-by-row horizontally using a FIFO queue slice.',
    'N-ary Trees: General trees with multiple children (`Children []*Node`) are traversed using loop iterations over children during DFS or BFS.'
  ],
  goInternals: `// Traversal Signatures in Idiomatic Go:

// 1. Recursive Depth-First Search:
func PreOrder(node *TreeNode, visit func(int)) {
    if node == nil { return }
    visit(node.Val)
    PreOrder(node.Left, visit)
    PreOrder(node.Right, visit)
}

// 2. Iterative Depth-First Search (Avoids Call Stack Overflow):
func PreOrderIterative(root *TreeNode) []int {
    if root == nil { return nil }
    var result []int
    stack := []*TreeNode{root} // Slice as LIFO stack
    for len(stack) > 0 {
        curr := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        result = append(result, curr.Val)
        if curr.Right != nil { stack = append(stack, curr.Right) }
        if curr.Left != nil  { stack = append(stack, curr.Left) }
    }
    return result
}`,
  visualizerType: 'tree',
  codeSamples: {
    core: `package main

import (
	"fmt"
)

type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

// 1. Pre-Order Traversal: Root -> Left -> Right
func PreOrder(root *TreeNode) []int {
	var result []int
	var traverse func(node *TreeNode)
	traverse = func(node *TreeNode) {
		if node == nil {
			return
		}
		result = append(result, node.Val) // Visit Root
		traverse(node.Left)               // Traverse Left
		traverse(node.Right)              // Traverse Right
	}
	traverse(root)
	return result
}

// 2. In-Order Traversal: Left -> Root -> Right (Sorted order on BST)
func InOrder(root *TreeNode) []int {
	var result []int
	var traverse func(node *TreeNode)
	traverse = func(node *TreeNode) {
		if node == nil {
			return
		}
		traverse(node.Left)               // Traverse Left
		result = append(result, node.Val) // Visit Root
		traverse(node.Right)              // Traverse Right
	}
	traverse(root)
	return result
}

// 3. Post-Order Traversal: Left -> Right -> Root (Bottom-up processing)
func PostOrder(root *TreeNode) []int {
	var result []int
	var traverse func(node *TreeNode)
	traverse = func(node *TreeNode) {
		if node == nil {
			return
		}
		traverse(node.Left)               // Traverse Left
		traverse(node.Right)              // Traverse Right
		result = append(result, node.Val) // Visit Root
	}
	traverse(root)
	return result
}

// 4. Level-Order Traversal: BFS Row-by-Row using a FIFO Queue
func LevelOrder(root *TreeNode) [][]int {
	if root == nil {
		return nil
	}
	var result [][]int
	queue := []*TreeNode{root}

	for len(queue) > 0 {
		levelSize := len(queue)
		var currentLevel []int

		for i := 0; i < levelSize; i++ {
			node := queue[0]
			queue = queue[1:] // Dequeue
			currentLevel = append(currentLevel, node.Val)

			if node.Left != nil {
				queue = append(queue, node.Left) // Enqueue left
			}
			if node.Right != nil {
				queue = append(queue, node.Right) // Enqueue right
			}
		}
		result = append(result, currentLevel)
	}
	return result
}

func main() {
	// Construct Binary Tree:
	//         50
	//       /    \\
	//      30     70
	//     /  \\   /  \\
	//    20  40 60  80
	root := &TreeNode{
		Val: 50,
		Left: &TreeNode{
			Val:   30,
			Left:  &TreeNode{Val: 20},
			Right: &TreeNode{Val: 40},
		},
		Right: &TreeNode{
			Val:   70,
			Left:  &TreeNode{Val: 60},
			Right: &TreeNode{Val: 80},
		},
	}

	fmt.Println("=== Tree Traversal Demonstrations ===")
	fmt.Printf("1. Pre-Order  (Root->Left->Right): %v\\n", PreOrder(root))
	fmt.Printf("2. In-Order   (Left->Root->Right): %v (Sorted!)\\n", InOrder(root))
	fmt.Printf("3. Post-Order (Left->Right->Root): %v\\n", PostOrder(root))

	fmt.Println("\\n4. Level-Order (Breadth-First Search row by row):")
	levels := LevelOrder(root)
	for i, level := range levels {
		fmt.Printf("   Level %d: %v\\n", i, level)
	}
}`,
    practical: `package main

import "fmt"

// N-ary Tree Node (General tree with arbitrary children, e.g. filesystem/DOM)
type NaryNode struct {
	Val      string
	Children []*NaryNode
}

// PreOrderNary traverses general tree depth-first
func PreOrderNary(root *NaryNode, indent string) {
	if root == nil {
		return
	}
	fmt.Printf("%s📁 %s\\n", indent, root.Val)
	for _, child := range root.Children {
		PreOrderNary(child, indent+"  ")
	}
}

// LevelOrderNary traverses general tree level-by-level
func LevelOrderNary(root *NaryNode) [][]string {
	if root == nil {
		return nil
	}
	var res [][]string
	queue := []*NaryNode{root}

	for len(queue) > 0 {
		levelSize := len(queue)
		var currentLevel []string

		for i := 0; i < levelSize; i++ {
			node := queue[0]
			queue = queue[1:]
			currentLevel = append(currentLevel, node.Val)

			for _, child := range node.Children {
				queue = append(queue, child)
			}
		}
		res = append(res, currentLevel)
	}
	return res
}

func main() {
	// Build a filesystem tree:
	// root/
	//   ├── src/
	//   │    ├── main.go
	//   │    └── app.vue
	//   ├── docs/
	//   │    └── spec.md
	//   └── package.json
	tree := &NaryNode{
		Val: "project-root",
		Children: []*NaryNode{
			{
				Val: "src",
				Children: []*NaryNode{
					{Val: "main.go"},
					{Val: "app.vue"},
				},
			},
			{
				Val: "docs",
				Children: []*NaryNode{
					{Val: "spec.md"},
				},
			},
			{Val: "package.json"},
		},
	}

	fmt.Println("=== 1. N-ary Tree Directory Hierarchy (DFS Pre-Order) ===")
	PreOrderNary(tree, "")

	fmt.Println("\\n=== 2. N-ary Tree BFS Level-Order Layers ===")
	levels := LevelOrderNary(tree)
	for depth, items := range levels {
		fmt.Printf("Depth %d: %v\\n", depth, items)
	}
}`,
    exercise: `package main

import "fmt"

type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

// TASK: Implement ZigzagLevelOrder (Spiral Traversal).
// Traverse nodes level-by-level: left-to-right for level 0,
// right-to-left for level 1, left-to-right for level 2, etc.
func ZigzagLevelOrder(root *TreeNode) [][]int {
	if root == nil {
		return nil
	}
	var result [][]int
	queue := []*TreeNode{root}
	leftToRight := true

	for len(queue) > 0 {
		levelSize := len(queue)
		levelVals := make([]int, levelSize)

		for i := 0; i < levelSize; i++ {
			node := queue[0]
			queue = queue[1:]

			// Determine insert index based on direction
			idx := i
			if !leftToRight {
				idx = levelSize - 1 - i
			}
			levelVals[idx] = node.Val

			if node.Left != nil {
				queue = append(queue, node.Left)
			}
			if node.Right != nil {
				queue = append(queue, node.Right)
			}
		}

		result = append(result, levelVals)
		leftToRight = !leftToRight // Alternate direction
	}
	return result
}

func main() {
	// Construct Tree:
	//         3
	//       /   \\
	//      9     20
	//           /  \\
	//          15   7
	root := &TreeNode{
		Val:  3,
		Left: &TreeNode{Val: 9},
		Right: &TreeNode{
			Val:   20,
			Left:  &TreeNode{Val: 15},
			Right: &TreeNode{Val: 7},
		},
	}

	zigzag := ZigzagLevelOrder(root)
	fmt.Println("Zigzag (Spiral) Traversal Result:")
	for i, lvl := range zigzag {
		fmt.Printf("  Level %d: %v\\n", i, lvl)
	}

	// Validation
	if len(zigzag) == 3 && zigzag[0][0] == 3 && zigzag[1][0] == 20 && zigzag[1][1] == 9 {
		fmt.Println("\\nSUCCESS: Correctly performed alternating zigzag traversal!")
	} else {
		fmt.Println("\\nFAILURE: Output did not match expected zigzag sequence.")
	}
}`
  }
}

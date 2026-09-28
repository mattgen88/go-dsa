export const graphsTopic = {
  id: 'graphs',
  title: 'Graphs: BFS, DFS & Shortest Path',
  category: 'graphs',
  difficulty: 'Intermediate',
  icon: 'Share2',
  summary: 'Adjacency lists in Go, breadth-first search for shortest hops, depth-first search, and Dijkstra.',
  timeComplexity: {
    access: 'O(V + E)',
    search: 'O(V + E)',
    insertion: 'O(1) edge addition',
    deletion: 'O(E) edge removal',
    space: 'O(V + E)'
  },
  keyPoints: [
    'Graphs consist of Vertices (V) and Edges (E). In Go, an adjacency list `map[T][]T` is the standard representation.',
    'Breadth-First Search (BFS) explores neighbor-by-neighbor using a queue, guaranteeing the shortest path in unweighted graphs.',
    'Depth-First Search (DFS) explores as deep as possible before backtracking, ideal for topological sort and cycle detection.',
    'Dijkstra’s algorithm uses a priority queue (Min-Heap) to calculate single-source shortest paths on non-negative weighted graphs in O(E log V).'
  ],
  goInternals: `// Idiomatic Graph Adjacency List in Go:
type Graph[T comparable] struct {
    adjList map[T][]T
}

func (g *Graph[T]) AddEdge(u, v T, bidirectional bool) {
    g.adjList[u] = append(g.adjList[u], v)
    if bidirectional {
        g.adjList[v] = append(g.adjList[v], u)
    }
}`,
  visualizerType: 'graph',
  codeSamples: {
    core: `package main

import "fmt"

type Graph struct {
	adj map[string][]string
}

func NewGraph() *Graph {
	return &Graph{adj: make(map[string][]string)}
}

func (g *Graph) AddEdge(u, v string) {
	g.adj[u] = append(g.adj[u], v)
	g.adj[v] = append(g.adj[v], u) // Undirected
}

// BFS traverses level by level using a queue
func (g *Graph) BFS(start string) []string {
	visited := make(map[string]bool)
	var order []string
	queue := []string{start}
	visited[start] = true

	for len(queue) > 0 {
		curr := queue[0]
		queue = queue[1:]
		order = append(order, curr)

		for _, neighbor := range g.adj[curr] {
			if !visited[neighbor] {
				visited[neighbor] = true
				queue = append(queue, neighbor)
			}
		}
	}
	return order
}

// DFS traverses depth-first recursively
func (g *Graph) DFS(start string) []string {
	visited := make(map[string]bool)
	var order []string

	var dfsHelper func(node string)
	dfsHelper = func(node string) {
		visited[node] = true
		order = append(order, node)
		for _, neighbor := range g.adj[node] {
			if !visited[neighbor] {
				dfsHelper(neighbor)
			}
		}
	}

	dfsHelper(start)
	return order
}

func main() {
	g := NewGraph()
	g.AddEdge("A", "B")
	g.AddEdge("A", "C")
	g.AddEdge("B", "D")
	g.AddEdge("C", "E")
	g.AddEdge("D", "E")
	g.AddEdge("E", "F")

	fmt.Println("Graph Adjacency List:")
	for node, neighbors := range g.adj {
		fmt.Printf("  %s: %v\\n", node, neighbors)
	}

	fmt.Println("\\nBFS Traversal starting from 'A':", g.BFS("A"))
	fmt.Println("DFS Traversal starting from 'A':", g.DFS("A"))
}`,
    practical: `package main

import (
	"container/heap"
	"fmt"
	"math"
)

type Edge struct {
	to     int
	weight int
}

type Item struct {
	node int
	dist int
}

type PriorityQueue []Item
func (pq PriorityQueue) Len() int           { return len(pq) }
func (pq PriorityQueue) Less(i, j int) bool { return pq[i].dist < pq[j].dist }
func (pq PriorityQueue) Swap(i, j int)      { pq[i], pq[j] = pq[j], pq[i] }
func (pq *PriorityQueue) Push(x any)        { *pq = append(*pq, x.(Item)) }
func (pq *PriorityQueue) Pop() any {
	old := *pq
	n := len(old)
	item := old[n-1]
	*pq = old[0 : n-1]
	return item
}

// Dijkstra calculates shortest distance from source to all nodes
func Dijkstra(n int, adj [][]Edge, src int) []int {
	dist := make([]int, n)
	for i := range dist {
		dist[i] = math.MaxInt32
	}
	dist[src] = 0

	pq := &PriorityQueue{}
	heap.Init(pq)
	heap.Push(pq, Item{node: src, dist: 0})

	for pq.Len() > 0 {
		top := heap.Pop(pq).(Item)
		u, d := top.node, top.dist

		if d > dist[u] {
			continue
		}

		for _, edge := range adj[u] {
			v, weight := edge.to, edge.weight
			if dist[u]+weight < dist[v] {
				dist[v] = dist[u] + weight
				heap.Push(pq, Item{node: v, dist: dist[v]})
			}
		}
	}
	return dist
}

func main() {
	n := 5 // nodes 0 to 4
	adj := make([][]Edge, n)

	// Add weighted directed edges
	adj[0] = []Edge{{1, 4}, {2, 2}}
	adj[1] = []Edge{{2, 1}, {3, 5}}
	adj[2] = []Edge{{3, 8}, {4, 10}}
	adj[3] = []Edge{{4, 2}}

	distances := Dijkstra(n, adj, 0)
	fmt.Println("Shortest distances from source node 0:")
	for node, d := range distances {
		fmt.Printf("  Node %d: distance = %d\\n", node, d)
	}
}`,
    exercise: `package main

import "fmt"

// TASK: Detect if a directed graph contains a cycle using Kahn's algorithm (Topological Sort).
// Return true if cycle exists, false otherwise.
func HasCycleDirected(numCourses int, prerequisites [][]int) bool {
	inDegree := make([]int, numCourses)
	adj := make([][]int, numCourses)

	for _, pre := range prerequisites {
		course, prereq := pre[0], pre[1]
		adj[prereq] = append(adj[prereq], course)
		inDegree[course]++
	}

	queue := []int{}
	for i := 0; i < numCourses; i++ {
		if inDegree[i] == 0 {
			queue = append(queue, i)
		}
	}

	visitedCount := 0
	for len(queue) > 0 {
		curr := queue[0]
		queue = queue[1:]
		visitedCount++

		for _, neighbor := range adj[curr] {
			inDegree[neighbor]--
			if inDegree[neighbor] == 0 {
				queue = append(queue, neighbor)
			}
		}
	}

	return visitedCount != numCourses
}

func main() {
	// 2 courses, 1 -> 0 (acyclic)
	test1 := [][]int{{1, 0}}
	fmt.Printf("Test 1 (1->0): Has cycle? %t (Expected: false)\\n", HasCycleDirected(2, test1))

	// 2 courses, 1 -> 0 and 0 -> 1 (cyclic)
	test2 := [][]int{{1, 0}, {0, 1}}
	fmt.Printf("Test 2 (1<->0): Has cycle? %t (Expected: true)\\n", HasCycleDirected(2, test2))
}`
  }
}

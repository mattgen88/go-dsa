export const vectorClocksTopic = {
  id: 'vector-clocks',
  title: 'Vector Clocks & Causality',
  category: 'distributed',
  difficulty: 'Advanced',
  icon: 'Clock',
  summary: 'Tracking event causality and detecting concurrent conflicting updates in leaderless distributed storage engines.',
  timeComplexity: {
    'Local Event Tick': 'O(1)',
    'Merge Vector Clock': 'O(N) where N is number of nodes',
    'Causality Comparison': 'O(N)',
    'Space': 'O(N)'
  },
  keyPoints: [
    'Physical clocks in distributed systems drift (NTP skew); vector clocks provide logical causality without synchronized hardware clocks.',
    'A Vector Clock is an array/map of logical counters, where `VC[i]` is the current clock tick of node $i$.',
    'Comparison rules: Event $A$ happened before $B$ ($A < B$) if for all nodes $k$, $A[k] \le B[k]$ and for at least one node $j$, $A[j] < B[j]$.',
    'Concurrent (Conflict): If neither $A < B$ nor $B < A$, the events occurred concurrently! The system flags a conflict (like Git merge conflict or Dynamo siblings).'
  ],
  goInternals: `// In Go, vector clocks are maps from NodeID to counter:
type VectorClock map[string]int

func (vc VectorClock) Increment(nodeID string) {
    vc[nodeID]++
}`,
  visualizerType: 'array',
  codeSamples: {
    core: `package main

import "fmt"

type VectorClock map[string]int

func NewVC() VectorClock {
	return make(VectorClock)
}

func (vc VectorClock) Clone() VectorClock {
	clone := make(VectorClock, len(vc))
	for k, v := range vc {
		clone[k] = v
	}
	return clone
}

// Tick increments the node's own logical counter
func (vc VectorClock) Tick(nodeID string) {
	vc[nodeID]++
}

// Merge merges clock received from message: VC[k] = max(VC[k], other[k])
func (vc VectorClock) Merge(other VectorClock) {
	for k, v := range other {
		if v > vc[k] {
			vc[k] = v
		}
	}
}

// Compare determines causality: -1 (A happened before B), 1 (B happened before A), 0 (Concurrent)
func Compare(a, b VectorClock) string {
	aLeqB := true // a <= b for all keys
	bLeqA := true // b <= a for all keys

	allKeys := make(map[string]bool)
	for k := range a {
		allKeys[k] = true
	}
	for k := range b {
		allKeys[k] = true
	}

	for k := range allKeys {
		valA := a[k]
		valB := b[k]

		if valA > valB {
			aLeqB = false
		}
		if valB > valA {
			bLeqA = false
		}
	}

	if aLeqB && !bLeqA {
		return "A happened before B (A -> B)"
	}
	if bLeqA && !aLeqB {
		return "B happened before A (B -> A)"
	}
	if aLeqB && bLeqA {
		return "Identical Clocks (A == B)"
	}
	return "CONCURRENT / Conflict (A || B)"
}

func main() {
	// Scenario: Node A and Node B
	clockA := NewVC()
	clockA.Tick("A") // Event 1 on A: {A: 1}

	clockB := clockA.Clone() // B receives message from A
	clockB.Tick("B")        // Event on B: {A: 1, B: 1}

	fmt.Printf("Clock A: %v\\n", clockA)
	fmt.Printf("Clock B: %v\\n", clockB)
	fmt.Printf("Relationship: %s\\n\\n", Compare(clockA, clockB))

	// Now concurrent diverged updates:
	clockA.Tick("A") // A does local update: {A: 2, B: 0}
	clockC := NewVC()
	clockC.Tick("C") // C does independent update: {C: 1}

	fmt.Printf("Clock A: %v\\n", clockA)
	fmt.Printf("Clock C: %v\\n", clockC)
	fmt.Printf("Relationship: %s\\n", Compare(clockA, clockC))
}`,
    practical: `package main

import "fmt"

// ShoppingCart demonstrating Dynamo-style conflict resolution
type CartItem struct {
	Item     string
	Version  map[string]int
}

func main() {
	// User modifies cart on US-East replica
	cartEast := CartItem{
		Item:    "Apple (Added on East)",
		Version: map[string]int{"East": 1, "West": 0},
	}

	// User modifies cart on US-West replica concurrently
	cartWest := CartItem{
		Item:    "Banana (Added on West)",
		Version: map[string]int{"East": 0, "West": 1},
	}

	fmt.Println("East replica cart version:", cartEast.Version)
	fmt.Println("West replica cart version:", cartWest.Version)
	fmt.Println("Status: Concurrent diverged writes detected!")
	fmt.Println("Resolution: Return both items (siblings) to client for user union resolution.")
}`,
    exercise: `package main

import "fmt"

// TASK: Implement IsAncestor.
// Return true if clockA happened before clockB.
func IsAncestor(a, b map[string]int) bool {
	strictlySmaller := false
	for k, vA := range a {
		vB := b[k]
		if vA > vB {
			return false
		}
		if vA < vB {
			strictlySmaller = true
		}
	}
	return strictlySmaller
}

func main() {
	cA := map[string]int{"A": 1, "B": 2}
	cB := map[string]int{"A": 2, "B": 2}
	fmt.Printf("Is cA ancestor of cB? %t (Expected: true)\\n", IsAncestor(cA, cB))
}`
  }
}

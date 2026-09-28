export const raftConsensusTopic = {
  id: 'raft-consensus',
  title: 'Raft Consensus: Leader Election',
  category: 'distributed',
  difficulty: 'Advanced',
  icon: 'Server',
  summary: 'Understandable consensus protocol powering Kubernetes (etcd), HashiCorp Consul, and distributed key-value stores.',
  timeComplexity: {
    'Leader Election': 'O(election_timeout)',
    'Log Replication': 'O(1) round trips to majority quorum',
    'Quorum Required': '(N / 2) + 1 nodes'
  },
  keyPoints: [
    'Raft breaks consensus into 3 independent subproblems: (1) **Leader Election**, (2) **Log Replication**, and (3) **Safety**.',
    'A node is always in one of three states: **Follower**, **Candidate**, or **Leader**.',
    'Followers reset randomized election timeouts upon receiving heartbeats from the Leader. If a heartbeat expires, the follower promotes to Candidate, increments `term`, and requests votes.',
    'Quorum rule: A Candidate becomes Leader only after receiving votes from a strict majority $(N/2)+1$ of the cluster.'
  ],
  goInternals: `// Raft State Representation in Go:
type NodeRole int
const (
    Follower NodeRole = iota
    Candidate
    Leader
)

type RaftNode struct {
    id        int
    currentTerm int
    votedFor    int
    role        NodeRole
    mu          sync.Mutex
}`,
  visualizerType: 'graph',
  codeSamples: {
    core: `package main

import (
	"fmt"
)

type Role string

const (
	Follower  Role = "Follower"
	Candidate Role = "Candidate"
	Leader    Role = "Leader"
)

type Node struct {
	id          int
	term        int
	role        Role
	votedFor    int
	clusterSize int
}

// StartElection transitions Follower -> Candidate and solicits votes
func (n *Node) StartElection(peers []*Node) bool {
	n.role = Candidate
	n.term++
	n.votedFor = n.id
	votesReceived := 1 // Vote for self

	fmt.Printf("[Node %d] Election timeout! Promoted to %s for Term %d\\n", 
		n.id, n.role, n.term)

	// Solicit votes from peers
	for _, peer := range peers {
		if peer.id == n.id {
			continue
		}
		if peer.RequestVote(n.term, n.id) {
			votesReceived++
		}
	}

	majority := (n.clusterSize / 2) + 1
	if votesReceived >= majority {
		n.role = Leader
		fmt.Printf(" -> [Node %d] Won election with %d/%d votes! New LEADER for Term %d!\\n",
			n.id, votesReceived, n.clusterSize, n.term)
		return true
	}

	n.role = Follower
	fmt.Printf(" -> [Node %d] Failed election (%d/%d votes). Stepped down to Follower.\\n",
		n.id, votesReceived, n.clusterSize)
	return false
}

func (n *Node) RequestVote(candidateTerm, candidateID int) bool {
	// Grant vote if candidate has newer term and we haven't voted in this term
	if candidateTerm > n.term {
		n.term = candidateTerm
		n.votedFor = candidateID
		n.role = Follower
		return true
	}
	return false
}

func main() {
	clusterSize := 3
	nodes := make([]*Node, clusterSize)
	for i := 0; i < clusterSize; i++ {
		nodes[i] = &Node{id: i + 1, term: 0, role: Follower, votedFor: -1, clusterSize: clusterSize}
	}

	fmt.Println("Initial 3-Node Raft Cluster (all Followers):")
	for _, n := range nodes {
		fmt.Printf("  Node %d: %s (Term %d)\\n", n.id, n.role, n.term)
	}

	fmt.Println("\\nNode 1 triggers election timeout:")
	nodes[0].StartElection(nodes)

	fmt.Println("\\nCluster state after election:")
	for _, n := range nodes {
		fmt.Printf("  Node %d: %s (Term %d)\\n", n.id, n.role, n.term)
	}
}`,
    practical: `package main

import (
	"fmt"
	"time"
)

// HeartbeatTick demonstrates periodic leader heartbeats suppressing follower timeouts
func main() {
	heartbeatChan := make(chan string)

	// Simulated Leader sending heartbeats
	go func() {
		for i := 1; i <= 3; i++ {
			time.Sleep(100 * time.Millisecond)
			heartbeatChan <- fmt.Sprintf("Heartbeat #%d from Leader", i)
		}
	}()

	// Simulated Follower with timeout
	for i := 0; i < 3; i++ {
		select {
		case msg := <-heartbeatChan:
			fmt.Printf("[Follower] Received: %s -> Reset election timer.\\n", msg)
		case <-time.After(300 * time.Millisecond):
			fmt.Println("[Follower] Timeout expired! Starting election...")
		}
	}
}`,
    exercise: `package main

import "fmt"

// TASK: CalculateQuorum.
// Determine if voteCount represents a strict majority in a cluster of size n.
func HasQuorum(voteCount, clusterSize int) bool {
	return voteCount >= (clusterSize/2)+1
}

func main() {
	fmt.Printf("3-node cluster, 2 votes: %t (Expected: true)\\n", HasQuorum(2, 3))
	fmt.Printf("5-node cluster, 2 votes: %t (Expected: false)\\n", HasQuorum(2, 5))
	fmt.Printf("5-node cluster, 3 votes: %t (Expected: true)\\n", HasQuorum(3, 5))
}`
  }
}

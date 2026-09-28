# GoDSA — Interactive Go Data Structures & Algorithms Lab

An interactive Data Structures and Algorithms learning and practice platform built with **Vue 3** (Single Page Application) and powered by **Golang Playground** and local Go tooling.

![GoDSA Lab](https://img.shields.io/badge/Golang-1.27+-00ADD8?style=flat&logo=go&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3.5+-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

---

## 🚀 Features

- **Categorized Curriculum & Explorer**:
  - **Top Interview Must-Knows**: LRU Cache (O(1) Hash Map + Doubly Linked List), Interval Scheduling & Merging, Binary Search on Answer Space (Monotonic Predicates).
  - **Database Internals & Storage**: Bloom Filters in Storage Engines (preventing disk I/O), LSM-Trees & SSTables (MemTable, WAL, compaction in RocksDB/Cassandra), B+ Tree Database Indexing (MySQL InnoDB range scans).
  - **Distributed Systems & Consensus**: Consistent Hashing & Virtual Nodes (Dynamo/Cassandra ring routing), Raft Consensus Protocol (Leader election, heartbeats, quorum), Vector Clocks & Causality (conflict detection in leaderless stores).
  - **Networking & Flow Control**: Rate Limiting (Token Bucket & Leaky Bucket algorithms), TCP Sliding Window Flow Control (sequence numbers, cumulative ACKs, BDP).
  - **Linear Structures**: Arrays & Dynamic Slices (slice headers, capacity doubling, sub-slicing), Singly & Doubly Linked Lists, Stacks & Queues, Hash Tables & Go Map internals (`hmap`/`bmap`).
  - **Trees & Hierarchical**: Binary Search Trees (BST), Tree Traversals (Pre/In/Post/Level-Order DFS & BFS, N-ary trees), Heaps & Priority Queues (`container/heap`), Tries (Prefix Trees).
  - **Graph Structures**: Adjacency lists, Breadth-First Search (BFS), Depth-First Search (DFS), Dijkstra's shortest path, Directed cycle detection.
  - **Sorting Algorithms**: Bubble, Selection, Insertion Sort (why Go uses it for small slices), Merge Sort, Quick Sort (Lomuto partitioning & Go's `pdqsort`).
  - **Searching & Pointer Patterns**: Binary Search, lower/upper bounds (`slices.BinarySearch`), Two Pointers, Sliding Window.
  - **Advanced Paradigms**: Dynamic Programming (memoization vs tabulation), Recursion & Backtracking (Subsets, Permutations, N-Queens).

- **Interactive Visualizers**:
  - **LRU Cache Visualizer**: Watch MRU head promotions, tail evictions on cache overflow, and O(1) hash map links.
  - **Consistent Hashing Ring**: 360° circular ring with node tokens and keys routing clockwise; add/remove nodes to observe minimal key migration.
  - **Token Bucket Rate Limiter**: Interactive bucket with token refilling, request consumption, bursts, and 429 rate limit triggers.
  - **Bloom Filter Bitset**: 16-bit array with multiple hash functions showing "Definitely NOT in set" vs "Probably in set".
  - **Merge Intervals Timeline**: Numeric timeline showing overlapping interval bars consolidating into non-overlapping spans.
  - **Slice Growth & Sub-slice Visualizer**: Watch capacity double when appending, inspect slice headers (`*ptr`, `len`, `cap`), and visualize sub-slice windows sharing memory.
  - **Linked List Node Chainer**: Interactive pointer transitions, prepend, append, delete, and list reversal.
  - **Stack & Queue Container**: Vertical LIFO tube and horizontal FIFO pipe animations.
  - **Binary Search Stepper**: Highlights `low`, `high`, `mid`, and visualizes eliminating the search space.
  - **Bar Chart Sorting Player**: Step-by-step or auto-play Bubble, Selection, and Insertion sorts with color-coded comparisons and swaps.
  - **Binary Search Tree Graph**: SVG tree rendering with insertion, search path highlight, and In-Order/Pre-Order/Post-Order/Level-Order playback.
  - **Graph Network Traversal**: Step-by-step BFS and DFS node exploration.
  - **Two Pointers Convergence**: Visual pointer markers moving inward with sum calculations.

- **Integrated Go Runner & Playground**:
  - **Sub-50ms local execution**: Instant compilation and execution via Go runtime with 5-second timeout sandbox.
  - **Go Playground API Fallback**: Seamless proxy to `https://go.dev/_/compile` when running online.
  - **`go fmt` formatting**: Clean, automatic code formatting via standard `go/format`.
  - **1-Click Share to Go Playground**: Generates an official `go.dev/play/p/...` link to continue experimenting in Google's official playground.
  - **3 Runnable Code Tabs Per Topic**:
    1. *Core Implementation*: Clean, idiomatic Go data structure code with `main()` demo.
    2. *Real-World Application*: Classic problems (e.g. Daily Temperatures, Autocomplete, Two Sum, Robber).
    3. *Hands-On Challenge*: Pre-built test harness with instant pass/fail validation and confetti celebrations.

- **Progress & Mastery Tracking**:
  - Automatically tracks completed and practiced topics in `localStorage`.
  - Complexity matrix for each data structure (Access, Search, Insertion, Deletion, Space).

---

## 🛠️ Quick Start

### Option 1: Run the Go Server (Recommended)

Builds the frontend and runs the unified Go backend server on `http://localhost:8080`:

```bash
# 1. Install frontend dependencies (if not already installed)
npm install

# 2. Build the Vue 3 SPA
npm run build

# 3. Start the Go server
go run cmd/server/main.go
# Or: npm run server
```

Open your browser to:
```
http://localhost:8080
```

### Option 2: Frontend Development with Vite (Hot Reloading)

If you're modifying Vue components or styling with Vite hot reloading:

```bash
# Terminal 1: Start Go backend (for /api/run and /api/fmt)
go run cmd/server/main.go

# Terminal 2: Start Vite Dev Server
npm run dev
```

Open your browser to:
```
http://localhost:5173
```
Vite automatically proxies `/api` calls to `http://localhost:8080`.

---

## 📂 Project Structure

```
.
├── cmd/
│   └── server/
│       └── main.go          # Go HTTP server (handles /api/run, /api/fmt, /api/share, SPA static assets)
├── src/
│   ├── assets/
│   │   └── main.css         # Tailwind CSS & CodeMirror styling
│   ├── components/
│   │   ├── Header.vue       # Header with search, status, and mastery badges
│   │   ├── Sidebar.vue      # Category & topic navigation menu
│   │   ├── TopicDetail.vue  # Main topic view with tabbed visualizer & runner
│   │   ├── CodeEditor.vue   # CodeMirror 6 editor with Go syntax highlighting
│   │   ├── OutputConsole.vue# Terminal output console
│   │   ├── Visualizer.vue   # Dynamic visualizer dispatcher
│   │   └── visualizers/     # Interactive visualizer components
│   │       ├── ArrayVisualizer.vue
│   │       ├── LinkedListVisualizer.vue
│   │       ├── StackQueueVisualizer.vue
│   │       ├── BinarySearchVisualizer.vue
│   │       ├── SortingVisualizer.vue
│   │       ├── TreeVisualizer.vue
│   │       ├── GraphVisualizer.vue
│   │       └── TwoPointersVisualizer.vue
│   ├── data/
│   │   ├── categories.js    # Curriculum taxonomy & category definitions
│   │   ├── index.js         # Topic registry and search helpers
│   │   └── topics/          # 14 Detailed DSA topics with explanations and Go code
│   ├── services/
│   │   └── playground.js    # API client for Go runner & official playground
│   ├── App.vue              # Root application layout
│   └── main.js              # Vue 3 entry point
├── dist/                    # Production built SPA assets
├── index.html               # Main HTML entry
├── vite.config.js           # Vite configuration with Tailwind CSS & API proxy
├── package.json             # NPM package scripts & dependencies
└── go.mod                   # Go module definition
```

---

## 🧪 Adding New Topics

To add a new data structure or algorithm:
1. Create a new file in `src/data/topics/<topic-name>.js`.
2. Define `id`, `title`, `category`, `difficulty`, `timeComplexity`, `keyPoints`, `goInternals`, and `codeSamples` (`core`, `practical`, `exercise`).
3. Import and add it to `topicList` in `src/data/index.js` and list its ID in `src/data/categories.js`.

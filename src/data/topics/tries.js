export const triesTopic = {
  id: 'tries',
  title: 'Tries (Prefix Trees)',
  category: 'hierarchical',
  difficulty: 'Intermediate',
  icon: 'Network',
  summary: 'Tree structure for rapid string retrieval, autocomplete, and IP routing table lookups.',
  timeComplexity: {
    access: 'O(m) where m is key length',
    search: 'O(m)',
    insertion: 'O(m)',
    deletion: 'O(m)',
    space: 'O(m * alphabet_size)'
  },
  keyPoints: [
    'Each node in a Trie represents a character/rune along a string path, sharing common prefixes with other words.',
    'Search time depends strictly on string length `m`, completely independent of the dictionary size `n`!',
    'In Go, children can be stored in an array `[26]*TrieNode` for lowercase English letters (dense & fast) or `map[rune]*TrieNode` (sparse & Unicode-friendly).',
    'Commonly used in search engines (autocomplete), spelling checkers, and router prefix lookups.'
  ],
  goInternals: `// Rune-based Trie in Go:
type TrieNode struct {
    children map[rune]*TrieNode
    isEnd    bool
}

func NewTrieNode() *TrieNode {
    return &TrieNode{children: make(map[rune]*TrieNode)}
}`,
  visualizerType: 'tree',
  codeSamples: {
    core: `package main

import "fmt"

type TrieNode struct {
	children map[rune]*TrieNode
	isEnd    bool
}

type Trie struct {
	root *TrieNode
}

func NewTrie() *Trie {
	return &Trie{
		root: &TrieNode{children: make(map[rune]*TrieNode)},
	}
}

// Insert adds a word into the trie
func (t *Trie) Insert(word string) {
	curr := t.root
	for _, ch := range word {
		if _, exists := curr.children[ch]; !exists {
			curr.children[ch] = &TrieNode{children: make(map[rune]*TrieNode)}
		}
		curr = curr.children[ch]
	}
	curr.isEnd = true
}

// Search checks if the word exists
func (t *Trie) Search(word string) bool {
	curr := t.root
	for _, ch := range word {
		next, exists := curr.children[ch]
		if !exists {
			return false
		}
		curr = next
	}
	return curr.isEnd
}

// StartsWith checks if any word begins with prefix
func (t *Trie) StartsWith(prefix string) bool {
	curr := t.root
	for _, ch := range prefix {
		next, exists := curr.children[ch]
		if !exists {
			return false
		}
		curr = next
	}
	return true
}

func main() {
	trie := NewTrie()
	words := []string{"apple", "app", "application", "apt", "banana", "bat"}
	fmt.Println("Inserting words:", words)
	for _, w := range words {
		trie.Insert(w)
	}

	fmt.Printf("Search 'app': %t (Expected: true)\\n", trie.Search("app"))
	fmt.Printf("Search 'appl': %t (Expected: false)\\n", trie.Search("appl"))
	fmt.Printf("StartsWith 'app': %t (Expected: true)\\n", trie.StartsWith("app"))
	fmt.Printf("StartsWith 'cat': %t (Expected: false)\\n", trie.StartsWith("cat"))
}`,
    practical: `package main

import "fmt"

type TrieNode struct {
	children map[rune]*TrieNode
	isEnd    bool
}

type Autocomplete struct {
	root *TrieNode
}

func NewAutocomplete() *Autocomplete {
	return &Autocomplete{root: &TrieNode{children: make(map[rune]*TrieNode)}}
}

func (ac *Autocomplete) Insert(word string) {
	curr := ac.root
	for _, ch := range word {
		if _, ok := curr.children[ch]; !ok {
			curr.children[ch] = &TrieNode{children: make(map[rune]*TrieNode)}
		}
		curr = curr.children[ch]
	}
	curr.isEnd = true
}

// Suggest finds all words matching given prefix
func (ac *Autocomplete) Suggest(prefix string) []string {
	curr := ac.root
	for _, ch := range prefix {
		next, ok := curr.children[ch]
		if !ok {
			return nil
		}
		curr = next
	}

	var results []string
	var dfs func(node *TrieNode, path []rune)
	dfs = func(node *TrieNode, path []rune) {
		if node.isEnd {
			results = append(results, string(path))
		}
		for ch, child := range node.children {
			dfs(child, append(path, ch))
		}
	}

	dfs(curr, []rune(prefix))
	return results
}

func main() {
	ac := NewAutocomplete()
	terms := []string{"golang", "goroutine", "google", "go-playground", "git", "github"}
	for _, t := range terms {
		ac.Insert(t)
	}

	fmt.Println("Autocomplete suggestions for 'go':", ac.Suggest("go"))
	fmt.Println("Autocomplete suggestions for 'git':", ac.Suggest("git"))
}`,
    exercise: `package main

import "fmt"

type WordDictionary struct {
	children map[rune]*WordDictionary
	isEnd    bool
}

func Constructor() WordDictionary {
	return WordDictionary{children: make(map[rune]*WordDictionary)}
}

func (wd *WordDictionary) AddWord(word string) {
	curr := wd
	for _, ch := range word {
		if _, ok := curr.children[ch]; !ok {
			curr.children[ch] = &WordDictionary{children: make(map[rune]*WordDictionary)}
		}
		curr = curr.children[ch]
	}
	curr.isEnd = true
}

// TASK: Search with '.' wildcard that matches any single character
func (wd *WordDictionary) Search(word string) bool {
	return searchInNode(wd, []rune(word), 0)
}

func searchInNode(node *WordDictionary, runes []rune, index int) bool {
	if index == len(runes) {
		return node.isEnd
	}

	ch := runes[index]
	if ch == '.' {
		// Try all possible children
		for _, child := range node.children {
			if searchInNode(child, runes, index+1) {
				return true
			}
		}
		return false
	}

	child, exists := node.children[ch]
	if !exists {
		return false
	}
	return searchInNode(child, runes, index+1)
}

func main() {
	dict := Constructor()
	dict.AddWord("bad")
	dict.AddWord("dad")
	dict.AddWord("mad")

	fmt.Printf("Search 'pad': %t (Expected: false)\\n", dict.Search("pad"))
	fmt.Printf("Search 'bad': %t (Expected: true)\\n", dict.Search("bad"))
	fmt.Printf("Search '.ad': %t (Expected: true)\\n", dict.Search(".ad"))
	fmt.Printf("Search 'b..': %t (Expected: true)\\n", dict.Search("b.."))
}`
  }
}

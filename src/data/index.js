import { categories } from './categories.js'
import { arraysTopic } from './topics/arrays.js'
import { linkedListsTopic } from './topics/linkedLists.js'
import { stacksQueuesTopic } from './topics/stacksQueues.js'
import { hashMapsTopic } from './topics/hashMaps.js'
import { treesTopic } from './topics/trees.js'
import { treeTraversalsTopic } from './topics/treeTraversals.js'
import { heapsTopic } from './topics/heaps.js'
import { triesTopic } from './topics/tries.js'
import { graphsTopic } from './topics/graphs.js'
import { basicSortsTopic } from './topics/basicSorts.js'
import { advancedSortsTopic } from './topics/advancedSorts.js'
import { binarySearchTopic } from './topics/binarySearch.js'
import { twoPointersTopic } from './topics/twoPointers.js'
import { dynamicProgrammingTopic } from './topics/dynamicProgramming.js'
import { backtrackingTopic } from './topics/backtracking.js'

// New requested topics
import { lruCacheTopic } from './topics/lruCache.js'
import { mergeIntervalsTopic } from './topics/mergeIntervals.js'
import { binarySearchAnswerTopic } from './topics/binarySearchAnswer.js'
import { bloomFilterTopic } from './topics/bloomFilter.js'
import { lsmTreeTopic } from './topics/lsmTree.js'
import { bPlusTreeTopic } from './topics/bPlusTree.js'
import { consistentHashingTopic } from './topics/consistentHashing.js'
import { raftConsensusTopic } from './topics/raftConsensus.js'
import { vectorClocksTopic } from './topics/vectorClocks.js'
import { rateLimiterTopic } from './topics/rateLimiter.js'
import { slidingWindowNetworkTopic } from './topics/slidingWindowNetwork.js'
import { fourierTransformTopic } from './topics/fourierTransform.js'
import { merkleTreeTopic } from './topics/merkleTree.js'
import { aesGcmTopic } from './topics/aesGcm.js'
import { rsaTopic } from './topics/rsa.js'
import { hmacTopic } from './topics/hmac.js'

export const topicList = [
  // Top Interview Must-Knows
  lruCacheTopic,
  mergeIntervalsTopic,
  binarySearchAnswerTopic,

  // Database Internals
  bloomFilterTopic,
  lsmTreeTopic,
  bPlusTreeTopic,

  // Distributed Systems
  consistentHashingTopic,
  raftConsensusTopic,
  vectorClocksTopic,

  // Networking
  rateLimiterTopic,
  slidingWindowNetworkTopic,

  // Cryptography & Hashing
  merkleTreeTopic,
  aesGcmTopic,
  rsaTopic,
  hmacTopic,

  // Signal Processing & Math
  fourierTransformTopic,

  // Classic Data Structures & Algorithms
  arraysTopic,
  linkedListsTopic,
  stacksQueuesTopic,
  hashMapsTopic,
  treesTopic,
  treeTraversalsTopic,
  heapsTopic,
  triesTopic,
  graphsTopic,
  basicSortsTopic,
  advancedSortsTopic,
  binarySearchTopic,
  twoPointersTopic,
  dynamicProgrammingTopic,
  backtrackingTopic
]

export const topicsById = topicList.reduce((acc, topic) => {
  acc[topic.id] = topic
  return acc
}, {})

export const enrichedCategories = categories.map(cat => ({
  ...cat,
  topics: cat.topicIds.map(id => topicsById[id]).filter(Boolean)
}))

export function getTopicById(id) {
  return topicsById[id] || topicList[0]
}

export function searchTopics(query) {
  if (!query) return topicList
  const q = query.toLowerCase().trim()
  return topicList.filter(t => 
    t.title.toLowerCase().includes(q) ||
    t.summary.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.difficulty.toLowerCase().includes(q)
  )
}

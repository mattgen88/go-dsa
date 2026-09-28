import { categories } from './categories'
import { arraysTopic } from './topics/arrays'
import { linkedListsTopic } from './topics/linkedLists'
import { stacksQueuesTopic } from './topics/stacksQueues'
import { hashMapsTopic } from './topics/hashMaps'
import { treesTopic } from './topics/trees'
import { treeTraversalsTopic } from './topics/treeTraversals'
import { heapsTopic } from './topics/heaps'
import { triesTopic } from './topics/tries'
import { graphsTopic } from './topics/graphs'
import { basicSortsTopic } from './topics/basicSorts'
import { advancedSortsTopic } from './topics/advancedSorts'
import { binarySearchTopic } from './topics/binarySearch'
import { twoPointersTopic } from './topics/twoPointers'
import { dynamicProgrammingTopic } from './topics/dynamicProgramming'
import { backtrackingTopic } from './topics/backtracking'

export const topicList = [
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

import { useState, useEffect, useCallback } from 'react'
import { Group } from '@/types'

export const DISCOVERY_CATEGORIES = [
  'All',
  'Startup',
  'Education',
  'Real Estate',
  'Emergency Fund',
  'Travel',
  'Festivals',
  'Farming',
]

export const FREQUENCY_OPTIONS = ['all', 'daily', 'weekly', 'monthly'] as const
export type FrequencyFilter = (typeof FREQUENCY_OPTIONS)[number]

export interface DiscoveryFilters {
  category: string
  minAmount: number
  maxAmount: number
  minMembers: number
  maxMembers: number
  frequency: FrequencyFilter
  searchQuery: string
}

const DEFAULT_FILTERS: DiscoveryFilters = {
  category: 'All',
  minAmount: 0,
  maxAmount: 10000,
  minMembers: 0,
  maxMembers: 50,
  frequency: 'all',
  searchQuery: '',
}

export function useGroupDiscovery() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null)
  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULT_FILTERS)

  const fetchGroups = useCallback(async (pageNum: number, currentFilters: DiscoveryFilters) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const mockGroups: Group[] = Array.from({ length: 10 }).map((_, i) => {
      const id = `discovery-${pageNum}-${i}`
      const category = DISCOVERY_CATEGORIES[Math.floor(Math.random() * (DISCOVERY_CATEGORIES.length - 1)) + 1]
      const frequencies: Array<'weekly' | 'monthly'> = ['weekly', 'monthly']
      const freq = frequencies[Math.floor(Math.random() * frequencies.length)]
      const maxMem = Math.floor(Math.random() * 15) + 5
      return {
        id,
        name: `${category} Savings Circle ${pageNum * 10 + i + 1}`,
        description: `A community savings group focused on ${category.toLowerCase()} goals. Join us to achieve your financial targets together.`,
        creator: `G${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        cycleLength: freq === 'weekly' ? 7 : 30,
        contributionAmount: Math.floor(Math.random() * 490) + 10,
        maxMembers: maxMem,
        currentMembers: Math.floor(Math.random() * (maxMem - 1)) + 1,
        totalContributions: Math.floor(Math.random() * 50000),
        status: 'active' as const,
        createdAt: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
        nextPayoutDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        frequency: freq,
        duration: Math.floor(Math.random() * 6) + 1,
        category,
        isBookmarked: false,
      }
    })

    const filtered = mockGroups.filter((g) => {
      const matchesCategory = currentFilters.category === 'All' || g.category === currentFilters.category
      const matchesAmount = g.contributionAmount >= currentFilters.minAmount && g.contributionAmount <= currentFilters.maxAmount
      const matchesMembers = g.currentMembers >= currentFilters.minMembers && g.currentMembers <= currentFilters.maxMembers
      const matchesFrequency = currentFilters.frequency === 'all' || g.frequency === currentFilters.frequency
      const matchesSearch =
        !currentFilters.searchQuery ||
        g.name.toLowerCase().includes(currentFilters.searchQuery.toLowerCase()) ||
        (g.description || '').toLowerCase().includes(currentFilters.searchQuery.toLowerCase())
      return matchesCategory && matchesAmount && matchesMembers && matchesFrequency && matchesSearch
    })

    setGroups((prev) => (pageNum === 1 ? filtered : [...prev, ...filtered]))
    setHasMore(pageNum < 5)
    setLoading(false)
  }, [])

  useEffect(() => {
    setPage(1)
    fetchGroups(1, filters)
  }, [filters, fetchGroups])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchGroups(nextPage, filters)
    }
  }, [loading, hasMore, page, fetchGroups, filters])

  const updateFilters = useCallback((newFilters: Partial<DiscoveryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const joinGroup = useCallback(async (groupId: string) => {
    setJoiningGroupId(groupId)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, currentMembers: g.currentMembers + 1 } : g
      )
    )
    setJoiningGroupId(null)
  }, [])

  const toggleBookmark = useCallback((groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isBookmarked: !g.isBookmarked } : g))
    )
  }, [])

  return {
    groups,
    loading,
    hasMore,
    loadMore,
    filters,
    updateFilters,
    clearFilters,
    joinGroup,
    joiningGroupId,
    toggleBookmark,
  }
}

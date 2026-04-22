'use client'

import React, { useEffect, useRef } from 'react'
import { Group } from '@/types'
import { GroupCard } from './GroupCard'

interface GroupGridProps {
  groups: Group[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onJoin: (groupId: string) => void
  joiningGroupId: string | null
}

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full w-20" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full w-14" />
    </div>
    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-100 dark:bg-slate-700/50 rounded w-full mb-1" />
    <div className="h-3 bg-gray-100 dark:bg-slate-700/50 rounded w-5/6 mb-4" />
    <div className="grid grid-cols-2 gap-2 mb-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 dark:bg-slate-700/50 rounded-lg" />
      ))}
    </div>
    <div className="h-2 bg-gray-100 dark:bg-slate-700/50 rounded-full mb-4" />
    <div className="h-9 bg-gray-200 dark:bg-slate-700 rounded-lg" />
  </div>
)

export const GroupGrid: React.FC<GroupGridProps> = ({
  groups,
  loading,
  hasMore,
  onLoadMore,
  onJoin,
  joiningGroupId,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, onLoadMore])

  if (!loading && groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 font-medium">No groups found</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters or search query</p>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onJoin={onJoin}
            isJoining={joiningGroupId === group.id}
          />
        ))}
        {loading &&
          [...Array(6)].map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4 mt-4" />

      {!hasMore && groups.length > 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">
          You&apos;ve seen all available groups
        </p>
      )}
    </div>
  )
}

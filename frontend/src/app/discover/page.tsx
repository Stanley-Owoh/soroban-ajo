'use client'

import React from 'react'
import { AppLayout } from '@/components/AppLayout'
import { FilterSidebar } from '@/components/discover/FilterSidebar'
import { GroupGrid } from '@/components/discover/GroupGrid'
import { useGroupDiscovery } from '@/hooks/useGroupDiscovery'

export default function DiscoverPage() {
  const { groups, loading, hasMore, loadMore, filters, updateFilters, clearFilters, joinGroup, joiningGroupId } =
    useGroupDiscovery()

  const sidebarProps = { filters, onUpdate: updateFilters, onClear: clearFilters }

  return (
    <AppLayout title="Discover Groups">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discover Groups</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Browse and join savings groups that match your goals
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search groups by name or description..."
            defaultValue={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Mobile collapsible filters */}
        <div className="lg:hidden">
          <FilterSidebar {...sidebarProps} mobile />
        </div>

        {/* Desktop: sidebar + grid */}
        <div className="flex gap-6">
          <div className="hidden lg:block">
            <FilterSidebar {...sidebarProps} />
          </div>
          <GroupGrid
            groups={groups}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onJoin={joinGroup}
            joiningGroupId={joiningGroupId}
          />
        </div>
      </div>
    </AppLayout>
  )
}

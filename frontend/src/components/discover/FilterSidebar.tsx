'use client'

import React, { useState } from 'react'
import { DiscoveryFilters, DISCOVERY_CATEGORIES, FREQUENCY_OPTIONS } from '@/hooks/useGroupDiscovery'

interface FilterSidebarProps {
  filters: DiscoveryFilters
  onUpdate: (filters: Partial<DiscoveryFilters>) => void
  onClear: () => void
  /** When true, renders as a collapsible mobile drawer instead of a full sidebar */
  mobile?: boolean
}

const FilterFields: React.FC<Omit<FilterSidebarProps, 'mobile'>> = ({ filters, onUpdate, onClear }) => {
  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.frequency !== 'all' ||
    filters.minAmount > 0 ||
    filters.maxAmount < 10000 ||
    filters.minMembers > 0 ||
    filters.maxMembers < 50

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 dark:text-white">Filters</h2>
        {hasActiveFilters && (
          <button onClick={onClear} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Category</label>
        <div className="flex flex-wrap gap-1.5">
          {DISCOVERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onUpdate({ category: cat })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Frequency</label>
        <select
          value={filters.frequency}
          onChange={(e) => onUpdate({ frequency: e.target.value as DiscoveryFilters['frequency'] })}
          className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {FREQUENCY_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f === 'all' ? 'All frequencies' : f.charAt(0).toUpperCase() + f.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
          Contribution Amount ($)
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.minAmount || ''}
            onChange={(e) => onUpdate({ minAmount: Number(e.target.value) || 0 })}
            className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-sm shrink-0">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.maxAmount || ''}
            onChange={(e) => onUpdate({ maxAmount: Number(e.target.value) || 10000 })}
            className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
          Member Count
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.minMembers || ''}
            onChange={(e) => onUpdate({ minMembers: Number(e.target.value) || 0 })}
            className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-sm shrink-0">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.maxMembers || ''}
            onChange={(e) => onUpdate({ maxMembers: Number(e.target.value) || 50 })}
            className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ mobile, ...props }) => {
  const [open, setOpen] = useState(false)

  if (mobile) {
    const hasActiveFilters =
      props.filters.category !== 'All' ||
      props.filters.frequency !== 'all' ||
      props.filters.minAmount > 0 ||
      props.filters.maxAmount < 10000 ||
      props.filters.minMembers > 0 ||
      props.filters.maxMembers < 50

    return (
      <div className="mb-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>
          )}
          <svg className={`w-4 h-4 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="mt-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg">
            <FilterFields {...props} />
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 self-start sticky top-6">
      <FilterFields {...props} />
    </aside>
  )
}

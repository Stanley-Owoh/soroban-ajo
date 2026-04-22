'use client'

import React from 'react'
import { Group } from '@/types'

interface GroupCardProps {
  group: Group
  onJoin: (groupId: string) => void
  isJoining: boolean
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onJoin, isJoining }) => {
  const fillPercent = Math.round((group.currentMembers / group.maxMembers) * 100)
  const isFull = group.currentMembers >= group.maxMembers
  const completionRate = Math.round((group.totalContributions / Math.max(group.maxMembers * group.contributionAmount * (group.duration || 1), 1)) * 100)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
            {group.category}
          </span>
          <h3 className="mt-1.5 font-semibold text-gray-900 dark:text-white text-base leading-tight">
            {group.name}
          </h3>
        </div>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
          group.status === 'active'
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
        }`}>
          {group.status}
        </span>
      </div>

      {group.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{group.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">Contribution</p>
          <p className="font-semibold text-gray-800 dark:text-white">${group.contributionAmount}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">Frequency</p>
          <p className="font-semibold text-gray-800 dark:text-white capitalize">{group.frequency || 'weekly'}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">Total Saved</p>
          <p className="font-semibold text-gray-800 dark:text-white">${group.totalContributions.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">Completion</p>
          <p className="font-semibold text-gray-800 dark:text-white">{Math.min(completionRate, 100)}%</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Members</span>
          <span>{group.currentMembers}/{group.maxMembers}</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-blue-500'}`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => onJoin(group.id)}
        disabled={isJoining || isFull}
        className={`mt-1 w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
          isFull
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-700 dark:text-gray-500'
            : isJoining
            ? 'bg-blue-400 text-white cursor-wait'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isJoining ? 'Joining...' : isFull ? 'Group Full' : 'Join Group'}
      </button>
    </div>
  )
}

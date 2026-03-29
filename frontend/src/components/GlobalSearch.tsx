'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Users, Receipt, CircleUserRound, X } from 'lucide-react';
import { searchService, SearchResult } from '../services/searchService';
import { useRouter } from 'next/navigation';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string | undefined>();
  const [results, setResults] = useState<SearchResult>({ groups: [], members: [], transactions: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.length < 2) {
        setResults({ groups: [], members: [], transactions: [] });
        return;
      }
      setLoading(true);
      try {
        const data = await searchService.globalSearch(debouncedQuery, type);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [debouncedQuery, type]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(url);
  };

  const hasResults = results.groups?.length > 0 || results.members?.length > 0 || results.transactions?.length > 0;

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-gray-400">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </div>
        <input
          type="text"
          className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all dark:text-white"
          placeholder="Search groups, members, tx..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button 
            className="absolute right-3 text-gray-400 hover:text-gray-600"
            onClick={() => { setQuery(''); setIsOpen(false); }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-12 left-0 w-full bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
          
          {/* Filters */}
          <div className="flex px-4 py-2 space-x-2 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            {['All', 'Groups', 'Members', 'Transactions'].map(filter => {
              const value = filter === 'All' ? undefined : filter.toLowerCase();
              return (
                <button
                  key={filter}
                  onClick={() => setType(value)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${type === value ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <div className="max-h-80 overflow-y-auto py-2">
            {!loading && !hasResults && (
              <div className="p-4 text-center text-sm text-gray-500">No results found for "{query}"</div>
            )}

            {results.groups?.length > 0 && (
              <div className="px-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Groups</div>
                {results.groups.map(group => (
                  <button key={group.id} onClick={() => handleSelect(`/groups/${group.id}`)} className="flex items-center w-full px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-left transition-colors">
                    <Users className="h-4 w-4 mr-3 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium dark:text-white">{group.name}</div>
                      <div className="text-xs text-gray-500">Vol: {group.contributionAmount}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.members?.length > 0 && (
              <div className="px-2 mt-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Members</div>
                {results.members.map(member => (
                  <button key={member.id} onClick={() => handleSelect(`/profile/${member.walletAddress}`)} className="flex items-center w-full px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-left transition-colors">
                    <CircleUserRound className="h-4 w-4 mr-3 text-green-500" />
                    <div>
                      <div className="text-sm font-medium dark:text-white truncate max-w-[200px]">{member.walletAddress}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.transactions?.length > 0 && (
              <div className="px-2 mt-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transactions</div>
                {results.transactions.map(tx => (
                  <button key={tx.id} onClick={() => handleSelect(`/transactions/${tx.txHash}`)} className="flex items-center w-full px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-left transition-colors">
                    <Receipt className="h-4 w-4 mr-3 text-purple-500" />
                    <div className="overflow-hidden">
                      <div className="text-sm font-medium dark:text-white truncate ...">{tx.txHash}</div>
                      <div className="text-xs text-gray-500">Amount: {tx.amount} • Group: {tx.group?.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

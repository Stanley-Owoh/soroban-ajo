'use client';

import { useGroupAnalytics } from '@/hooks/useGroupAnalytics';
import { SkeletonChart } from '@/components/skeletons';
import { lazyLoad } from '@/utils/lazyLoad';

const AnalyticsSummaryCards = lazyLoad(
  () => import('@/components/analytics').then((m) => ({ default: m.AnalyticsSummaryCards })),
  { loading: () => <SkeletonChart /> }
);
const ContributionTrendChart = lazyLoad(
  () => import('@/components/analytics').then((m) => ({ default: m.ContributionTrendChart })),
  { loading: () => <SkeletonChart /> }
);
const GroupPerformanceChart = lazyLoad(
  () => import('@/components/analytics').then((m) => ({ default: m.GroupPerformanceChart })),
  { loading: () => <SkeletonChart /> }
);
const MemberGrowthChart = lazyLoad(
  () => import('@/components/analytics').then((m) => ({ default: m.MemberGrowthChart })),
  { loading: () => <SkeletonChart /> }
);
const TopContributorsTable = lazyLoad(
  () => import('@/components/analytics').then((m) => ({ default: m.TopContributorsTable })),
  { loading: () => <SkeletonChart /> }
);

/**
 * Analytics Dashboard
 * Shows group performance, contribution trends, and member statistics.
 * Replace the empty `groups` array with real data from your API/store.
 */
export default function AnalyticsDashboard() {
  // TODO: replace with real groups from useGroups() / API
  const { summary, contributionTrends, memberStats, groupPerformance, topContributors } =
    useGroupAnalytics([]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Group performance, contribution trends, and member statistics
          </p>
        </div>

        {/* Summary KPI cards */}
        <AnalyticsSummaryCards summary={summary} />

        {/* Contribution trends + Member growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContributionTrendChart data={contributionTrends} />
          <MemberGrowthChart data={memberStats} />
        </div>

        {/* Group performance bar chart */}
        <GroupPerformanceChart data={groupPerformance} />

        {/* Top contributors table */}
        <TopContributorsTable data={topContributors} />

      </div>
    </main>
  );
}

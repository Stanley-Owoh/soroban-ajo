'use client'

import React from 'react'
import { useInsurancePool } from '../../hooks/useInsuranceClaim'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Progress } from '../ui/Progress'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Alert, AlertDescription } from '../ui/Alert'
import { Loader2, TrendingUp, TrendingDown, Shield, DollarSign, Users } from 'lucide-react'

interface InsurancePoolProps {
  tokenAddress: string
  tokenSymbol?: string
  showActions?: boolean
  onRefresh?: () => void
}

export function InsurancePool({ 
  tokenAddress, 
  tokenSymbol = 'XLM',
  showActions = true,
  onRefresh 
}: InsurancePoolProps) {
  const { data: pool, isLoading, error, refetch } = useInsurancePool(tokenAddress)

  const handleRefresh = () => {
    refetch()
    onRefresh?.()
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading insurance pool data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load insurance pool data: {(error as Error).message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!pool) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              No insurance pool found for this token.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Calculate health metrics
  const totalPayoutsPercentage = pool.balance > 0 ? (pool.totalPayouts / pool.balance) * 100 : 0
  const poolHealth = pool.balance > pool.totalPayouts ? 'healthy' : pool.balance > 0 ? 'warning' : 'critical'
  
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <TrendingUp className="w-4 h-4" />
      case 'warning':
        return <TrendingDown className="w-4 h-4" />
      case 'critical':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Pool Card */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Insurance Pool
            </CardTitle>
            <CardDescription>
              {tokenSymbol} token insurance pool balance and statistics
            </CardDescription>
          </div>
          {showActions && (
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Balance */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <DollarSign className="w-4 h-4" />
                Current Balance
              </div>
              <div className="text-2xl font-bold">
                {(pool.balance / 10_000_000).toFixed(2)} {tokenSymbol}
              </div>
              <p className="text-xs text-gray-500">
                {pool.balance.toLocaleString()} stroops
              </p>
            </div>

            {/* Total Payouts */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <TrendingDown className="w-4 h-4" />
                Total Payouts
              </div>
              <div className="text-2xl font-bold text-red-600">
                {(pool.totalPayouts / 10_000_000).toFixed(2)} {tokenSymbol}
              </div>
              <p className="text-xs text-gray-500">
                {pool.totalPayouts.toLocaleString()} stroops
              </p>
            </div>

            {/* Pending Claims */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Users className="w-4 h-4" />
                Pending Claims
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {pool.pendingClaimsCount}
              </div>
              <p className="text-xs text-gray-500">
                Awaiting verification
              </p>
            </div>
          </div>

          {/* Health Indicator */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Pool Health</span>
              <Badge className={getHealthColor(poolHealth)}>
                {getHealthIcon(poolHealth)}
                <span className="ml-1 capitalize">{poolHealth}</span>
              </Badge>
            </div>
            
            {/* Payout Ratio Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Payout Ratio</span>
                <span>{totalPayoutsPercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(totalPayoutsPercentage, 100)} 
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                {totalPayoutsPercentage.toFixed(1)}% of pool balance has been paid out
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Coverage */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Shield className="w-4 h-4" />
                Available Coverage
              </div>
              <div className="text-xl font-bold text-green-600">
                {((pool.balance - pool.totalPayouts) / 10_000_000).toFixed(2)} {tokenSymbol}
              </div>
              <p className="text-xs text-gray-500">
                Remaining for claims
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coverage Ratio */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <TrendingUp className="w-4 h-4" />
                Coverage Ratio
              </div>
              <div className="text-xl font-bold">
                {pool.balance > 0 ? ((pool.balance - pool.totalPayouts) / pool.balance * 100).toFixed(1) : '0'}%
              </div>
              <p className="text-xs text-gray-500">
                Funds available ratio
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Average Claim Size */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <DollarSign className="w-4 h-4" />
                Avg Claim Size
              </div>
              <div className="text-xl font-bold">
                {pool.totalPayouts > 0 && pool.pendingClaimsCount > 0
                  ? (pool.totalPayouts / pool.pendingClaimsCount / 10_000_000).toFixed(2)
                  : '0.00'
                } {tokenSymbol}
              </div>
              <p className="text-xs text-gray-500">
                Based on history
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pool Utilization */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Users className="w-4 h-4" />
                Pool Utilization
              </div>
              <div className="text-xl font-bold">
                {pool.balance > 0 ? (pool.totalPayouts / pool.balance * 100).toFixed(1) : '0'}%
              </div>
              <p className="text-xs text-gray-500">
                Of total balance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Alert */}
      {poolHealth === 'critical' && (
        <Alert variant="destructive">
          <TrendingDown className="h-4 w-4" />
          <AlertDescription>
            Critical: The insurance pool has insufficient funds. Consider adding more liquidity to ensure claim coverage.
          </AlertDescription>
        </Alert>
      )}

      {poolHealth === 'warning' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <TrendingDown className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Warning: The insurance pool is running low on funds. Monitor closely and consider adding liquidity.
          </AlertDescription>
        </Alert>
      )}

      {poolHealth === 'healthy' && (
        <Alert className="border-green-200 bg-green-50">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Good: The insurance pool is well-funded and can handle claims effectively.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

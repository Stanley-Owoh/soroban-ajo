'use client'

import React from 'react'
import { useInsuranceClaim, InsuranceClaim } from '../../hooks/useInsuranceClaim'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Alert, AlertDescription } from '../ui/Alert'
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

interface ClaimStatusProps {
  claimId: string
  showActions?: boolean
  onClaimProcessed?: () => void
}

export function ClaimStatus({ claimId, showActions = true, onClaimProcessed }: ClaimStatusProps) {
  const { 
    getClaimQuery, 
    processClaimMutation, 
    verifyClaimMutation 
  } = useInsuranceClaim(claimId)

  const claim = getClaimQuery.data

  const getStatusColor = (status: InsuranceClaim['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'PAID':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: InsuranceClaim['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const handleProcessClaim = async (approved: boolean) => {
    try {
      await processClaimMutation.mutateAsync({ claimId, approved })
      onClaimProcessed?.()
    } catch (error) {
      console.error('Failed to process claim:', error)
    }
  }

  const handleVerifyClaim = async () => {
    try {
      await verifyClaimMutation.mutateAsync(claimId)
    } catch (error) {
      console.error('Failed to verify claim:', error)
    }
  }

  if (getClaimQuery.isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading claim details...</span>
        </CardContent>
      </Card>
    )
  }

  if (getClaimQuery.error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load claim details: {(getClaimQuery.error as Error).message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!claim) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Claim not found with ID: {claimId}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Claim #{claim.id}
              <Badge className={getStatusColor(claim.status)}>
                {getStatusIcon(claim.status)}
                <span className="ml-1">{claim.status}</span>
              </Badge>
            </CardTitle>
            <CardDescription>
              Filed on {format(new Date(claim.createdAt), 'MMM dd, yyyy at HH:mm')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Claim Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-500">Group Information</h4>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Group ID:</span> {claim.groupId}
              </p>
              <p className="text-sm">
                <span className="font-medium">Cycle:</span> {claim.cycle}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-500">Parties Involved</h4>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Claimant:</span>{' '}
                <span className="font-mono text-xs">{claim.claimant}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Defaulter:</span>{' '}
                <span className="font-mono text-xs">{claim.defaulter}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Claim Amount</span>
            <span className="text-xl font-bold">
              {(claim.amount / 10_000_000).toFixed(2)} XLM
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {claim.amount.toLocaleString()} stroops
          </p>
        </div>

        {/* Status-specific information */}
        {claim.status === 'PENDING' && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              This claim is pending verification. The system will automatically verify the claim based on on-chain contribution data once the grace period has elapsed.
            </AlertDescription>
          </Alert>
        )}

        {claim.status === 'APPROVED' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              This claim has been approved and will be paid out from the insurance pool.
            </AlertDescription>
          </Alert>
        )}

        {claim.status === 'REJECTED' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              This claim has been rejected. The defaulter was found to have contributed to the specified cycle.
            </AlertDescription>
          </Alert>
        )}

        {claim.status === 'PAID' && (
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              This claim has been successfully paid out to the claimant.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        {showActions && claim.status === 'PENDING' && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyClaim}
              disabled={verifyClaimMutation.isPending}
            >
              {verifyClaimMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Claim'
              )}
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleProcessClaim(false)}
                disabled={processClaimMutation.isPending}
              >
                {processClaimMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Reject'
                )}
              </Button>
              
              <Button
                size="sm"
                onClick={() => handleProcessClaim(true)}
                disabled={processClaimMutation.isPending}
              >
                {processClaimMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Approve & Pay'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {verifyClaimMutation.data !== undefined && (
          <Alert className={verifyClaimMutation.data ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {verifyClaimMutation.data ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={verifyClaimMutation.data ? 'text-green-800' : 'text-red-800'}>
              Claim verification result: {verifyClaimMutation.data ? 'Valid - defaulter did not contribute' : 'Invalid - defaulter contributed'}
            </AlertDescription>
          </Alert>
        )}

        {/* View on Explorer */}
        <div className="pt-4 border-t">
          <Button variant="ghost" size="sm" className="text-xs">
            <ExternalLink className="w-3 h-3 mr-1" />
            View on Stellar Explorer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

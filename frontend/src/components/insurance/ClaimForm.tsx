'use client'

import React, { useState } from 'react'
import { useInsuranceClaim, ClaimData } from '../../hooks/useInsuranceClaim'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Alert, AlertDescription } from '../ui/Alert'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface ClaimFormProps {
  groupId?: string
  availableCycles?: number[]
  members?: Array<{ address: string; name?: string }>
  tokenAddress?: string
  onSuccess?: (claimId: string) => void
}

export function ClaimForm({ 
  groupId, 
  availableCycles = [], 
  members = [], 
  tokenAddress,
  onSuccess 
}: ClaimFormProps) {
  const [formData, setFormData] = useState<Partial<ClaimData>>({
    groupId: groupId || '',
    cycle: undefined,
    claimant: '',
    defaulter: '',
    amount: 0,
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { fileClaimMutation } = useInsuranceClaim()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.groupId) {
      newErrors.groupId = 'Group ID is required'
    }

    if (!formData.cycle) {
      newErrors.cycle = 'Cycle is required'
    }

    if (!formData.claimant) {
      newErrors.claimant = 'Claimant address is required'
    } else if (!/^G[A-Z0-9]{55}$/.test(formData.claimant)) {
      newErrors.claimant = 'Invalid Stellar address format'
    }

    if (!formData.defaulter) {
      newErrors.defaulter = 'Defaulter address is required'
    } else if (!/^G[A-Z0-9]{55}$/.test(formData.defaulter)) {
      newErrors.defaulter = 'Invalid Stellar address format'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (formData.claimant === formData.defaulter) {
      newErrors.defaulter = 'Claimant and defaulter cannot be the same'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const claimId = await fileClaimMutation.mutateAsync(formData as ClaimData)
      onSuccess?.(claimId)
      
      // Reset form
      setFormData({
        groupId: groupId || '',
        cycle: undefined,
        claimant: '',
        defaulter: '',
        amount: 0,
      })
      setErrors({})
    } catch (error) {
      console.error('Failed to file claim:', error)
    }
  }

  const handleInputChange = (field: keyof ClaimData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>File Insurance Claim</CardTitle>
        <CardDescription>
          Submit a claim for a defaulted contribution. The claim will be automatically verified based on on-chain data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group ID */}
          <div className="space-y-2">
            <Label htmlFor="groupId">Group ID</Label>
            <Input
              id="groupId"
              type="text"
              value={formData.groupId}
              onChange={(e) => handleInputChange('groupId', e.target.value)}
              placeholder="Enter group ID"
              disabled={!!groupId}
              className={errors.groupId ? 'border-red-500' : ''}
            />
            {errors.groupId && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.groupId}
              </p>
            )}
          </div>

          {/* Cycle */}
          <div className="space-y-2">
            <Label htmlFor="cycle">Cycle</Label>
            {availableCycles.length > 0 ? (
              <Select
                value={formData.cycle?.toString()}
                onValueChange={(value) => handleInputChange('cycle', parseInt(value))}
              >
                <SelectTrigger className={errors.cycle ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  {availableCycles.map(cycle => (
                    <SelectItem key={cycle} value={cycle.toString()}>
                      Cycle {cycle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="cycle"
                type="number"
                value={formData.cycle || ''}
                onChange={(e) => handleInputChange('cycle', parseInt(e.target.value))}
                placeholder="Enter cycle number"
                className={errors.cycle ? 'border-red-500' : ''}
              />
            )}
            {errors.cycle && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.cycle}
              </p>
            )}
          </div>

          {/* Claimant */}
          <div className="space-y-2">
            <Label htmlFor="claimant">Claimant Address</Label>
            <Input
              id="claimant"
              type="text"
              value={formData.claimant}
              onChange={(e) => handleInputChange('claimant', e.target.value)}
              placeholder="G..."
              className={errors.claimant ? 'border-red-500' : ''}
            />
            {errors.claimant && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.claimant}
              </p>
            )}
          </div>

          {/* Defaulter */}
          <div className="space-y-2">
            <Label htmlFor="defaulter">Defaulter Address</Label>
            {members.length > 0 ? (
              <Select
                value={formData.defaulter}
                onValueChange={(value) => handleInputChange('defaulter', value)}
              >
                <SelectTrigger className={errors.defaulter ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select defaulter" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.address} value={member.address}>
                      {member.name || member.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="defaulter"
                type="text"
                value={formData.defaulter}
                onChange={(e) => handleInputChange('defaulter', e.target.value)}
                placeholder="G..."
                className={errors.defaulter ? 'border-red-500' : ''}
              />
            )}
            {errors.defaulter && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.defaulter}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Claim Amount (stroops)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount || ''}
              onChange={(e) => handleInputChange('amount', parseInt(e.target.value))}
              placeholder="Enter amount in stroops (1 XLM = 10,000,000 stroops)"
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.amount}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter the amount in stroops. For example, 100 XLM = 1,000,000,000 stroops.
            </p>
          </div>

          {/* Error Alert */}
          {fileClaimMutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to file claim: {(fileClaimMutation.error as Error).message}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {fileClaimMutation.data && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Claim filed successfully! Claim ID: {fileClaimMutation.data}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={fileClaimMutation.isPending}
            className="w-full"
          >
            {fileClaimMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Filing Claim...
              </>
            ) : (
              'File Insurance Claim'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

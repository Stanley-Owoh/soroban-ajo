import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { initializeSoroban } from '../services/soroban'

export interface ClaimData {
  groupId: string
  cycle: number
  claimant: string
  defaulter: string
  amount: number
}

export interface InsuranceClaim {
  id: string
  groupId: string
  cycle: number
  claimant: string
  defaulter: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'
  createdAt: number
}

export interface InsurancePool {
  balance: number
  totalPayouts: number
  pendingClaimsCount: number
}

export function useInsuranceClaim(claimId?: string) {
  const queryClient = useQueryClient()
  const sorobanService = initializeSoroban()

  const fileClaimMutation = useMutation({
    mutationFn: async (data: ClaimData) => {
      const result = await sorobanService.fileInsuranceClaim(
        data.groupId,
        data.cycle,
        data.claimant,
        data.defaulter,
        data.amount
      )
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-pool'] })
      queryClient.invalidateQueries({ queryKey: ['insurance-claims'] })
    },
  })

  const getClaimQuery = useQuery({
    queryKey: ['insurance-claim', claimId],
    queryFn: () => sorobanService.getInsuranceClaim(claimId!),
    enabled: !!claimId,
  })

  const processClaimMutation = useMutation({
    mutationFn: async ({ claimId, approved }: { claimId: string; approved: boolean }) => {
      await sorobanService.processInsuranceClaim(claimId, approved)
    },
    onSuccess: () => {
      // Invalidate claim and pool queries
      queryClient.invalidateQueries({ queryKey: ['insurance-claim'] })
      queryClient.invalidateQueries({ queryKey: ['insurance-claims'] })
      queryClient.invalidateQueries({ queryKey: ['insurance-pool'] })
    },
  })

  const verifyClaimMutation = useMutation({
    mutationFn: async (claimId: string) => {
      return await sorobanService.verifyInsuranceClaim(claimId)
    },
  })

  return {
    fileClaimMutation,
    getClaimQuery,
    processClaimMutation,
    verifyClaimMutation,
  }
}

export function useInsurancePool(tokenAddress: string) {
  const sorobanService = initializeSoroban()

  return useQuery({
    queryKey: ['insurance-pool', tokenAddress],
    queryFn: () => sorobanService.getInsurancePool(tokenAddress),
    enabled: !!tokenAddress,
    staleTime: 30000, // 30 seconds
  })
}

export function useInsuranceClaims(claimIds?: string[]) {
  const sorobanService = initializeSoroban()

  return useQuery({
    queryKey: ['insurance-claims', claimIds],
    queryFn: async () => {
      if (!claimIds || claimIds.length === 0) return []
      
      const claims = await Promise.all(
        claimIds.map(id => sorobanService.getInsuranceClaim(id))
      )
      return claims
    },
    enabled: !!(claimIds && claimIds.length > 0),
    staleTime: 30000, // 30 seconds
  })
}

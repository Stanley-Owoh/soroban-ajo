import { WebhookEventType } from '../../src/services/webhookService'
import { handleGroupCreated, handleMemberJoined, handleContributionMade, handlePayoutExecuted, handleGroupCompleted, handleCycleAdvanced } from '../../src/handlers/contractEventHandlers'
import { dbService } from '../../src/services/databaseService'
import { notificationService } from '../../src/services/notificationService'
import { webhookService } from '../../src/services/webhookService'

type MockedFn = jest.MockedFunction<any>

jest.mock('../../src/services/databaseService', () => ({
  dbService: {
    upsertGroup: jest.fn(),
    upsertUser: jest.fn(),
    addGroupMember: jest.fn(),
    getContributionByTxHash: jest.fn(),
    addContribution: jest.fn(),
  },
}))

jest.mock('../../src/services/notificationService', () => ({
  notificationService: {
    sendToUser: jest.fn(),
    sendToGroup: jest.fn(),
  },
}))

jest.mock('../../src/services/webhookService', () => ({
  webhookService: {
    triggerEvent: jest.fn(),
  },
  WebhookEventType: {
    GROUP_CREATED: 'group.created',
    MEMBER_JOINED: 'member.joined',
    CONTRIBUTION_MADE: 'contribution.made',
    PAYOUT_EXECUTED: 'payout.executed',
    GROUP_COMPLETED: 'group.completed',
    CYCLE_STARTED: 'cycle.started',
  },
}))

describe('ContractEventHandlers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(dbService.upsertGroup as MockedFn).mockResolvedValue({})
    ;(dbService.upsertUser as MockedFn).mockResolvedValue({})
    ;(dbService.addGroupMember as MockedFn).mockResolvedValue({})
    ;(dbService.getContributionByTxHash as MockedFn).mockResolvedValue(null)
    ;(dbService.addContribution as MockedFn).mockResolvedValue({})
  })

  it('handles group creation and dispatches webhook', async () => {
    await handleGroupCreated({ groupId: 'group-1', data: { raw: ['GABC123', BigInt(100), 5] } } as any)

    expect(dbService.upsertGroup).toHaveBeenCalledWith('group-1', expect.objectContaining({ name: 'Group group-1' }))
    expect(webhookService.triggerEvent).toHaveBeenCalledWith(
      WebhookEventType.GROUP_CREATED,
      expect.objectContaining({ groupId: 'group-1', creator: 'GABC123' }),
      expect.objectContaining({ groupId: 'group-1', userId: 'GABC123' })
    )
  })

  it('handles member joined and dispatches webhook', async () => {
    await handleMemberJoined({ groupId: 'group-1', data: { raw: 'GDEF456' } } as any)

    expect(dbService.addGroupMember).toHaveBeenCalledWith('group-1', 'GDEF456')
    expect(webhookService.triggerEvent).toHaveBeenCalledWith(
      WebhookEventType.MEMBER_JOINED,
      expect.objectContaining({ groupId: 'group-1', memberAddress: 'GDEF456' }),
      expect.objectContaining({ groupId: 'group-1', userId: 'GDEF456' })
    )
  })

  it('handles contribution made and dispatches webhook', async () => {
    const txHash = 'tx-123'

    await handleContributionMade({
      groupId: 'group-1',
      data: { raw: ['GABC123', BigInt(500)], cycle: 1 },
      txHash,
    } as any)

    expect(dbService.addContribution).toHaveBeenCalled()
    expect(webhookService.triggerEvent).toHaveBeenCalledWith(
      WebhookEventType.CONTRIBUTION_MADE,
      expect.objectContaining({ groupId: 'group-1', contributor: 'GABC123', txHash, cycle: 1 }),
      expect.objectContaining({ groupId: 'group-1', userId: 'GABC123', transactionHash: txHash })
    )
  })

  it('handles payout executed and dispatches webhook', async () => {
    await handlePayoutExecuted({ groupId: 'group-1', data: { raw: ['GABC123', BigInt(800)] } } as any)

    expect(notificationService.sendToUser).toHaveBeenCalledWith('GABC123', expect.any(Object))
    expect(webhookService.triggerEvent).toHaveBeenCalledWith(
      WebhookEventType.PAYOUT_EXECUTED,
      expect.objectContaining({ groupId: 'group-1', recipient: 'GABC123', amount: '800' }),
      expect.objectContaining({ groupId: 'group-1', userId: 'GABC123' })
    )
  })

  it('handles group completed and dispatches webhook', async () => {
    await handleGroupCompleted({ groupId: 'group-1' } as any)

    expect(notificationService.sendToGroup).toHaveBeenCalledWith('group-1', expect.any(Object))
    expect(webhookService.triggerEvent).toHaveBeenCalledWith(
      WebhookEventType.GROUP_COMPLETED,
      expect.objectContaining({ groupId: 'group-1' }),
      expect.objectContaining({ groupId: 'group-1' })
    )
  })

  it('handles cycle advanced and dispatches webhook', async () => {
    await handleCycleAdvanced({ groupId: 'group-1', data: { raw: [2] } } as any)

    expect(webhookService.triggerEvent).toHaveBeenCalledWith(
      WebhookEventType.CYCLE_STARTED,
      expect.objectContaining({ groupId: 'group-1', cycleNumber: 2 }),
      expect.objectContaining({ groupId: 'group-1' })
    )
  })
})

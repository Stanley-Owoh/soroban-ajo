import { PubSub } from 'graphql-subscriptions'
import { GroupsService } from '../../services/groupsService'
import { GoalsService } from '../../services/goalsService'
import { RewardService } from '../../services/rewardService'
import type { GraphQLContext } from '../types/context'

export const pubsub = new PubSub()

const groupsService = new GroupsService()
const goalsService = new GoalsService()
const rewardService = new RewardService()

export const resolvers = {
  Query: {
    groups: async (_: unknown, args: { page?: number; limit?: number }) => {
      return groupsService.listGroups({ page: args.page ?? 1, limit: args.limit ?? 20 })
    },

    group: async (_: unknown, args: { id: string }) => {
      return groupsService.getGroup(args.id)
    },

    goals: async (_: unknown, args: { userId: string }) => {
      return goalsService.getGoals(args.userId)
    },

    goal: async (_: unknown, args: { id: string }) => {
      return goalsService.getGoal(args.id)
    },

    rewards: async (_: unknown, args: { userId: string; status?: string; type?: string }) => {
      return rewardService.getRewards(args.userId, { status: args.status, type: args.type })
    },

    rewardHistory: async (_: unknown, args: { userId: string }) => {
      return rewardService.getRewardHistory(args.userId)
    },
  },

  Mutation: {
    createGoal: async (_: unknown, args: Record<string, unknown>, ctx: GraphQLContext) => {
      const userId = (ctx.walletAddress ?? args.userId) as string
      return goalsService.createGoal(userId, args as any)
    },

    updateGoal: async (_: unknown, args: { id: string } & Record<string, unknown>) => {
      return goalsService.updateGoal(args.id, args as any)
    },

    deleteGoal: async (_: unknown, args: { id: string }) => {
      await goalsService.deleteGoal(args.id)
      return true
    },

    redeemReward: async (_: unknown, args: { userId: string; rewardId: string }) => {
      return rewardService.redeemReward(args.userId, args.rewardId)
    },
  },

  Subscription: {
    groupUpdated: {
      subscribe: (_: unknown, args: { groupId: string }) =>
        pubsub.asyncIterableIterator(`GROUP_UPDATED_${args.groupId}`),
    },
    contributionAdded: {
      subscribe: (_: unknown, args: { groupId: string }) =>
        pubsub.asyncIterableIterator(`CONTRIBUTION_ADDED_${args.groupId}`),
    },
  },
}

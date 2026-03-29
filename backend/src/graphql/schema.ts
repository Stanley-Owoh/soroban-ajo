import { gql } from 'graphql-tag'

export const typeDefs = gql`
  type Group {
    id: ID!
    name: String!
    contributionAmount: String!
    frequency: Int!
    maxMembers: Int!
    currentRound: Int!
    isActive: Boolean!
    createdAt: String!
    memberCount: Int
  }

  type Goal {
    id: ID!
    userId: String!
    title: String!
    description: String
    targetAmount: String!
    currentAmount: String!
    deadline: String!
    category: String!
    isPublic: Boolean!
    status: String!
    createdAt: String!
  }

  type Reward {
    id: ID!
    userId: String!
    type: String!
    status: String!
    earnedAt: String!
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int
    totalPages: Int
  }

  type GroupsResult {
    data: [Group!]!
    pagination: PaginationInfo!
  }

  type Query {
    groups(page: Int, limit: Int): GroupsResult!
    group(id: ID!): Group
    goals(userId: String!): [Goal!]!
    goal(id: ID!): Goal
    rewards(userId: String!, status: String, type: String): [Reward!]!
    rewardHistory(userId: String!): RewardHistoryResult!
  }

  type RewardHistoryResult {
    history: [Reward!]!
    totalEarned: Int!
    totalRedeemed: Int!
  }

  type Mutation {
    createGoal(
      userId: String!
      title: String!
      description: String
      targetAmount: String!
      deadline: String!
      category: String!
      isPublic: Boolean
    ): Goal!

    updateGoal(
      id: ID!
      title: String
      description: String
      targetAmount: String
      deadline: String
      category: String
      isPublic: Boolean
      status: String
    ): Goal!

    deleteGoal(id: ID!): Boolean!

    redeemReward(userId: String!, rewardId: ID!): Reward
  }

  type Subscription {
    groupUpdated(groupId: ID!): Group
    contributionAdded(groupId: ID!): ContributionEvent
  }

  type ContributionEvent {
    groupId: ID!
    userId: String!
    amount: String!
    txHash: String!
    timestamp: String!
  }
`

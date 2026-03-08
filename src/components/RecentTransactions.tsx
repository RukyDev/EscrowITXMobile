import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {colors} from '../theme/colors'
import { spacing } from '../theme/spacing'
import { typography } from '../theme/typography'
import { RecentTransaction } from '../core/types/dashboard.types'

interface Props {
  transactions: RecentTransaction[]
}

export default function RecentTransactions({ transactions }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Transactions</Text>

      {transactions.map((tx) => (
        <View key={tx.id} style={styles.card}>
          {/* Top Row */}
          <View style={styles.rowBetween}>
            <Text style={styles.type}>
              {tx.type} £{tx.amountGbp.toLocaleString()}
            </Text>

            <View style={[styles.statusBadge, getStatusStyle(tx.status)]}>
              <Text style={styles.statusText}>
                {formatStatus(tx.status)}
              </Text>
            </View>
          </View>

          {/* Bottom Row */}
          <View style={[styles.rowBetween, { marginTop: spacing.sm }]}>
            <Text style={styles.amountNgn}>
              ₦{tx.amountNgn.toLocaleString()}
            </Text>

            <Text style={styles.timeAgo}>{tx.timeAgo}</Text>
          </View>

          <Text style={styles.counterparty}>
            With {tx.counterparty}
          </Text>
        </View>
      ))}
    </View>
  )
}

/* ---------- Helpers ---------- */

function getStatusStyle(status: string) {
  switch (status) {
    case 'Completed':
      return { backgroundColor: '#E6F9EF' }
    case 'In_Escrow':
      return { backgroundColor: '#E6F0FF' }
    case 'Disputed':
      return { backgroundColor: '#FFF4E5' }
    default:
      return { backgroundColor: colors.border }
  }
}

function formatStatus(status: string) {
  return status.replace('_', ' ')
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 18,
    marginBottom: spacing.md,

    // subtle fintech elevation
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  amountNgn: {
    ...typography.body,
    color: colors.textSecondary,
  },
  counterparty: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  timeAgo: {
    ...typography.small,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
})
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {colors} from '../theme/colors'
import { spacing } from '../theme/spacing'
import { typography } from '../theme/typography'

interface Props {
  balance: number
  changePercent: number
}

export default function WalletCard({ balance, changePercent }: Props) {
  const isPositive = changePercent >= 0

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Wallet Balance</Text>

      <Text style={styles.balance}>
        ₦{balance.toLocaleString()}
      </Text>

      <Text
        style={[
          styles.change,
          { color: isPositive ? colors.accent : colors.danger },
        ]}
      >
        {isPositive ? '+' : ''}
        {changePercent}%
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 20, // match UI exactly
    marginBottom: spacing.lg,
  },
  label: {
    color: '#FFFFFFCC',
    ...typography.small,
  },
  balance: {
    color: '#FFFFFF',
    marginVertical: spacing.sm,
    fontSize: 28,
    fontWeight: '700',
  },
  change: {
    ...typography.body,
    fontWeight: '600',
  },
})
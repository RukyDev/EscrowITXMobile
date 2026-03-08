import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {colors} from '../theme/colors'
import { spacing } from '../theme/spacing'
import { typography } from '../theme/typography'

interface Props {
  adsTotal: number
  buyAds: number
  sellAds: number
  escrowCount: number
  pendingCount: number
}

export default function SummaryRow({
  adsTotal,
  buyAds,
  sellAds,
  escrowCount,
  pendingCount,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <Text style={styles.label}>Total Ads</Text>
        <Text style={styles.value}>{adsTotal}</Text>
        <Text style={styles.sub}>
          Buy: {buyAds} | Sell: {sellAds}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>In Escrow</Text>
        <Text style={styles.value}>{escrowCount}</Text>
        <Text style={styles.sub}>
          Pending: {pendingCount}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  label: {
    ...typography.small,
    color: colors.textSecondary,
  },
  value: {
    ...typography.subtitle,
    fontSize: 20,
    marginVertical: spacing.sm,
    color: colors.textPrimary,
  },
  sub: {
    ...typography.small,
    color: colors.textSecondary,
  },
})
import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import Svg, { Rect, Text as SvgText } from 'react-native-svg'
import {colors} from '../theme/colors'
import { spacing } from '../theme/spacing'
import { typography } from '../theme/typography'
import { ExchangeVolumeItem } from '../core/types/dashboard.types'

interface Props {
  data: ExchangeVolumeItem[]
}

const screenWidth = Dimensions.get('window').width
const chartHeight = 180
const barWidth = 14
const groupSpacing = 28

export default function ExchangeVolume({ data }: Props) {
  const maxValue = Math.max(
    ...data.flatMap(item => [item.buyVolume, item.sellVolume])
  )

  const chartWidth = data.length * groupSpacing * 2

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exchange Volume</Text>

      <Svg width={screenWidth - spacing.md * 2} height={chartHeight}>
        {data.map((item, index) => {
          const buyHeight = (item.buyVolume / maxValue) * 120
          const sellHeight = (item.sellVolume / maxValue) * 120

          const xBase = index * (groupSpacing * 2) + 10

          return (
            <React.Fragment key={index}>
              {/* BUY BAR */}
              <Rect
                x={xBase}
                y={chartHeight - buyHeight - 30}
                width={barWidth}
                height={buyHeight}
                rx={4}
                fill="#00C853" // Green
              />

              {/* SELL BAR */}
              <Rect
                x={xBase + barWidth + 6}
                y={chartHeight - sellHeight - 30}
                width={barWidth}
                height={sellHeight}
                rx={4}
                fill="#E53935" // Red
              />

              {/* Month Label */}
              <SvgText
                x={xBase + barWidth}
                y={chartHeight - 10}
                fontSize="10"
                fill={colors.textSecondary}
                textAnchor="middle"
              >
                {item.monthLabel}
              </SvgText>
            </React.Fragment>
          )
        })}
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.md,
    ...typography.subtitle,
    color: colors.textPrimary,
  },
})
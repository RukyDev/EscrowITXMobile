import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {colors} from '../theme/colors'
import { spacing } from '../theme/spacing'
import { typography } from '../theme/typography'

interface Props {
  name: string
}

export default function GreetingHeader({ name }: Props) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.subtitle}>Welcome back,</Text>
        <Text style={styles.name}>{name}</Text>
      </View>

      {/* Optional avatar circle */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    ...typography.small,
    color: colors.textSecondary,
  },
  name: {
    ...typography.title,
    color: colors.textPrimary,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
})
import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView, StatusBar, Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDashboardStore } from '../../store/dashboard.store';
import { useAuthStore } from '../../store/auth.store';
import { useWalletStore } from '../../store/wallet.store';
import { colors } from '../../theme/colors';
import { HomeStackParamList } from '../../navigation/types';
import KYCModal from '../../components/KYCModal';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Dashboard'>;

const STAT_CARDS = [
  { key: 'trades', icon: 'chart-line', bg: '#EEF2FF', bar: colors.blue, label: 'Active Trades' },
  { key: 'completed', icon: 'check-circle-outline', bg: '#F0FDF4', bar: colors.success, label: 'Completed' },
  { key: 'escrow', icon: 'clock-outline', bg: '#FFFBEB', bar: colors.warn, label: 'In Escrow' },
  { key: 'gbp', icon: 'cash-multiple', bg: '#FEF2F2', bar: colors.danger, label: 'GBP Traded' },
];

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { dashboard, isLoading: isDashboardLoading, fetchDashboard } = useDashboardStore();
  const { balance, isLoading: isWalletLoading, fetchBalance } = useWalletStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
    fetchDashboard();
    fetchBalance();
  }, []);

  const userName = dashboard?.userFirstName || user?.name || 'User';
  const initials = userName.slice(0, 2).toUpperCase();

  const statValues = dashboard ? [
    dashboard.adsSummary.totalActive,
    0, // completed trades - needs API
    dashboard.escrowSummary.inEscrowCount,
    `£${(dashboard.exchangeVolume.reduce((a, b) => a + b.buyVolume + b.sellVolume, 0) / 1000).toFixed(1)}k`,
  ] : ['-', '-', '-', '-'];

  const chartData = dashboard?.exchangeVolume || [];
  const maxVol = Math.max(...chartData.flatMap(d => [d.buyVolume, d.sellVolume]), 1);
  const ngnWallet = balance.find(w => w.currency === 'NGN');
  const [showKYC, setShowKYC] = React.useState(false);

  useEffect(() => {
    if (user && !user.isDocumentVerified && !user.isDocumentUploaded) {
      setShowKYC(true);
    }
  }, [user]);

  return (
    <SafeAreaView style={s.root}>
      <KYCModal visible={showKYC} onComplete={() => {
        setShowKYC(false);
        fetchDashboard();
      }} />
      {/* Gradient Header */}
      <LinearGradient colors={['#0D1B40', '#1A3FD8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
        <View style={s.topRow}>
          <View style={s.userRow}>
            <View style={s.avatar}><Text style={s.avatarTxt}>{initials}</Text></View>
            <View>
              <Text style={s.greeting}>Welcome back 👋</Text>
              <Text style={s.userName}>{userName}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('Notifications')}>
            <Icon name="bell-outline" size={18} color="#fff" />
            <View style={s.bellDot} />
          </TouchableOpacity>
        </View>

        {/* Balance Card - Refined */}
        <View style={s.balCard}>
          <View style={s.balHeader}>
            <Text style={s.balLabel}>WALLET OVERVIEW</Text>
          </View>

          <View style={s.mainBalRow}>
            <View style={s.balItem}>
              <Text style={s.balSubLabel}>Available Balance ₦</Text>
              {isWalletLoading ? <ActivityIndicator color="#fff" size="small" /> : (
                <Text style={s.balAmtMain}>
                  ₦{(ngnWallet?.availableBalance || 0).toLocaleString()}
                </Text>
              )}
            </View>
          </View>

          <View style={s.balStatsRow}>
            <View style={s.balStatItem}>
              <Text style={s.balStatLabel}>Escrow Balance ₦</Text>
              <Text style={s.balStatValue}>₦{(ngnWallet?.escrowBalance || 0).toLocaleString()}</Text>
            </View>
            <View style={s.balDivider} />
            <View style={s.balStatItem}>
              <Text style={s.balStatLabel}>Ledger Balance ₦</Text>
              <Text style={s.balStatValue}>₦{(ngnWallet?.ledgerBalance || 0).toLocaleString()}</Text>
            </View>
          </View>

          <View style={s.balActions}>
            <TouchableOpacity
              style={s.balBtn}
              onPress={() => navigation.navigate('Wallet' as any, { screen: 'Deposit' } as any)}
            >
              <Text style={s.balBtnTxt}>⬇ Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.balBtn}
              onPress={() => navigation.navigate('Wallet' as any, { screen: 'Withdraw' } as any)}
            >
              <Text style={s.balBtnTxt}>⬆ Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Body */}
      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={s.statsGrid}>
          {STAT_CARDS.map((card, i) => (
            <View key={card.key} style={s.statCard}>
              <View style={[s.statBar, { backgroundColor: card.bar }]} />
              <View style={[s.statIcon, { backgroundColor: card.bg }]}>
                <Icon name={card.icon} size={16} color={card.bar} />
              </View>
              <Text style={s.statVal}>{statValues[i]}</Text>
              <Text style={s.statLbl}>{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Monthly Volume Chart - Dual Bars */}
        <View style={s.chartCard}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Monthly Volume</Text>
          </View>
          <View style={s.chartBars}>
            {chartData.length > 0 && chartData.some(d => d.buyVolume > 0 || d.sellVolume > 0) ? chartData.map((d, i) => {
              const maxValMonth = Math.max(d.buyVolume, d.sellVolume, 1);
              const buyPct = (d.buyVolume / maxVol) * 100;
              const sellPct = (d.sellVolume / maxVol) * 100;
              return (
                <View key={i} style={s.barWrap}>
                  <View style={s.dualBarContainer}>
                    <LinearGradient
                      colors={['#4361EE', '#1A3FD8']}
                      style={[s.bar, { height: `${Math.max(buyPct, 5)}%` as any, marginRight: 2 }]}
                    />
                    <LinearGradient
                      colors={['#00D4AA', '#00B899']}
                      style={[s.bar, { height: `${Math.max(sellPct, 5)}%` as any }]}
                    />
                  </View>
                  <Text style={s.barLabel}>{d.monthLabel.slice(0, 3)}</Text>
                </View>
              );
            }) : (
              // Empty state instead of skeleton stubs
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 80 }}>
                <Text style={{ color: colors.gray, fontSize: 12 }}>No transaction history available</Text>
              </View>
            )}
          </View>
          <View style={s.chartLegend}>
            <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: colors.blue }]} /><Text style={s.legendTxt}>Buy</Text></View>
            <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: colors.success }]} /><Text style={s.legendTxt}>Sell</Text></View>
          </View>
        </View>


        {/* Recent Transactions */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity><Text style={s.seeAll}>See All</Text></TouchableOpacity>
        </View>

        {(dashboard?.recentTransactions || []).slice(0, 3).map(tx => (
          <View key={tx.id} style={s.txItem}>
            <View style={[s.txIcon, { backgroundColor: tx.status === 'Completed' ? '#F0FDF4' : tx.status === 'Disputed' ? '#FEF2F2' : '#EEF2FF' }]}>
              <Icon name={tx.type === 'Buy' ? 'arrow-collapse-down' : 'arrow-collapse-up'} size={16} color={tx.type === 'Buy' ? colors.blue : colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.txName}>{tx.type} GBP – {tx.counterparty}</Text>
              <Text style={s.txDate}>{tx.timeAgo}</Text>
              <View style={[s.txBadge, { backgroundColor: tx.status === 'Completed' ? '#F0FDF4' : '#FFFBEB' }]}>
                <Text style={[s.txBadgeTxt, { color: tx.status === 'Completed' ? colors.success : colors.warn }]}>{tx.status.replace('_', ' ')}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[s.txAmt, { color: tx.type === 'Buy' ? colors.success : colors.danger }]}>
                {tx.type === 'Buy' ? '+' : '-'}£{tx.amountGbp.toLocaleString()}
              </Text>
              <Text style={s.txRate}>₦{tx.amountNgn.toLocaleString()}</Text>
            </View>
          </View>
        ))}

        {!dashboard && !isDashboardLoading && (
          <Text style={{ textAlign: 'center', color: colors.gray, marginTop: 20 }}>No recent transactions</Text>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 18, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 24 : 16, paddingBottom: 52 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  avatarTxt: { color: '#0D1B40', fontWeight: '700', fontSize: 13 },
  greeting: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  userName: { color: '#fff', fontWeight: '700', fontSize: 13 },
  bellBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  bellDot: { position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent2, borderWidth: 1.5, borderColor: colors.blue },
  balCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  balHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  balLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  addWalletBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  mainBalRow: { marginBottom: 20 },
  balItem: { gap: 4 },
  balSubLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '500' },
  balAmtMain: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  balStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
  balStatItem: { flex: 1, gap: 4 },
  balStatLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600' },
  balStatValue: { color: '#fff', fontSize: 15, fontWeight: '700' },
  balDivider: { width: 1, height: 25, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 15 },
  balSub: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
  balActions: { flexDirection: 'row', gap: 10 },
  balBtn: { flex: 1, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  balBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  body: { flex: 1, marginTop: -28, backgroundColor: colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 16, paddingTop: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47%', backgroundColor: colors.white, borderRadius: 14, padding: 14, elevation: 2, overflow: 'hidden' },
  statBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  statIcon: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statVal: { fontSize: 20, fontWeight: '800', color: colors.text },
  statLbl: { fontSize: 10, color: colors.gray, marginTop: 1 },
  chartCard: { backgroundColor: colors.white, borderRadius: 18, padding: 14, marginBottom: 16, elevation: 2 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  chip: { backgroundColor: '#EEF2FF', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  chipTxt: { color: colors.blue, fontSize: 10, fontWeight: '600' },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 7 },
  barWrap: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  dualBarContainer: { flexDirection: 'row', alignItems: 'flex-end', width: '100%', height: '100%', justifyContent: 'center' },
  bar: { width: 6, borderRadius: 3 },
  barStub: { width: 6, borderRadius: 3 },
  barLabel: { fontSize: 9, color: colors.gray, marginTop: 6 },
  chartLegend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: 10, color: colors.gray, fontWeight: '600' },
  qaGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  qaItem: { alignItems: 'center', gap: 6 },
  qaIcon: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  qaLabel: { fontSize: 10, fontWeight: '600', color: colors.text2 },
  seeAll: { fontSize: 11, color: colors.blue, fontWeight: '600' },
  txItem: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.white, padding: 12, borderRadius: 13, marginBottom: 7, elevation: 1 },
  txIcon: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  txName: { fontSize: 12, fontWeight: '600', color: colors.text },
  txDate: { fontSize: 10, color: colors.gray, marginTop: 1 },
  txBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20, marginTop: 3, alignSelf: 'flex-start' },
  txBadgeTxt: { fontSize: 9, fontWeight: '600' },
  txAmt: { fontWeight: '700', fontSize: 13 },
  txRate: { fontSize: 10, color: colors.gray },
});
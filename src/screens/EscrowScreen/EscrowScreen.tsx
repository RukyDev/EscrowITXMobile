import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl, Platform, StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { EscrowStackParamList } from '../../navigation/types';
import { escrowApi, GetEscrowDto, TransStatus } from '../../core/api/escrow.api';

type Nav = NativeStackNavigationProp<EscrowStackParamList, 'EscrowList'>;

type TabType = 'Active' | 'Completed' | 'Disputed';

export default function EscrowScreen() {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<TabType>('Active');
  const [escrows, setEscrows] = useState<GetEscrowDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEscrows = async () => {
    try {
      // Use getHistory as requested for filtered tabs
      const resp = await escrowApi.getHistory();
      setEscrows(resp || []);
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEscrows();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEscrows();
  };

  const getFilteredEscrows = () => {
    return escrows.filter(e => {
      if (activeTab === 'Completed') return e.transactionStatus === 4;
      if (activeTab === 'Disputed') return e.transactionStatus === 11;
      // Active: Everything else except Completed, Disputed, Cancelled
      return e.transactionStatus !== 4
        && e.transactionStatus !== 11
        && e.transactionStatus !== TransStatus.Cancled;
    });
  };

  const getStatusLabel = (status: TransStatus) => {
    switch (status) {
      case TransStatus.Pending:
      case TransStatus.In_Escrow:
      case TransStatus.OnHold:
      case TransStatus.Part_In_Escrow:
        return { lbl: 'Awaiting Transfer', clr: colors.blue, bg: '#EEF2FF' };
      case TransStatus.BuyerDebited:
        return { lbl: 'Transfer Sent', clr: colors.blue, bg: '#EEF2FF' };
      case TransStatus.SellerDebited:
        return { lbl: 'Awaiting Confirmation', clr: colors.accent2, bg: '#FFF7ED' };
      case TransStatus.Completed:
        return { lbl: 'Completed', clr: colors.success, bg: '#F0FDF4' };
      case TransStatus.Disputed:
        return { lbl: 'Disputed', clr: colors.danger, bg: '#FEF2F2' };
      case TransStatus.Cancled:
        return { lbl: 'Cancelled', clr: colors.gray, bg: colors.grayLight };
      default:
        return { lbl: 'In Escrow', clr: colors.blue, bg: '#EEF2FF' };
    }
  };

  const filtered = getFilteredEscrows();

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Escrow Transactions</Text>
      </View>

      <View style={s.tabsWrap}>
        <View style={s.tabs}>
          <TouchableOpacity style={[s.tab, activeTab === 'Active' && s.tabActive]} onPress={() => setActiveTab('Active')}>
            <Text style={[s.tabTxt, activeTab === 'Active' && s.tabTxtActive]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tab, activeTab === 'Completed' && s.tabActive]} onPress={() => setActiveTab('Completed')}>
            <Text style={[s.tabTxt, activeTab === 'Completed' && s.tabTxtActive]}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tab, activeTab === 'Disputed' && s.tabActive]} onPress={() => setActiveTab('Disputed')}>
            <Text style={[s.tabTxt, activeTab === 'Disputed' && s.tabTxtActive]}>Disputed</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={s.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={s.emptyState}>
            <Icon name="file-document-outline" size={48} color={colors.grayLight} />
            <Text style={s.emptyTxt}>No {activeTab.toLowerCase()} escrow transactions.</Text>
          </View>
        ) : (
          filtered.map((e, i) => {
            const isBuy = e.excrowType === 0;
            const counterparty = isBuy ? e.sellerName : e.buyerName;
            const uiStatus = getStatusLabel(e.transactionStatus);

            return (
              <TouchableOpacity key={e.id || i} style={s.card} onPress={() => navigation.navigate('EscrowDetail', { escrow: e })}>
                <View style={s.cardHeader}>
                  <Text style={s.cardId}>Order #{e.id || 'N/A'}</Text>
                  <View style={[s.statusBadge, { backgroundColor: uiStatus.bg }]}>
                    <Text style={[s.statusTxt, { color: uiStatus.clr }]}>{uiStatus.lbl}</Text>
                  </View>
                </View>

                <View style={s.cardRow}>
                  <View>
                    <Text style={s.lbl}>Type</Text>
                    <Text style={[s.val, { color: isBuy ? colors.blue : colors.success }]}>
                      {isBuy ? 'Buy GBP' : 'Sell GBP'}
                    </Text>
                  </View>
                  <View>
                    <Text style={s.lbl}>GBP Amount</Text>
                    <Text style={s.val}>£{e.volume}</Text>
                  </View>
                  <View>
                    <Text style={[s.lbl, { textAlign: 'right' }]}>Naira Eqv.</Text>
                    <Text style={[s.val, { textAlign: 'right' }]}>₦{e.amountEquivalent?.toLocaleString()}</Text>
                  </View>
                </View>

                <View style={s.cardFooter}>
                  <View style={s.footerLeft}>
                    <Icon name="account-circle" size={16} color={colors.gray} style={{ marginRight: 4 }} />
                    <Text style={s.footerTxt}>{isBuy ? 'Seller' : 'Buyer'}: {counterparty || 'Unknown'}</Text>
                  </View>
                  <Text style={s.footerTxt}>{new Date(e.transactionDate).toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 16,
    paddingBottom: 16,
    backgroundColor: colors.white
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  tabsWrap: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.grayLight },
  tabs: { flexDirection: 'row', backgroundColor: colors.grayLight, borderRadius: 10, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: colors.white, elevation: 1 },
  tabTxt: { fontSize: 13, fontWeight: '600', color: colors.gray },
  tabTxtActive: { color: colors.text },
  body: { flex: 1, padding: 16 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTxt: { fontSize: 14, color: colors.gray, marginTop: 12 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardId: { fontSize: 14, fontWeight: '700', color: colors.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusTxt: { fontSize: 11, fontWeight: '600' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  lbl: { fontSize: 11, color: colors.gray, marginBottom: 4 },
  val: { fontSize: 14, fontWeight: '700', color: colors.text },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.grayLight, paddingTop: 12 },
  footerLeft: { flexDirection: 'row', alignItems: 'center' },
  footerTxt: { fontSize: 11, color: colors.text2 }
});
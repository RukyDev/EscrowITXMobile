import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView, RefreshControl, StatusBar, Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { MarketStackParamList } from '../../navigation/types';
import { adsApi, Ad } from '../../core/api/ads.api';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'Marketplace'>;

export default function AdsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'Buy' | 'Sell'>('Buy');
  // ... rest of state stays the same
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAds = async () => {
    try {
      const adsData = await adsApi.getAllAds();
      setAds(adsData || []);
    } catch (e) {
      console.error('Failed to fetch ads', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAds();
  };

  const filteredAds = ads.filter(ad =>
    ad.adType?.toLowerCase() === activeTab.toLowerCase() &&
    (ad.adsStatus === 'open' || ad.status === 1)
  );

  const handleAction = (ad: Ad) => {
    if (activeTab === 'Buy') {
      navigation.navigate('BuyFromTrader', {
        adId: ad.id,
        traderName: ad.traderName || 'Trader',
        rate: ad.rate,
        minGbp: ad.minAmount || 10,
        maxGbp: ad.maxAmount || ad.volume,
        paymentMethod: ad.paymentMethod || 'Bank Transfer'
      });
    } else {
      navigation.navigate('SellToTrader', {
        adId: ad.id,
        traderName: ad.traderName || 'Trader',
        rate: ad.rate,
        minGbp: ad.minAmount || 10,
        maxGbp: ad.maxAmount || ad.volume,
      });
    }
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={[s.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={s.headerTitle}>Marketplace</Text>
        <TouchableOpacity
          style={s.createBtn}
          onPress={() => navigation.navigate('PersonalAds')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="list-status" size={16} color={colors.white} />
          <Text style={s.createBtnTxt}>View Ads</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabsWrap}>
        <View style={s.tabs}>
          <TouchableOpacity style={[s.tab, activeTab === 'Buy' && s.tabActive]} onPress={() => setActiveTab('Buy')}>
            <Text style={[s.tabTxt, activeTab === 'Buy' && s.tabTxtActive]}>Buy GBP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tab, activeTab === 'Sell' && s.tabActive]} onPress={() => setActiveTab('Sell')}>
            <Text style={[s.tabTxt, activeTab === 'Sell' && s.tabTxtActive]}>Sell GBP</Text>
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
        ) : filteredAds.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyTxt}>No {activeTab.toLowerCase()} ads available.</Text>
            <TouchableOpacity style={s.createAdBtn} onPress={() => navigation.navigate(activeTab === 'Buy' ? 'CreateBuyAd' : 'CreateSellAd')}>
              <Text style={s.createAdTxt}>Be the first to create one</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredAds.map((ad, i) => (
            <View key={ad.id || i} style={s.adCard}>
              <View style={s.adHeader}>
                <View style={s.traderInfo}>
                  <View style={s.avatar}><Text style={s.avatarTxt}>{ad.traderInitials || 'TR'}</Text></View>
                  <View>
                    <View style={s.traderNameRow}>
                      <Text style={s.traderName}>{ad.traderName || 'Trader'}</Text>
                      <Icon name="check-circle" size={14} color={colors.success} />
                    </View>
                    <Text style={s.traderStats}>{ad.tradeCount || 0} trades | {ad.rating || 100}%</Text>
                  </View>
                </View>
                <View style={s.priceBox}>
                  <Text style={s.priceLabel}>Rate</Text>
                  <Text style={s.priceValue}>₦{ad.rate?.toLocaleString() || '0'}</Text>
                </View>
              </View>

              <View style={s.adLimits}>
                <Text style={s.limitText}>Limits: £{ad.minAmount || 10} - £{ad.volume || ad.maxAmount}</Text>
                <Text style={s.methodText}>{ad.paymentMethod || 'Bank Transfer'}</Text>
              </View>

              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: activeTab === 'Buy' ? colors.blue : colors.success }]}
                onPress={() => handleAction(ad)}
              >
                <Text style={s.actionBtnTxt}>{activeTab === 'Buy' ? 'Buy' : 'Sell'} GBP</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate(activeTab === 'Buy' ? 'CreateBuyAd' : 'CreateSellAd')}
      >
        <LinearGradient colors={[colors.blue, '#1A3FD8']} style={s.fabGradient}>
          <Icon name="plus" size={28} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.white
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.blue, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
  createBtnTxt: { color: colors.white, fontSize: 12, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 24, right: 24, elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  fabGradient: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  rateBanner: { margin: 16, padding: 14, borderRadius: 12 },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rateLabel: { fontSize: 11, fontWeight: '700', color: colors.blue, letterSpacing: 1 },
  rateValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  rateGraph: { backgroundColor: colors.white, padding: 4, borderRadius: 8 },
  rateSub: { fontSize: 11, color: colors.text2, marginTop: 4 },
  tabsWrap: { paddingHorizontal: 16, marginBottom: 12 },
  tabs: { flexDirection: 'row', backgroundColor: colors.grayLight, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  tabTxt: { fontSize: 13, fontWeight: '600', color: colors.gray },
  tabTxtActive: { color: colors.text },
  body: { flex: 1, paddingHorizontal: 16 },
  adCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 1 },
  adHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  traderInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent2, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 14, fontWeight: '700', color: colors.white },
  traderNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  traderName: { fontSize: 15, fontWeight: '700', color: colors.text },
  traderStats: { fontSize: 11, color: colors.gray },
  priceBox: { alignItems: 'flex-end' },
  priceLabel: { fontSize: 10, color: colors.gray, marginBottom: 2 },
  priceValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  adLimits: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background, padding: 10, borderRadius: 8, marginBottom: 16 },
  limitText: { fontSize: 12, color: colors.text2, fontWeight: '500' },
  methodText: { fontSize: 11, color: colors.blue, fontWeight: '600', backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  actionBtn: { width: '100%', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  actionBtnTxt: { color: colors.white, fontSize: 14, fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTxt: { fontSize: 14, color: colors.gray, marginBottom: 16 },
  createAdBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#EEF2FF', borderRadius: 8 },
  createAdTxt: { color: colors.blue, fontWeight: '600', fontSize: 13 }
});
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, SafeAreaView, RefreshControl, Alert, Modal, TextInput, Pressable
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { MarketStackParamList } from '../../navigation/types';
import { adsApi, Ad, CalculateFeeResult } from '../../core/api/ads.api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'PersonalAds'>;

export default function PersonalAdsScreen() {
    const navigation = useNavigation<Nav>();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<'Buy' | 'Sell'>('Buy');
    // ... rest of state stays the same
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Edit Modal State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
    const [editRate, setEditRate] = useState('');
    const [editVolume, setEditVolume] = useState('');
    const [feeResult, setFeeResult] = useState<CalculateFeeResult | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (editVolume && editRate && editModalVisible) {
            const vol = parseFloat(editVolume);
            const r = parseFloat(editRate);
            if (!isNaN(vol) && !isNaN(r)) {
                adsApi.calculateFee(vol, r).then(setFeeResult).catch(console.error);
            }
        } else {
            setFeeResult(null);
        }
    }, [editVolume, editRate, editModalVisible]);

    const fetchPersonalAds = useCallback(async () => {
        try {
            setLoading(true);
            const adsData = activeTab === 'Buy'
                ? await adsApi.getAllPersonalBuyAds()
                : await adsApi.getAllPersonalSellAds();
            setAds(adsData || []);
        } catch (e) {
            console.error('Failed to fetch personal ads', e);
            Alert.alert('Error', 'Could not retrieve your ads.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchPersonalAds();
    }, [fetchPersonalAds]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPersonalAds();
    };

    const handleDelete = async (adId: number) => {
        Alert.alert(
            'Delete Ad',
            'Are you sure you want to delete this ad?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adsApi.deleteAd(adId);
                            Alert.alert('Success', 'Ad deleted successfully');
                            fetchPersonalAds();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete ad');
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = (ad: Ad) => {
        navigation.navigate('EditAd', { ad });
    };

    return (
        <View style={[s.root, { paddingTop: insets.top }]}>
            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={s.backBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Icon name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>My Ads</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={s.tabsWrap}>
                <View style={s.tabs}>
                    <TouchableOpacity
                        style={[s.tab, activeTab === 'Buy' && s.tabActive]}
                        onPress={() => setActiveTab('Buy')}
                    >
                        <Text style={[s.tabTxt, activeTab === 'Buy' && s.tabTxtActive]}>Buying</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[s.tab, activeTab === 'Sell' && s.tabActive]}
                        onPress={() => setActiveTab('Sell')}
                    >
                        <Text style={[s.tabTxt, activeTab === 'Sell' && s.tabTxtActive]}>Selling</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={s.body}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 40 }} />
                ) : ads.length === 0 ? (
                    <View style={s.emptyState}>
                        <Icon name="file-document-outline" size={64} color={colors.grayLight} />
                        <Text style={s.emptyTxt}>You have no {activeTab.toLowerCase()} ads.</Text>
                    </View>
                ) : (
                    ads.map((ad) => (
                        <View key={ad.adID} style={s.adCard}>
                            <View style={s.adMain}>
                                <View style={s.adInfo}>
                                    <Text style={s.currencyText}>{ad.currency || 'GBP'}</Text>
                                    <Text style={s.rateText}>Rate: ₦{ad.rate.toLocaleString()}</Text>
                                    <Text style={s.volumeText}>Vol: {ad.volume.toLocaleString()}</Text>
                                </View>
                                <View style={[s.statusBadge, { backgroundColor: ad.adsStatus?.toLowerCase() === 'open' ? '#F0FDF4' : '#F3F4F6' }]}>
                                    <Text style={[s.statusTxt, { color: ad.adsStatus?.toLowerCase() === 'open' ? colors.success : colors.gray }]}>
                                        {(ad.adsStatus || '').toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <View style={s.adActions}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={[
                                        s.actionBtn,
                                        s.editBtn,
                                        ad.adsStatus?.toLowerCase() !== 'open' && s.btnDisabled
                                    ]}
                                    onPress={() => handleEdit(ad)}
                                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                                >
                                    <Icon name="pencil-outline" size={18} color={ad.adsStatus?.toLowerCase() === 'open' ? colors.blue : colors.gray} />
                                    <Text style={[s.actionTxt, { color: ad.adsStatus?.toLowerCase() === 'open' ? colors.blue : colors.gray }]}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={[
                                        s.actionBtn,
                                        s.deleteBtn,
                                        ad.adsStatus?.toLowerCase() !== 'open' && s.btnDisabled
                                    ]}
                                    onPress={() => handleDelete(ad.adID)}
                                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                                >
                                    <Icon name="trash-can-outline" size={18} color={ad.adsStatus?.toLowerCase() === 'open' ? colors.danger : colors.gray} />
                                    <Text style={[s.actionTxt, { color: ad.adsStatus?.toLowerCase() === 'open' ? colors.danger : colors.gray }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.white },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    tabsWrap: { padding: 16 },
    tabs: { flexDirection: 'row', backgroundColor: colors.grayLight, borderRadius: 12, padding: 4 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    tabActive: { backgroundColor: colors.white, elevation: 2 },
    tabTxt: { fontSize: 14, fontWeight: '600', color: colors.gray },
    tabTxtActive: { color: colors.blue },
    body: { flex: 1, paddingHorizontal: 16 },
    adCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 1 },
    adMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    adInfo: { gap: 4 },
    currencyText: { fontSize: 16, fontWeight: '700', color: colors.text },
    rateText: { fontSize: 14, color: colors.text2 },
    volumeText: { fontSize: 14, color: colors.text2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusTxt: { fontSize: 10, fontWeight: '700' },
    adActions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: colors.grayLight, paddingTop: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, minWidth: 100 },
    editBtn: { backgroundColor: '#EFF6FF' },
    deleteBtn: { backgroundColor: '#FEF2F2' },
    actionTxt: { fontSize: 13, fontWeight: '700' },
    btnDisabled: { opacity: 0.4 },
    fab: { position: 'absolute', bottom: 24, right: 24, elevation: 8 },
    fabGradient: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 100, gap: 12 },
    emptyTxt: { fontSize: 14, color: colors.gray },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: colors.white, borderRadius: 20, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 20 },
    label: { fontSize: 12, color: colors.gray, marginBottom: 8 },
    input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 10, padding: 12, marginBottom: 16, color: colors.text },
    disabledInput: { backgroundColor: '#F3F4F6', color: colors.gray },
    inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#FAFAFA', marginBottom: 16 },
    suffix: { fontSize: 12, fontWeight: '700', color: colors.gray, marginLeft: 8 },
    profitNote: { fontSize: 11, color: colors.gray, marginTop: -8, marginBottom: 16, fontStyle: 'italic' },
    readOnlyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
    readOnlyVal: { fontSize: 13, fontWeight: '700', color: colors.gray },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 10 },
    cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#F3F4F6' },
    cancelBtnTxt: { color: colors.text, fontWeight: '600' },
    saveBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: colors.blue },
    saveBtnTxt: { color: colors.white, fontWeight: '600' },
});

import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, ScrollView, ActivityIndicator, Alert, Switch, Modal, FlatList, Platform, StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { MarketStackParamList } from '../../navigation/types';
import { adsApi, Currency, ExternalRate, CalculateFeeResult } from '../../core/api/ads.api';
import { walletApi, WalletBalance } from '../../core/api/wallet.api';
import LinearGradient from 'react-native-linear-gradient';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'CreateBuyAd'>;

export default function CreateBuyAdScreen() {
    const navigation = useNavigation<Nav>();
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [wallets, setWallets] = useState<WalletBalance[]>([]);
    const [externalRates, setExternalRates] = useState<ExternalRate[]>([]);

    const [selectedCurrency, setSelectedCurrency] = useState<number | null>(null);
    const [rate, setRate] = useState('');
    const [volume, setVolume] = useState('');
    const [terms, setTerms] = useState('');
    const [allowPartSales, setAllowPartSales] = useState(true);
    const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [showRatesModal, setShowRatesModal] = useState(false);
    const [feeResult, setFeeResult] = useState<CalculateFeeResult | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [currData, walletData, ratesData] = await Promise.all([
                    adsApi.getCurrencies(),
                    walletApi.getBeneficiaryWallets(),
                    adsApi.getExternalRates()
                ]);
                setCurrencies(currData || []);
                setWallets(walletData || []);
                setExternalRates(ratesData || []);
                if (currData?.length > 0) setSelectedCurrency(currData[0].id);
            } catch (e) {
                console.error('Failed to load ad data', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (volume && rate) {
            const vol = parseFloat(volume);
            const r = parseFloat(rate);
            if (!isNaN(vol) && !isNaN(r)) {
                adsApi.calculateFee(vol, r).then(setFeeResult).catch(console.error);
            }
        } else {
            setFeeResult(null);
        }
    }, [volume, rate]);

    const handlePublish = async () => {
        if (!rate || !volume || !selectedCurrency || !selectedWalletId) {
            Alert.alert('Required Fields', 'Please fill all fields including currency and GBP account');
            return;
        }

        setPublishing(true);
        try {
            await adsApi.createBuyAd({
                accountID: selectedWalletId,
                currencyId: selectedCurrency,
                rate: parseFloat(rate),
                volume: parseFloat(volume),
                tradeTerms: terms,
                allowPartSales
            });
            navigation.navigate('AdSuccess', { type: 'buy' });
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to create ad');
        } finally {
            setPublishing(false);
        }
    };

    const equivalentAmount = (parseFloat(rate) || 0) * (parseFloat(volume) || 0);

    const renderRateProvider = ({ item }: { item: string }) => {
        const providerRates = externalRates.filter(r => r.comapany === item);
        const buyRate = providerRates.find(r => r.transType === 0)?.rate;
        const sellRate = providerRates.find(r => r.transType === 1)?.rate;

        return (
            <View style={s.rateRow}>
                <Text style={s.providerName}>{item}</Text>
                <Text style={s.rateVal}>₦{buyRate?.toLocaleString() || '-'}</Text>
                <Text style={s.rateVal}>₦{sellRate?.toLocaleString() || '-'}</Text>
            </View>
        );
    };

    const providers = Array.from(new Set(externalRates.map(r => r.comapany)));
    const avgSellRate = externalRates.filter(r => r.transType === 1).reduce((acc, curr) => acc + curr.rate, 0) / (externalRates.filter(r => r.transType === 1).length || 1);

    const selectedWallet = wallets.find(w => w.id === selectedWalletId);

    if (loading) return <View style={s.loading}><ActivityIndicator size="large" color={colors.blue} /></View>;

    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Create Buy Ad</Text>
            </View>

            <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
                <View style={s.noticeWrap}>
                    <Icon name="information" size={20} color={colors.blue} />
                    <Text style={s.noticeTxt}>You are creating an offer to <Text style={{ fontWeight: '700' }}>BUY GBP</Text>. Other traders will sell their GBP to you at your set rate.</Text>
                </View>

                <View style={s.card}>
                    <Text style={s.label}>Currency</Text>
                    <View style={s.pickerRow}>
                        {currencies.map(c => (
                            <TouchableOpacity
                                key={c.id}
                                style={[s.chip, selectedCurrency === c.id && s.chipActive]}
                                onPress={() => setSelectedCurrency(c.id)}
                            >
                                <Text style={[s.chipTxt, selectedCurrency === c.id && s.chipTxtActive]}>{c.currencyCode}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[s.label, { marginTop: 20 }]}>Exchange Rate (₦ per £1)</Text>
                    <View style={s.inputWrap}>
                        <Text style={s.prefix}>₦</Text>
                        <TextInput
                            style={s.input}
                            placeholder="e.g. 1450"
                            keyboardType="numeric"
                            value={rate}
                            onChangeText={setRate}
                        />
                    </View>
                    <TouchableOpacity style={s.viewRatesBtn} onPress={() => setShowRatesModal(true)}>
                        <Icon name="information-outline" size={14} color={colors.blue} />
                        <Text style={s.viewRatesTxt}>View Market Rates</Text>
                    </TouchableOpacity>

                    <Text style={[s.label, { marginTop: 20 }]}>I Want to Buy</Text>
                    <View style={s.inputWrap}>
                        <TextInput
                            style={s.input}
                            placeholder="Enter Amount..."
                            keyboardType="numeric"
                            value={volume}
                            onChangeText={setVolume}
                        />
                        <Text style={s.suffix}>£ GBP</Text>
                    </View>

                    <Text style={[s.label, { marginTop: 20 }]}>Equivalent Amount</Text>
                    <View style={[s.inputWrap, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB', justifyContent: 'space-between' }]}>
                        <Text style={[s.input, { flex: 0 }]}>₦{equivalentAmount.toLocaleString()}</Text>
                        <Text style={s.suffix}>NGN</Text>
                    </View>
                    <Text style={s.profitNote}>
                        Note: we charge 1.5% of your profit only. (you profit {feeResult?.tradersProfit || 0} and we take {feeResult?.escrowItxProfit || 0})
                    </Text>

                    <Text style={[s.label, { marginTop: 20 }]}>Your GBP Account Details (to receive Pounds)</Text>
                    <TouchableOpacity style={s.dropdown} onPress={() => setShowWalletModal(true)}>
                        {selectedWallet ? (
                            <View style={s.dropdownSelected}>
                                <Icon name="bank" size={20} color={colors.blue} />
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={s.dropdownTitle}>{selectedWallet.accountName}</Text>
                                    <Text style={s.dropdownSub}>{selectedWallet.accountNumber}</Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={s.dropdownPlaceholder}>Select GBP Beneficiary Account</Text>
                        )}
                        <Icon name="chevron-down" size={24} color={colors.gray} />
                    </TouchableOpacity>

                    <Text style={[s.label, { marginTop: 20 }]}>Transaction Policy & Terms</Text>
                    <TextInput
                        style={[s.textArea]}
                        placeholder="Specify your terms, conditions, and any special instructions..."
                        multiline
                        numberOfLines={4}
                        value={terms}
                        onChangeText={setTerms}
                    />

                    <View style={s.switchRow}>
                        <View style={{ flex: 1, paddingRight: 16 }}>
                            <Text style={s.switchLabel}>Allow Partial Trades</Text>
                            <Text style={s.switchSub}>Users can sell a portion of your total volume instead of the full amount.</Text>
                        </View>
                        <Switch
                            value={allowPartSales}
                            onValueChange={setAllowPartSales}
                            trackColor={{ false: colors.grayLight, true: colors.blue }}
                        />
                    </View>
                </View>

                <TouchableOpacity style={s.btn} onPress={handlePublish} disabled={publishing}>
                    {publishing ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Create Ad</Text>}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Wallet Selection Modal */}
            <Modal visible={showWalletModal} transparent animationType="slide">
                <View style={s.modalOverlay}>
                    <View style={s.modalContentBottom}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Select GBP Account</Text>
                            <TouchableOpacity onPress={() => setShowWalletModal(false)}>
                                <Icon name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {wallets.length > 0 ? wallets.map(w => (
                                <TouchableOpacity
                                    key={w.id}
                                    style={[s.walletOption, selectedWalletId === w.id && s.walletOptionActive]}
                                    onPress={() => {
                                        setSelectedWalletId(w.id);
                                        setShowWalletModal(false);
                                    }}
                                >
                                    <View style={s.walletOptionInfo}>
                                        <Icon name="bank" size={24} color={selectedWalletId === w.id ? colors.white : colors.blue} />
                                        <View style={{ marginLeft: 12 }}>
                                            <Text style={[s.walletOptionTitle, selectedWalletId === w.id && s.walletOptionTitleActive]}>{w.accountName}</Text>
                                            <Text style={[s.walletOptionSub, selectedWalletId === w.id && s.walletOptionSubActive]}>{w.accountNumber} • {w.bankName || 'Beneficiary'}</Text>
                                        </View>
                                    </View>
                                    {selectedWalletId === w.id && <Icon name="check-circle" size={20} color={colors.white} />}
                                </TouchableOpacity>
                            )) : (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <Text style={{ color: colors.gray }}>No beneficiary accounts found</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={showRatesModal} transparent animationType="fade">
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Live Market Rates</Text>
                            <TouchableOpacity onPress={() => setShowRatesModal(false)}>
                                <Icon name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <Text style={s.modalSub}>Rates are updated at 30-minute intervals. Please visit the provider page for the most recent rate.</Text>

                        <View style={s.rateTableHeader}>
                            <Text style={[s.tableHead, { flex: 1.5 }]}>Provider</Text>
                            <Text style={s.tableHead}>Buy</Text>
                            <Text style={s.tableHead}>Sell</Text>
                        </View>
                        <FlatList
                            data={providers}
                            renderItem={renderRateProvider}
                            keyExtractor={item => item}
                        />

                        <View style={s.avgBox}>
                            <Text style={s.avgLabel}>Market Average Sell Rate: <Text style={s.avgVal}>₦{avgSellRate.toLocaleString()}</Text></Text>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 24 : 16,
        paddingBottom: 16,
        backgroundColor: colors.white,
        elevation: 2
    },
    backBtn: { marginRight: 12 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    body: { flex: 1, padding: 16 },
    noticeWrap: { flexDirection: 'row', backgroundColor: '#EEF2FF', padding: 12, borderRadius: 10, marginBottom: 20, gap: 10 },
    noticeTxt: { fontSize: 12, color: colors.blue, flex: 1, lineHeight: 18 },
    card: { backgroundColor: colors.white, padding: 16, borderRadius: 16, marginBottom: 24, elevation: 1 },
    label: { fontSize: 13, fontWeight: '700', color: colors.text2, marginBottom: 10 },
    pickerRow: { flexDirection: 'row', gap: 10 },
    chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.grayLight, borderWidth: 1, borderColor: colors.grayLight },
    chipActive: { backgroundColor: colors.blue, borderColor: colors.blue },
    chipTxt: { fontSize: 14, fontWeight: '600', color: colors.gray },
    chipTxtActive: { color: colors.white },
    inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#FAFAFA' },
    prefix: { fontSize: 16, fontWeight: '700', color: colors.text, marginRight: 8 },
    suffix: { fontSize: 12, fontWeight: '700', color: colors.gray, marginLeft: 8 },
    input: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.text, fontWeight: '600' },
    viewRatesBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
    viewRatesTxt: { fontSize: 12, color: colors.blue, fontWeight: '600', textDecorationLine: 'underline' },
    profitNote: { fontSize: 11, color: colors.gray, marginTop: 8, fontStyle: 'italic' },
    dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 12, padding: 14, backgroundColor: '#F9FAFB' },
    dropdownPlaceholder: { color: colors.gray, fontSize: 14 },
    dropdownSelected: { flexDirection: 'row', alignItems: 'center' },
    dropdownTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
    dropdownSub: { fontSize: 12, color: colors.gray, marginTop: 2 },
    textArea: {
        borderWidth: 1,
        borderColor: colors.grayLight,
        borderRadius: 10,
        padding: 12,
        backgroundColor: '#FAFAFA',
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 14,
        color: colors.text
    },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, borderTopWidth: 1, borderTopColor: colors.grayLight, paddingTop: 16 },
    switchLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
    switchSub: { fontSize: 11, color: colors.gray, lineHeight: 16 },
    btn: { backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 3 },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: colors.white, borderRadius: 20, padding: 20, maxHeight: '80%' },
    modalContentBottom: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%', marginTop: 'auto' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
    modalSub: { fontSize: 12, color: colors.gray, marginBottom: 20, lineHeight: 18 },
    rateTableHeader: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginBottom: 10 },
    tableHead: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.text2, textAlign: 'center' },
    rateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.grayLight },
    providerName: { flex: 1.5, fontSize: 14, fontWeight: '700', color: colors.text },
    rateVal: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.danger, textAlign: 'center' },
    avgBox: { marginTop: 20, padding: 15, backgroundColor: '#EEF2FF', borderRadius: 12, alignItems: 'center' },
    avgLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
    avgVal: { color: colors.blue },
    walletOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, marginBottom: 8, backgroundColor: '#F9FAFB' },
    walletOptionActive: { backgroundColor: colors.blue },
    walletOptionInfo: { flexDirection: 'row', alignItems: 'center' },
    walletOptionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
    walletOptionTitleActive: { color: colors.white },
    walletOptionSub: { fontSize: 12, color: colors.gray, marginTop: 2 },
    walletOptionSubActive: { color: 'rgba(255,255,255,0.7)' }
});

import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { MarketStackParamList } from '../../navigation/types';
import { adsApi, Ad, CalculateFeeResult } from '../../core/api/ads.api';
import LinearGradient from 'react-native-linear-gradient';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'EditAd'>;

export default function EditAdScreen() {
    const navigation = useNavigation<Nav>();
    const route = useRoute<any>();
    const { ad } = route.params;

    const [rate, setRate] = useState(ad.rate.toString());
    const [volume, setVolume] = useState(ad.volume.toString());
    const [terms, setTerms] = useState(ad.tradeTerms || '');
    const [allowPartSales, setAllowPartSales] = useState(ad.allowPartSales || false);

    const [updating, setUpdating] = useState(false);
    const [feeResult, setFeeResult] = useState<CalculateFeeResult | null>(null);
    const [togglingStatus, setTogglingStatus] = useState(false);

    const adsStatus = (ad.adsStatus || '').toLowerCase();
    const canToggleStatus = adsStatus === 'open' || adsStatus === 'closed';

    useEffect(() => {
        if (volume && rate) {
            const vol = parseFloat(volume);
            const r = parseFloat(rate);
            if (!isNaN(vol) && !isNaN(r) && vol > 0 && r > 0) {
                adsApi.calculateFee(vol, r).then(setFeeResult).catch(() => setFeeResult(null));
            }
        } else {
            setFeeResult(null);
        }
    }, [volume, rate]);

    const handleSave = async () => {
        if (!rate || !volume) {
            Alert.alert('Required Fields', 'Please fill all fields');
            return;
        }

        setUpdating(true);
        try {
            await adsApi.updateAd({
                id: ad.adID || ad.id,
                rate: parseFloat(rate),
                volume: parseFloat(volume),
                tradeTerms: terms,
                allowPartSales
            });
            Alert.alert('Success', 'Advertisement updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to update ad');
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleStatus = async () => {
        const adId = ad.adID || ad.id;
        setTogglingStatus(true);
        try {
            if (adsStatus === 'open') {
                await adsApi.closeAd(adId);
                Alert.alert('Success', 'Ad closed successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                await adsApi.openAd(adId);
                Alert.alert('Success', 'Ad reopened successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Unable to update ad status');
        } finally {
            setTogglingStatus(false);
        }
    };

    const equivalentAmount = (parseFloat(rate) || 0) * (parseFloat(volume) || 0);

    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Edit {ad.adType} Ad</Text>
            </View>

            <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
                {ad.isExpired && (
                    <View style={s.expiredBanner}>
                        <Icon name="alert-circle-outline" size={16} color="#92400E" />
                        <Text style={s.expiredBannerTxt}>
                            This ad was automatically closed after 72 hours with no trades. Reopen it below if it's still available.
                        </Text>
                    </View>
                )}

                <View style={s.card}>
                    <Text style={s.label}>Currency (Read-only)</Text>
                    <View style={[s.inputWrap, s.disabledInput]}>
                        <Text style={s.disabledTxt}>{ad.currency || 'GBP'}</Text>
                    </View>

                    <Text style={[s.label, { marginTop: 20 }]}>Exchange Rate (₦ per £1)</Text>
                    <View style={s.inputWrap}>
                        <Text style={s.prefix}>₦</Text>
                        <TextInput
                            style={s.input}
                            keyboardType="numeric"
                            value={rate}
                            onChangeText={setRate}
                        />
                    </View>

                    <Text style={[s.label, { marginTop: 20 }]}>Volume (GBP)</Text>
                    <View style={s.inputWrap}>
                        <TextInput
                            style={s.input}
                            keyboardType="numeric"
                            value={volume}
                            onChangeText={setVolume}
                        />
                        <Text style={s.suffix}>£ GBP</Text>
                    </View>

                    <Text style={[s.label, { marginTop: 20 }]}>Equivalent Amount</Text>
                    <View style={[s.inputWrap, { backgroundColor: '#F3F4F6', justifyContent: 'space-between' }]}>
                        <Text style={[s.input, { flex: 0 }]}>₦{equivalentAmount.toLocaleString()}</Text>
                        <Text style={s.suffix}>NGN</Text>
                    </View>
                    {feeResult && (
                        <View style={s.feeBreakdown}>
                            <View style={s.feeRow}>
                                <Text style={s.feeLbl}>Escrow Protection Fee ({feeResult.feePercentage}%)</Text>
                                <Text style={s.feeValNeg}>-₦{feeResult.platformFee.toLocaleString()}</Text>
                            </View>
                            <Text style={s.feeCapNote}>Min ₦{feeResult.minimumFee.toLocaleString()} · Max ₦{feeResult.maximumFee.toLocaleString()}</Text>
                            <View style={[s.feeRow, s.feeTotalRow]}>
                                <Text style={s.feeTotalLbl}>Estimated Payout</Text>
                                <Text style={s.feeTotalVal}>₦{feeResult.estimatedPayout.toLocaleString()}</Text>
                            </View>
                            <Text style={s.feeFootnote}>Fees are charged only after a successful trade.</Text>
                        </View>
                    )}

                    <Text style={[s.label, { marginTop: 20 }]}>Trade Terms</Text>
                    <TextInput
                        style={[s.inputWrap, s.textArea]}
                        multiline
                        numberOfLines={4}
                        value={terms}
                        onChangeText={setTerms}
                    />

                    <View style={s.switchRow}>
                        <View style={{ flex: 1, paddingRight: 16 }}>
                            <Text style={s.switchLabel}>Allow Partial Trades</Text>
                            <Text style={s.switchSub}>Users can trade a portion of your total volume.</Text>
                        </View>
                        <Switch
                            value={allowPartSales}
                            onValueChange={setAllowPartSales}
                            trackColor={{ false: colors.grayLight, true: colors.blue }}
                        />
                    </View>
                </View>

                <TouchableOpacity style={s.btn} onPress={handleSave} disabled={updating}>
                    {updating ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Save Changes</Text>}
                </TouchableOpacity>

                {canToggleStatus && (
                    <TouchableOpacity
                        style={[s.btn, adsStatus === 'open' ? s.btnCloseOutline : s.btnOpenOutline]}
                        onPress={handleToggleStatus}
                        disabled={togglingStatus}
                    >
                        {togglingStatus ? (
                            <ActivityIndicator color={adsStatus === 'open' ? colors.danger : colors.success} />
                        ) : (
                            <Text style={[s.btnTxt, { color: adsStatus === 'open' ? colors.danger : colors.success }]}>
                                {adsStatus === 'open' ? 'Close Ad' : 'Open Ad'}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: colors.white,
        elevation: 2
    },
    backBtn: { marginRight: 12 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    body: { flex: 1, padding: 16 },
    card: { backgroundColor: colors.white, padding: 16, borderRadius: 16, marginBottom: 24, elevation: 1 },
    label: { fontSize: 13, fontWeight: '700', color: colors.text2, marginBottom: 10 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#FAFAFA' },
    prefix: { fontSize: 16, fontWeight: '700', color: colors.text, marginRight: 8 },
    suffix: { fontSize: 12, fontWeight: '700', color: colors.gray, marginLeft: 8 },
    input: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.text, fontWeight: '600' },
    disabledInput: { backgroundColor: '#F3F4F6', opacity: 0.7 },
    disabledTxt: { paddingVertical: 12, fontSize: 16, color: colors.gray, fontWeight: '600' },
    profitNote: { fontSize: 11, color: colors.gray, marginTop: 8, fontStyle: 'italic' },
    feeBreakdown: { marginTop: 12, padding: 12, backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1, borderColor: colors.grayLight },
    feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    feeLbl: { fontSize: 12, color: colors.text2, flex: 1, paddingRight: 8 },
    feeValNeg: { fontSize: 12, fontWeight: '700', color: colors.danger },
    feeCapNote: { fontSize: 10, color: colors.gray, marginTop: 4 },
    feeTotalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.grayLight },
    feeTotalLbl: { fontSize: 13, fontWeight: '700', color: colors.text },
    feeTotalVal: { fontSize: 14, fontWeight: '800', color: colors.blue },
    feeFootnote: { fontSize: 10, color: colors.gray, marginTop: 8, fontStyle: 'italic' },
    textArea: { paddingVertical: 12, minHeight: 100, alignItems: 'flex-start', textAlignVertical: 'top' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, borderTopWidth: 1, borderTopColor: colors.grayLight, paddingTop: 16 },
    switchLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
    switchSub: { fontSize: 11, color: colors.gray, lineHeight: 16 },
    btn: { backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 3 },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' },
    btnCloseOutline: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.danger, elevation: 0, marginTop: 12 },
    btnOpenOutline: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.success, elevation: 0, marginTop: 12 },
    expiredBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 12, padding: 12, marginBottom: 16 },
    expiredBannerTxt: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 17 },
});

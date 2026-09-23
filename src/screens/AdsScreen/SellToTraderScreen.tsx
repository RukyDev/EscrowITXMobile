import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { MarketStackParamList } from '../../navigation/types';
import { escrowApi, EscrowFeeResult } from '../../core/api/escrow.api';
import { useAuthStore } from '../../store/auth.store';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'SellToTrader'>;

export default function SellToTraderScreen() {
    const navigation = useNavigation<Nav>();
    const route = useRoute<any>();
    const params = route.params as MarketStackParamList['SellToTrader'];
    const { adId, traderName = 'Trader', rate = 0, minGbp = 0, maxGbp = 0, allowPartSales = false } = params || {};

    const [gbpAmount, setGbpAmount] = useState((maxGbp || 0).toString());
    const [loading, setLoading] = useState(false);
    const [feeCalc, setFeeCalc] = useState<EscrowFeeResult | null>(null);

    const parsedGbp = parseFloat(gbpAmount) || 0;
    const ngnAmount = parsedGbp * rate;

    const user = useAuthStore(s => s.user);

    const calculateFee = async () => {
        const amt = parseFloat(gbpAmount) || 0;
        if (amt <= 0) return;
        try {
            const resp = await escrowApi.calculateFee(amt * rate);
            setFeeCalc(resp);
        } catch {
            setFeeCalc(null);
        }
    };

    useEffect(() => {
        if (maxGbp > 0) {
            calculateFee();
        }
    }, []);

    const handleCreateOrder = async () => {
        // If the ad doesn't allow partial trades, always trade the full volume,
        // regardless of what the (readonly) input currently holds.
        const finalGbp = allowPartSales ? parsedGbp : maxGbp;

        if (finalGbp < minGbp || finalGbp > maxGbp) {
            Alert.alert('Invalid Amount', `Amount must be between £${minGbp} and £${maxGbp}`);
            return;
        }

        setLoading(true);
        try {
            const resp = await escrowApi.sellEscrow({
                adID: adId,
                volumToBuy: finalGbp,
                rate: rate,
                accountId: 0
            });

            navigation.navigate('EscrowCreated', {
                orderId: resp,
                amountLocked: finalGbp * rate,
                gbpAmount: finalGbp
            });
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to create escrow order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Sell GBP</Text>
            </View>

            <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
                <View style={s.traderCard}>
                    <Text style={s.traderLabel}>Selling to</Text>
                    <Text style={s.traderName}>{traderName}</Text>
                    <View style={[s.rateBadge, { backgroundColor: '#F0FDF4' }]}>
                        <Text style={[s.rateTxt, { color: colors.success }]}>Rate: ₦{(rate || 0).toLocaleString()}/£1</Text>
                    </View>
                </View>

                <View style={s.inputCard}>
                    <Text style={s.label}>I want to sell (GBP)</Text>
                    <View style={[s.inputWrap, !allowPartSales && s.inputWrapDisabled]}>
                        <Text style={s.currencyPrefix}>£</Text>
                        <TextInput
                            style={s.amountInput}
                            value={gbpAmount}
                            onChangeText={setGbpAmount}
                            keyboardType="numeric"
                            placeholder="0.00"
                            onBlur={calculateFee}
                            editable={allowPartSales}
                        />
                    </View>
                    {allowPartSales ? (
                        <Text style={s.limitText}>Limits: £{minGbp} - £{maxGbp}</Text>
                    ) : (
                        <Text style={s.limitText}>This ad does not allow partial trades — you must take the full £{maxGbp} volume.</Text>
                    )}
                </View>

                <Icon name="swap-vertical" size={24} color={colors.gray} style={s.swapIcon} />

                <View style={s.inputCard}>
                    <Text style={s.label}>I'm receiving (NGN)</Text>
                    <View style={[s.inputWrap, s.inputWrapDisabled]}>
                        <Text style={s.currencyPrefix}>₦</Text>
                        <TextInput
                            style={s.amountInput}
                            value={ngnAmount > 0 ? ngnAmount.toLocaleString() : '0.00'}
                            editable={false}
                        />
                    </View>
                </View>

                <View style={s.summaryCard}>
                    <Text style={s.summaryTitle}>Transaction Summary</Text>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLbl}>GBP Amount</Text>
                        <Text style={s.summaryVal}>£{(parsedGbp || 0).toLocaleString()}</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLbl}>Exchange Rate</Text>
                        <Text style={s.summaryVal}>₦{(rate || 0).toLocaleString()}</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLbl}>Escrow Protection Fee {feeCalc ? `(${feeCalc.feePercentage}%)` : ''}</Text>
                        <Text style={s.summaryVal}>-₦{feeCalc ? feeCalc.platformFee.toLocaleString() : '0.00'}</Text>
                    </View>
                    <View style={[s.summaryRow, s.totalRow]}>
                        <Text style={s.totalLbl}>Total to Receive</Text>
                        <Text style={[s.totalVal, { color: colors.success }]}>₦{feeCalc ? feeCalc.estimatedPayout.toLocaleString() : ngnAmount.toLocaleString()}</Text>
                    </View>
                    <Text style={s.feeFootnote}>Fees are charged only after a successful trade.</Text>
                </View>

                <TouchableOpacity
                    style={[s.btn, (!parsedGbp || parsedGbp < minGbp || parsedGbp > maxGbp) && s.btnDisabled]}
                    onPress={handleCreateOrder}
                    disabled={loading || !parsedGbp || parsedGbp < minGbp || parsedGbp > maxGbp}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Open Escrow Trade</Text>}
                </TouchableOpacity>

                <View style={s.secureNote}>
                    <Icon name="lock-closed" size={12} color={colors.success} />
                    <Text style={s.secureTxt}>The Naira will be locked in escrow until the trader confirms the GBP you sent.</Text>
                </View>

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
        backgroundColor: colors.white
    },
    backBtn: { padding: 4, marginRight: 12 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    body: { flex: 1, padding: 16 },
    traderCard: { backgroundColor: colors.white, padding: 16, borderRadius: 12, marginBottom: 20 },
    traderLabel: { fontSize: 12, color: colors.gray, marginBottom: 4 },
    traderName: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
    rateBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
    rateTxt: { fontWeight: '600', fontSize: 12 },
    inputCard: { backgroundColor: colors.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.grayLight },
    label: { fontSize: 13, fontWeight: '600', color: colors.text2, marginBottom: 10 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.grayLight, borderRadius: 10, paddingHorizontal: 14, backgroundColor: '#F9FAFB' },
    inputWrapDisabled: { backgroundColor: colors.grayLight, borderColor: '#D1D5DB' },
    currencyPrefix: { fontSize: 20, fontWeight: '600', color: colors.text, marginRight: 8 },
    amountInput: { flex: 1, fontSize: 24, fontWeight: '700', color: colors.text, paddingVertical: 12 },
    limitText: { fontSize: 11, color: colors.gray, marginTop: 8, textAlign: 'right' },
    swapIcon: { alignSelf: 'center', marginVertical: -12, zIndex: 10, backgroundColor: colors.background, padding: 4 },
    summaryCard: { backgroundColor: colors.white, padding: 16, borderRadius: 12, marginTop: 24, marginBottom: 24 },
    summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryLbl: { fontSize: 13, color: colors.text2 },
    summaryVal: { fontSize: 13, fontWeight: '600', color: colors.text },
    totalRow: { borderTopWidth: 1, borderTopColor: colors.grayLight, paddingTop: 12, marginTop: 4, marginBottom: 0 },
    totalLbl: { fontSize: 15, fontWeight: '700', color: colors.text },
    totalVal: { fontSize: 18, fontWeight: '800' },
    feeFootnote: { fontSize: 10, color: colors.gray, marginTop: 8, fontStyle: 'italic', textAlign: 'center' },
    btn: { backgroundColor: colors.success, paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
    btnDisabled: { backgroundColor: '#86EFAC', elevation: 0 },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' },
    secureNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
    secureTxt: { fontSize: 11, color: colors.success, fontWeight: '500' }
});

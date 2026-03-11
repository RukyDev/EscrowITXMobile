import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, ScrollView, ActivityIndicator, Alert, Switch, Platform, StatusBar
} from 'react-native';
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

    useEffect(() => {
        if (volume && rate) {
            const vol = parseFloat(volume);
            const r = parseFloat(rate);
            if (!isNaN(vol) && !isNaN(r)) {
                adsApi.calculateFee(vol, r).then(setFeeResult);
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
                    <Text style={s.profitNote}>
                        Note: we charge 1.5% of your profit only. (you profit {feeResult?.tradersProfit || 0} and we take {feeResult?.escrowItxProfit || 0})
                    </Text>

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
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 16,
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
    textArea: { paddingVertical: 12, minHeight: 100, alignItems: 'flex-start', textAlignVertical: 'top' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, borderTopWidth: 1, borderTopColor: colors.grayLight, paddingTop: 16 },
    switchLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
    switchSub: { fontSize: 11, color: colors.gray, lineHeight: 16 },
    btn: { backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 3 },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' },
});

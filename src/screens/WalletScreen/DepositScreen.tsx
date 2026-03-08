import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Clipboard, Alert, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { walletApi, DepositResult } from '../../core/api/wallet.api';

export default function DepositScreen() {
    const navigation = useNavigation();
    const [data, setData] = useState<DepositResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        walletApi.deposit()
            .then(res => setData(res))
            .catch(e => {
                Alert.alert('Error', 'Failed to load deposit details');
                console.error(e);
            })
            .finally(() => setLoading(false));
    }, []);

    const copyToClipboard = (text: string, label: string) => {
        Clipboard.setString(text);
        Alert.alert('Copied', `${label} copied to clipboard`);
    };

    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Fund Wallet</Text>
            </View>

            <View style={s.body}>
                <Text style={s.subText}>Transfer NGN to the account below to automatically fund your primary wallet balance.</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 40 }} />
                ) : data ? (
                    <View style={s.card}>
                        <View style={s.row}>
                            <View>
                                <Text style={s.label}>Bank Name</Text>
                                <Text style={s.val}>{data.bankName}</Text>
                            </View>
                        </View>
                        <View style={s.row}>
                            <View>
                                <Text style={s.label}>Account Number</Text>
                                <Text style={s.valLg}>{data.accountNumber}</Text>
                            </View>
                            <TouchableOpacity style={s.copyBtn} onPress={() => copyToClipboard(data.accountNumber, 'Account Number')}>
                                <Icon name="copy-outline" size={20} color={colors.blue} />
                            </TouchableOpacity>
                        </View>
                        <View style={[s.row, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
                            <View>
                                <Text style={s.label}>Account Name</Text>
                                <Text style={s.val}>{data.fullName}</Text>
                            </View>
                        </View>
                    </View>
                ) : null}

                <View style={s.infoBox}>
                    <Icon name="information-circle" size={24} color={colors.blue} />
                    <View style={{ flex: 1 }}>
                        <Text style={s.infoTitle}>Instant Funding</Text>
                        <Text style={s.infoText}>Transfers made to this dedicated account will reflect in your wallet balance immediately.</Text>
                    </View>
                </View>

                <View style={s.shareBox}>
                    <TouchableOpacity style={s.btn} onPress={() => navigation.goBack()}>
                        <Text style={s.btnTxt}>I have made the transfer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 24 : 16,
        paddingBottom: 16,
        backgroundColor: colors.white
    },
    backBtn: { padding: 4, marginRight: 12 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    body: { flex: 1, padding: 16 },
    subText: { fontSize: 14, color: colors.gray, lineHeight: 22, marginBottom: 24 },
    card: { backgroundColor: colors.white, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.blue, marginBottom: 24, elevation: 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.grayLight, paddingBottom: 16, marginBottom: 16 },
    label: { fontSize: 12, color: colors.gray, marginBottom: 4 },
    val: { fontSize: 15, fontWeight: '700', color: colors.text },
    valLg: { fontSize: 28, fontWeight: '800', color: colors.blue },
    copyBtn: { padding: 12, backgroundColor: '#EEF2FF', borderRadius: 8 },
    infoBox: { flexDirection: 'row', backgroundColor: '#EEF2FF', padding: 16, borderRadius: 12, gap: 12 },
    infoTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
    infoText: { fontSize: 12, color: colors.text2, lineHeight: 18 },
    shareBox: { flex: 1, justifyContent: 'flex-end', paddingBottom: 24 },
    btn: { width: '100%', backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' }
});

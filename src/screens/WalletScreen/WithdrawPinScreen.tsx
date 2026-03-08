import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { walletApi } from '../../core/api/wallet.api';

export default function WithdrawPinScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { data } = route.params;

    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleWithdraw = async () => {
        if (pin.length < 4) {
            Alert.alert('PIN Required', 'Please enter your 4-digit security PIN');
            return;
        }

        setLoading(true);
        try {
            // 1. Validate PIN
            const isPinValid = await walletApi.validatePin(pin);
            if (!isPinValid) {
                throw new Error('Invalid Security PIN');
            }

            // 2. Perform withdrawal
            const res = await walletApi.withdraw({ ...data, pin });

            if (res && res.isSuccessful === false) {
                Alert.alert('Withdrawal Failed', res.message || 'The transaction could not be processed.');
                setPin('');
                return;
            }

            navigation.navigate('WithdrawSuccess', { amount: data.amount });
        } catch (e: any) {
            Alert.alert('Withdrawal Failed', e.message || 'An error occurred during withdrawal');
            setPin('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Enter PIN</Text>
            </View>

            <View style={s.body}>
                <View style={s.infoBox}>
                    <Text style={s.infoLabel}>Withdrawal Amount</Text>
                    <Text style={s.infoValue}>₦{data.amount.toLocaleString()}</Text>
                    <Text style={s.infoSub}>To: {data.accountName}</Text>
                </View>

                <Text style={s.pinLabel}>Enter Security PIN</Text>
                <Text style={s.pinSub}>Enter your 4-digit transaction pin to authorize this withdrawal.</Text>

                <TextInput
                    style={s.pinInput}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={4}
                    placeholder="****"
                    value={pin}
                    onChangeText={setPin}
                    autoFocus
                />

                <TouchableOpacity
                    style={[s.btn, pin.length < 4 && s.btnDisabled]}
                    onPress={handleWithdraw}
                    disabled={loading || pin.length < 4}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Withdraw Funds</Text>}
                </TouchableOpacity>
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
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 16,
        paddingBottom: 16,
        backgroundColor: colors.white
    },
    backBtn: { padding: 4, marginRight: 12 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    body: { flex: 1, padding: 24, alignItems: 'center' },
    infoBox: { width: '100%', backgroundColor: colors.white, padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 32, elevation: 1 },
    infoLabel: { fontSize: 12, color: colors.gray, marginBottom: 8 },
    infoValue: { fontSize: 28, fontWeight: '800', color: colors.blue, marginBottom: 4 },
    infoSub: { fontSize: 13, color: colors.text2 },
    pinLabel: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
    pinSub: { fontSize: 14, color: colors.gray, textAlign: 'center', marginBottom: 32, paddingHorizontal: 20 },
    pinInput: { width: '80%', backgroundColor: colors.white, borderBottomWidth: 2, borderBottomColor: colors.blue, padding: 12, fontSize: 32, textAlign: 'center', letterSpacing: 10, marginBottom: 40, color: colors.text },
    btn: { width: '100%', backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    btnDisabled: { backgroundColor: '#A5B4FC' },
    btnTxt: { color: "#fff", fontSize: 16, fontWeight: '700' }
});

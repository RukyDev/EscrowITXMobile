import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { EscrowStackParamList } from '../../navigation/types';
import { escrowApi } from '../../core/api/escrow.api';
import { Platform, StatusBar } from 'react-native';

type Nav = NativeStackNavigationProp<EscrowStackParamList, 'PinConfirm'>;

export default function PinConfirmScreen() {
    const navigation = useNavigation<Nav>();
    const route = useRoute<any>();
    const { escrowId, isBuy } = route.params;

    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleKeyPress = (num: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleConfirm = async () => {
        if (pin.length < 6) {
            Alert.alert('PIN Required', 'Please enter your 6-digit security PIN');
            return;
        }

        setLoading(true);
        try {
            const res = await escrowApi.release(escrowId, parseInt(pin));
            if (res.isSuccssful) {
                navigation.navigate('EscrowSuccess');
            } else {
                Alert.alert('Failed', res.message || 'The transaction could not be released.');
                setPin('');
            }
        } catch (e: any) {
            Alert.alert('Confirmation Failed', e.message || 'Incorrect PIN or action not allowed.');
            setPin('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Security PIN</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={s.content}>
                <Icon name="lock-closed" size={48} color={colors.blue} style={{ marginBottom: 24 }} />
                <Text style={s.title}>Enter Your PIN</Text>
                <Text style={s.sub}>Please enter your 6-digit security PIN to confirm the release of funds.</Text>

                <View style={s.dotsRow}>
                    {Array(6).fill(0).map((_, i) => (
                        <View key={i} style={[s.dot, pin.length > i && s.dotFilled]} />
                    ))}
                </View>

                {loading && <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 20 }} />}
            </View>

            <View style={s.keypad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <TouchableOpacity key={num} style={s.keyPrimary} onPress={() => handleKeyPress(num.toString())}>
                        <Text style={s.keyTxt}>{num}</Text>
                    </TouchableOpacity>
                ))}
                {/* Empty placeholder */}
                <View style={s.keyPrimary} />
                <TouchableOpacity style={s.keyPrimary} onPress={() => handleKeyPress('0')}>
                    <Text style={s.keyTxt}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.keyIcon} onPress={handleDelete}>
                    <Icon name="backspace-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={s.footer}>
                <TouchableOpacity
                    style={[s.btn, pin.length < 6 && s.btnDisabled]}
                    onPress={handleConfirm}
                    disabled={pin.length < 6 || loading}
                >
                    <Text style={s.btnTxt}>Confirm Transaction</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.white },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 16,
        paddingBottom: 16,
        justifyContent: 'space-between'
    },
    backBtn: { padding: 4, width: 40 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    content: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 32 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 },
    sub: { fontSize: 14, color: colors.gray, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
    dotsRow: { flexDirection: 'row', gap: 12 },
    dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.grayLight },
    dotFilled: { backgroundColor: colors.blue },
    keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 30, marginBottom: 20 },
    keyPrimary: { width: '30%', height: 70, justifyContent: 'center', alignItems: 'center', margin: '1.5%' },
    keyIcon: { width: '30%', height: 70, justifyContent: 'center', alignItems: 'center', margin: '1.5%' },
    keyTxt: { fontSize: 24, fontWeight: '700', color: colors.text },
    footer: { padding: 24 },
    btn: { width: '100%', backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    btnDisabled: { backgroundColor: '#A5B4FC' },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' }
});

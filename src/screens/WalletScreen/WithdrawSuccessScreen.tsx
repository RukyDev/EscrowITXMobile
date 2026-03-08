import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme/colors';

export default function WithdrawSuccessScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { amount } = route.params || { amount: 0 };

    return (
        <SafeAreaView style={s.root}>
            <View style={s.container}>
                <View style={s.successCircle}>
                    <Icon name="check" size={60} color={colors.success} />
                </View>

                <Text style={s.title}>Withdrawal Initiated!</Text>
                <Text style={s.sub}>Your withdrawal request of ₦{amount.toLocaleString()} has been received and is being processed.</Text>

                <View style={s.card}>
                    <View style={s.row}>
                        <Text style={s.label}>Status</Text>
                        <View style={s.badge}><Text style={s.badgeTxt}>Processing</Text></View>
                    </View>
                    <View style={s.divider} />
                    <View style={s.row}>
                        <Text style={s.label}>Amount</Text>
                        <Text style={s.value}>₦{amount.toLocaleString()}</Text>
                    </View>
                    <View style={s.divider} />
                    <View style={s.row}>
                        <Text style={s.label}>Estimated Delivery</Text>
                        <Text style={s.value}>Within 5-10 mins</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={s.btn}
                    onPress={() => navigation.navigate('WalletHome')}
                >
                    <Text style={s.btnTxt}>Back to Wallet</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={s.outlineBtn}
                    onPress={() => navigation.navigate('Home', { screen: 'Dashboard' })}
                >
                    <Text style={s.outlineBtnTxt}>Go to Dashboard</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 12 },
    sub: { fontSize: 15, color: colors.gray, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 },
    card: { width: '100%', backgroundColor: colors.white, borderRadius: 16, padding: 20, marginBottom: 40, elevation: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    divider: { height: 1, backgroundColor: '#F3F4F6' },
    label: { fontSize: 14, color: colors.gray },
    value: { fontSize: 14, fontWeight: '700', color: colors.text },
    badge: { backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    badgeTxt: { fontSize: 11, fontWeight: '600', color: colors.warn },
    btn: { width: '100%', backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
    btnTxt: { color: "#fff", fontSize: 16, fontWeight: '700' },
    outlineBtn: { width: '100%', paddingVertical: 16, alignItems: 'center' },
    outlineBtnTxt: { color: colors.blue, fontSize: 15, fontWeight: '600' }
});

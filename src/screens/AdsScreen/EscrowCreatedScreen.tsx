import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { MarketStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'EscrowCreated'>;
type RouteType = any;

export default function EscrowCreatedScreen() {
    const navigation = useNavigation<Nav>();
    const route = useRoute<RouteType>();
    const { orderId, amountLocked, gbpAmount } = route.params;

    return (
        <SafeAreaView style={s.root}>
            <View style={s.container}>
                <View style={s.iconWrap}>
                    <Icon name="shield-checkmark" size={60} color={colors.blue} />
                </View>
                <Text style={s.title}>Escrow Order Created</Text>
                <Text style={s.sub}>Your transaction has been securely initiated.</Text>

                <View style={s.card}>
                    <View style={s.row}>
                        <Text style={s.lbl}>Order ID</Text>
                        <Text style={s.val}>{orderId}</Text>
                    </View>
                    <View style={s.row}>
                        <Text style={s.lbl}>GBP Amount</Text>
                        <Text style={s.val}>£{gbpAmount.toLocaleString()}</Text>
                    </View>
                    <View style={[s.row, { borderBottomWidth: 0, marginBottom: 0 }]}>
                        <Text style={s.lbl}>Amount Locked</Text>
                        <Text style={s.val}>₦{amountLocked.toLocaleString()}</Text>
                    </View>
                </View>

                <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Marketplace')}>
                    <Text style={s.btnTxt}>Back to Marketplace</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    iconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' },
    sub: { fontSize: 13, color: colors.gray, textAlign: 'center', marginBottom: 32 },
    card: { width: '100%', backgroundColor: colors.white, padding: 20, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: colors.grayLight },
    row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.grayLight, paddingBottom: 12, marginBottom: 12 },
    lbl: { fontSize: 13, color: colors.text2 },
    val: { fontSize: 14, fontWeight: '700', color: colors.text },
    btn: { width: '100%', backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' }
});

import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { colors } from '../../theme/colors';
import ReceiptCard, { ReceiptData } from '../../components/ReceiptCard';

export default function WithdrawSuccessScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { amount, receipt } = route.params || { amount: 0, receipt: null };

    const viewShotRef = useRef<ViewShot>(null);
    const [sharing, setSharing] = useState(false);

    const receiptData: ReceiptData | null = receipt || null;

    const handleShare = async () => {
        if (!viewShotRef.current) return;
        setSharing(true);
        try {
            const uri = await (viewShotRef.current as any).capture();
            await Share.open({
                url: uri.startsWith('file://') ? uri : `file://${uri}`,
                title: 'EscrowITX Withdrawal Receipt',
                message: 'My withdrawal receipt from EscrowITX',
                failOnCancel: false,
            });
        } catch (e: any) {
            if (e?.message && !/user did not share/i.test(e.message)) {
                Alert.alert('Unable to share', 'Could not generate the receipt. Please try again.');
            }
        } finally {
            setSharing(false);
        }
    };

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

                {receiptData && (
                    <TouchableOpacity style={s.shareBtn} onPress={handleShare} disabled={sharing}>
                        {sharing ? (
                            <ActivityIndicator color={colors.blue} />
                        ) : (
                            <>
                                <Icon name="share-variant" size={18} color={colors.blue} />
                                <Text style={s.shareBtnTxt}>Share Receipt</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

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

            {/* Off-screen receipt, rendered only so ViewShot can capture it on demand when "Share Receipt" is pressed */}
            {receiptData && (
                <View style={s.offscreen} pointerEvents="none">
                    <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.95 }}>
                        <ReceiptCard data={receiptData} />
                    </ViewShot>
                </View>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 12 },
    sub: { fontSize: 15, color: colors.gray, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 },
    card: { width: '100%', backgroundColor: colors.white, borderRadius: 16, padding: 20, marginBottom: 24, elevation: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    divider: { height: 1, backgroundColor: '#F3F4F6' },
    label: { fontSize: 14, color: colors.gray },
    value: { fontSize: 14, fontWeight: '700', color: colors.text },
    badge: { backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    badgeTxt: { fontSize: 11, fontWeight: '600', color: colors.warn },
    shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', borderWidth: 1.5, borderColor: colors.blue, paddingVertical: 14, borderRadius: 12, marginBottom: 20 },
    shareBtnTxt: { color: colors.blue, fontSize: 15, fontWeight: '700' },
    btn: { width: '100%', backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
    btnTxt: { color: "#fff", fontSize: 16, fontWeight: '700' },
    outlineBtn: { width: '100%', paddingVertical: 16, alignItems: 'center' },
    outlineBtnTxt: { color: colors.blue, fontSize: 15, fontWeight: '600' },
    offscreen: { position: 'absolute', top: -10000, left: 0, width: 360 },
});

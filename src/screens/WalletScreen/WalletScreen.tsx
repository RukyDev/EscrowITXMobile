import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { WalletStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/auth.store';
import { useWalletStore } from '../../store/wallet.store';
import { walletApi } from '../../core/api/wallet.api';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'WalletMain'>;

export default function WalletScreen() {
    const navigation = useNavigation<Nav>();
    const { balance, fetchBalance, activities, fetchActivities, isLoading } = useWalletStore();
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        fetchBalance();
        fetchActivities();
    }, []);

    const [showAddPounds, setShowAddPounds] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [poundsForm, setPoundsForm] = useState({
        accountName: '',
        accountNumber: '',
        bankName: '',
        sortCode: '',
        iban: '',
    });

    const handleAddPounds = async () => {
        setIsAdding(true);
        try {
            await walletApi.addBeneficiary(poundsForm);
            Alert.alert('Success', 'Pounds wallet added successfully!');
            setShowAddPounds(false);
            fetchBalance();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to add wallet');
        } finally {
            setIsAdding(false);
        }
    };

    const ngnWallet = balance.find(w => w.currency === 'NGN');

    return (
        <SafeAreaView style={s.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient colors={['#0D1B40', '#1A3FD8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
                <View style={s.topRow}>
                    <Text style={s.headerTitle}>Wallet</Text>
                </View>

                {/* Balance Card - Matching Dashboard */}
                <View style={s.balCard}>
                    <View style={s.balHeader}>
                        <Text style={s.balLabel}>WALLET OVERVIEW</Text>
                    </View>

                    <View style={s.mainBalRow}>
                        <View style={s.balItem}>
                            <Text style={s.balSubLabel}>Available Balance ₦</Text>
                            {isLoading ? <ActivityIndicator color="#fff" size="small" /> : (
                                <Text style={s.balValue}>
                                    ₦{(ngnWallet?.availableBalance || 0).toLocaleString()}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={s.balStatsRow}>
                        <View style={s.balStatItem}>
                            <Text style={s.balStatLabel}>Escrow Balance ₦</Text>
                            <Text style={s.balStatValue}>₦{(ngnWallet?.escrowBalance || 0).toLocaleString()}</Text>
                        </View>
                        <View style={s.balDivider} />
                        <View style={s.balStatItem}>
                            <Text style={s.balStatLabel}>Ledger Balance ₦</Text>
                            <Text style={s.balStatValue}>₦{(ngnWallet?.ledgerBalance || 0).toLocaleString()}</Text>
                        </View>
                    </View>

                    <View style={s.balActions}>
                        <TouchableOpacity style={s.balBtn} onPress={() => navigation.navigate('Deposit')}>
                            <Icon name="arrow-down" size={20} color={colors.white} />
                            <Text style={s.balBtnTxt}>Deposit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.balBtn} onPress={() => navigation.navigate('Withdraw')}>
                            <Icon name="arrow-up" size={20} color={colors.white} />
                            <Text style={s.balBtnTxt}>Withdraw</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.addWalletBtn} onPress={() => setShowAddPounds(true)}>
                            <Icon name="plus" size={20} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <Modal visible={showAddPounds} animationType="slide" transparent>
                <View style={s.mOverlay}>
                    <View style={s.mContainer}>
                        <View style={s.mHeader}>
                            <Text style={s.mTitle}>Add Pounds Wallet</Text>
                            <TouchableOpacity onPress={() => setShowAddPounds(false)}>
                                <Icon name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ flex: 1 }}>
                            <Text style={s.mLabel}>Account Name *</Text>
                            <TextInput style={s.mInput} value={poundsForm.accountName} onChangeText={t => setPoundsForm({ ...poundsForm, accountName: t })} placeholder="e.g. John Doe" />

                            <Text style={s.mLabel}>Account Number *</Text>
                            <TextInput style={s.mInput} value={poundsForm.accountNumber} onChangeText={t => setPoundsForm({ ...poundsForm, accountNumber: t })} placeholder="Enter Account Number" keyboardType="numeric" />

                            <Text style={s.mLabel}>Bank Name *</Text>
                            <TextInput style={s.mInput} value={poundsForm.bankName} onChangeText={t => setPoundsForm({ ...poundsForm, bankName: t })} placeholder="e.g. Barclays Bank" />

                            <Text style={s.mLabel}>Sort Code *</Text>
                            <TextInput style={s.mInput} value={poundsForm.sortCode} onChangeText={t => setPoundsForm({ ...poundsForm, sortCode: t })} placeholder="e.g. 12-34-56" />

                            <Text style={s.mLabel}>IBAN (Optional)</Text>
                            <TextInput style={s.mInput} value={poundsForm.iban} onChangeText={t => setPoundsForm({ ...poundsForm, iban: t })} placeholder="GB..." />

                            <TouchableOpacity
                                style={[s.mBtn, (!poundsForm.accountName || !poundsForm.accountNumber || !poundsForm.bankName || !poundsForm.sortCode) && { opacity: 0.5 }]}
                                disabled={isAdding || !poundsForm.accountName || !poundsForm.accountNumber || !poundsForm.bankName || !poundsForm.sortCode}
                                onPress={handleAddPounds}
                            >
                                {isAdding ? <ActivityIndicator color="#fff" /> : <Text style={s.mBtnTxt}>Create Wallet</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
                <Text style={[s.sectionTitle, { marginTop: 12 }]}>Recent Activity</Text>

                {activities.length > 0 ? activities.map((act, i) => (
                    <View key={i} style={s.activityRow}>
                        <View style={[s.actIcon, act.transactionType?.toLowerCase().includes('withdraw') && { backgroundColor: '#FEF2F2' }]}>
                            <Icon
                                name={act.transactionType?.toLowerCase().includes('withdraw') ? "arrow-up" : "arrow-down"}
                                size={16}
                                color={act.transactionType?.toLowerCase().includes('withdraw') ? colors.danger : colors.blue}
                            />
                        </View>
                        <View style={s.actInfo}>
                            <Text style={s.actTitle}>{act.transactionType || 'Transaction'}</Text>
                            <Text style={s.actTime}>{new Date(act.transactionDate).toLocaleDateString()} {new Date(act.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                        <Text style={[s.actAmnt, { color: act.transactionType?.toLowerCase().includes('withdraw') ? colors.danger : colors.blue }]}>
                            {act.transactionType?.toLowerCase().includes('withdraw') ? '-' : '+'}₦{act.amount.toLocaleString()}
                        </Text>
                    </View>
                )) : (
                    <Text style={{ textAlign: 'center', color: colors.gray, marginTop: 20 }}>No recent activity</Text>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 24 : 16,
        paddingBottom: 40,
    },
    topRow: { marginBottom: 16 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: colors.white },
    balCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    balHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    balLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
    mainBalRow: { marginBottom: 20 },
    balItem: { gap: 4 },
    balSubLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '500' },
    balValue: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    balStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
    balStatItem: { flex: 1, gap: 4 },
    balStatLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600' },
    balStatValue: { color: '#fff', fontSize: 15, fontWeight: '700' },
    balDivider: { width: 1, height: 25, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 15 },
    balActions: { flexDirection: 'row', gap: 10 },
    balBtn: { flex: 1, flexDirection: 'row', paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', gap: 6 },
    balBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
    body: { flex: 1, padding: 16, marginTop: -20, backgroundColor: colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
    activityRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 16, borderRadius: 12, marginBottom: 8, elevation: 1 },
    actIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    actInfo: { flex: 1 },
    actTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2 },
    actTime: { fontSize: 11, color: colors.gray },
    actAmnt: { fontSize: 14, fontWeight: '700', color: colors.text },
    addWalletBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    mOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    mContainer: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 24, height: '70%' },
    mHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    mTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
    mLabel: { fontSize: 13, fontWeight: '700', color: colors.text2, marginTop: 16, marginBottom: 8 },
    mInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14, fontSize: 15, color: colors.text },
    mBtn: { backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 30, elevation: 2 },
    mBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

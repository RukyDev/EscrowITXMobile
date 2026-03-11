import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { securityApi } from '../../core/api/security.api';

export default function SecurityScreen() {
    const navigation = useNavigation();
    const [hasPin, setHasPin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [modalMode, setModalMode] = useState<'setup' | 'change' | 'reset' | null>(null);
    const [form, setForm] = useState({ oldPin: '', newPin: '', confirmPin: '', token: '' });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        checkPinStatus();
    }, []);

    const checkPinStatus = async () => {
        try {
            const res = await securityApi.hasPin();
            setHasPin(res);
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!form.newPin || !form.confirmPin) {
            Alert.alert('Error', 'Please fill all pin fields');
            return;
        }
        if (form.newPin !== form.confirmPin) {
            Alert.alert('Error', 'Pins do not match');
            return;
        }

        setActionLoading(true);
        try {
            if (modalMode === 'setup') {
                await securityApi.setUpPin({ newPin: form.newPin, confirmPin: form.confirmPin });
            } else if (modalMode === 'change') {
                await securityApi.changePin({ oldPin: form.oldPin, newPin: form.newPin, confirmPin: form.confirmPin });
            } else if (modalMode === 'reset') {
                await securityApi.resetPin({ token: form.token, newPin: form.newPin, confirmPin: form.confirmPin });
            }
            Alert.alert('Success', `Pin ${modalMode === 'reset' ? 'reset' : 'saved'} successfully`);
            setModalMode(null);
            setForm({ oldPin: '', newPin: '', confirmPin: '', token: '' });
            checkPinStatus();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleInitiateReset = async () => {
        setLoading(true);
        try {
            await securityApi.initiateReset();
            Alert.alert('Success', 'Reset token has been sent to your email.');
            setModalMode('reset');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to initiate reset');
        } finally {
            setLoading(false);
        }
    };

    if (loading && hasPin === null) {
        return (
            <SafeAreaView style={s.root}>
                <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 100 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Security</Text>
            </View>

            <ScrollView style={s.body}>
                <Text style={s.subHeader}>Manage your PIN, password and account protection.</Text>

                <View style={s.card}>
                    <View style={s.cardHeader}>
                        <View style={s.iconBox}>
                            <Icon name="shield-outline" size={20} color={colors.blue} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.cardTitle}>Withdrawal PIN</Text>
                            <Text style={s.cardSub}>Required for withdrawals and sensitive actions.</Text>
                        </View>
                        {hasPin && <View style={s.activeBadge}><Text style={s.activeTxt}>Active</Text></View>}
                    </View>

                    <View style={s.actions}>
                        {!hasPin ? (
                            <TouchableOpacity style={s.mainBtn} onPress={() => setModalMode('setup')}>
                                <Text style={s.mainBtnTxt}>Set Up PIN</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={s.row}>
                                <TouchableOpacity style={s.outlineBtn} onPress={() => setModalMode('change')}>
                                    <Text style={s.outlineBtnTxt}>Change PIN</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.outlineBtn} onPress={handleInitiateReset}>
                                    <Text style={[s.outlineBtnTxt, { color: colors.danger }]}>Reset PIN</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Password Placeholder */}
                <View style={s.card}>
                    <View style={s.cardHeader}>
                        <View style={[s.iconBox, { backgroundColor: '#F0FDF4' }]}>
                            <Icon name="key-outline" size={20} color={colors.success} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.cardTitle}>Password</Text>
                            <Text style={s.cardSub}>Keep your account secure with a strong password.</Text>
                        </View>
                        <View style={s.availBadge}><Text style={s.availTxt}>Available</Text></View>
                    </View>
                    <TouchableOpacity style={s.mainBtn} onPress={() => navigation.navigate('ChangePassword' as any)}>
                        <Text style={s.mainBtnTxt}>Update Password</Text>
                    </TouchableOpacity>
                </View>

                {/* 2FA Placeholder */}
                <View style={s.card}>
                    <View style={s.cardHeader}>
                        <View style={[s.iconBox, { backgroundColor: '#FFFBEB' }]}>
                            <Icon name="smartphone-outline" size={20} color={colors.warn} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.cardTitle}>Two-factor authentication</Text>
                            <Text style={s.cardSub}>Add an extra layer of protection for login.</Text>
                        </View>
                        <View style={s.soonBadge}><Text style={s.soonTxt}>Coming soon</Text></View>
                    </View>
                    <TouchableOpacity style={[s.mainBtn, { opacity: 0.5 }]} disabled>
                        <Text style={s.mainBtnTxt}>Enable 2FA</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={modalMode !== null} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>
                                {modalMode === 'setup' ? 'Set Up PIN' : modalMode === 'change' ? 'Change PIN' : 'Reset PIN'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalMode(null)}>
                                <Icon name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {modalMode === 'change' && (
                            <TextInput
                                style={s.input}
                                placeholder="Old PIN"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry
                                keyboardType="numeric"
                                maxLength={4}
                                value={form.oldPin}
                                onChangeText={t => setForm({ ...form, oldPin: t })}
                            />
                        )}

                        {modalMode === 'reset' && (
                            <TextInput
                                style={s.input}
                                placeholder="Enter Token (Sent to Email)"
                                placeholderTextColor="#9CA3AF"
                                value={form.token}
                                onChangeText={t => setForm({ ...form, token: t })}
                            />
                        )}

                        <TextInput
                            style={s.input}
                            placeholder="New PIN (4 digits)"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                            keyboardType="numeric"
                            maxLength={4}
                            value={form.newPin}
                            onChangeText={t => setForm({ ...form, newPin: t })}
                        />

                        <TextInput
                            style={s.input}
                            placeholder="Confirm New PIN"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                            keyboardType="numeric"
                            maxLength={4}
                            value={form.confirmPin}
                            onChangeText={t => setForm({ ...form, confirmPin: t })}
                        />

                        <TouchableOpacity style={s.submitBtn} onPress={handleAction} disabled={actionLoading}>
                            {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnTxt}>Submit</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    body: { flex: 1, padding: 16 },
    subHeader: { fontSize: 13, color: colors.text2, marginBottom: 20 },
    card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
    cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
    cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
    cardSub: { fontSize: 12, color: colors.gray, lineHeight: 18 },
    activeBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
    activeTxt: { fontSize: 10, color: colors.success, fontWeight: '700' },
    availBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
    availTxt: { fontSize: 10, color: colors.text2, fontWeight: '600' },
    soonBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
    soonTxt: { fontSize: 10, color: colors.gray, fontWeight: '600' },
    actions: { marginTop: 0 },
    row: { flexDirection: 'row', gap: 10 },
    mainBtn: { backgroundColor: colors.blue, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    mainBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
    outlineBtn: { flex: 1, borderWidth: 1, borderColor: colors.grayLight, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    outlineBtnTxt: { color: colors.text, fontSize: 14, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: colors.white, borderRadius: 20, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 12, padding: 16, fontSize: 15, color: colors.text, marginBottom: 16 },
    submitBtn: { backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    submitBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

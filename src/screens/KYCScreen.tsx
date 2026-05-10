import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, ActivityIndicator, Alert, Platform, SafeAreaView,
    StatusBar, Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { colors } from '../theme/colors';
import { documentApi } from '../core/api/document.api';
import { useAuthStore } from '../store/auth.store';
import { KYCStatus } from '../core/api/auth.api';

import LinearGradient from 'react-native-linear-gradient';

export default function KYCScreen() {
    const { user, bootstrap, logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState(0);
    const [saving, setSaving] = useState(false);
    const [startingKyc, setStartingKyc] = useState(false);

    // Tab 1: Personal Info
    const [nationality, setNationality] = useState(user?.nationality || '');
    const [dob, setDob] = useState(user?.dateOfBirth ? moment(user.dateOfBirth).format('YYYY-MM-DD') : '');
    const [address, setAddress] = useState(user?.residentialAddress || '');
    const [gender, setGender] = useState<number | null>(user?.gender || null);
    const [occupation, setOccupation] = useState<number | null>(user?.occupation || null);

    // Prembly KYC status (separate from document upload status)
    const [kycStatus, setKycStatus] = useState<'Pending' | 'Verified' | 'Rejected' | null>(null);

    const kycAccountStatus = user?.kycStatus || KYCStatus.Unverified;
    const isVerifiedByAccount = kycAccountStatus === KYCStatus.Verified;

    const userName = user?.name || user?.userName || 'User';
    const initials = userName.slice(0, 2).toUpperCase();

    // Max date of birth: must be at least 16 years old
    const maxDob = moment().subtract(16, 'years').format('YYYY-MM-DD');

    useEffect(() => {
        loadKycStatus();
    }, []);

    const loadKycStatus = async () => {
        try {
            const status = await documentApi.getUserKycStatus();
            setKycStatus(status);
        } catch {
            setKycStatus(null);
        }
    };

    const canProceedTab1 =
        nationality.trim() !== '' &&
        dob !== '' &&
        address.trim() !== '' &&
        gender !== null &&
        occupation !== null;

    /** Step 1: Save profile. Step 2: Call Prembly, open URL in browser. */
    const handleContinue = async () => {
        if (!canProceedTab1) {
            Alert.alert('Incomplete', 'Please fill in all personal info fields.');
            return;
        }

        setSaving(true);
        try {
            // Save profile to backend first
            await documentApi.updateUserProfile({
                nationality: nationality.trim(),
                dateOfBirth: moment(dob, 'YYYY-MM-DD').toISOString(),
                residentialAddress: address.trim(),
                gender: gender!,
                occupation: occupation!,
            });
        } catch {
            // Non-fatal: proceed even if profile save fails
        } finally {
            setSaving(false);
        }

        // Move to verification tab
        setActiveTab(1);
    };

    /** Initiate Prembly KYC session and open the URL in the device browser */
    const startKyc = async () => {
        if (!canProceedTab1) {
            Alert.alert('Incomplete', 'Please complete Personal Info first.');
            return;
        }

        setStartingKyc(true);
        try {
            const payload = await documentApi.initiateKycSession();
            const sessionId = payload.session_id;
            const url = `https://dv7wajvnnyl16.cloudfront.net/?session=${sessionId}`;

            await Linking.openURL(url);
            // Immediately reflect pending state
            setKycStatus('Pending');
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to start verification');
        } finally {
            setStartingKyc(false);
        }
    };

    // ─── Render Tab 1 ──────────────────────────────────────────────────────────
    const renderTab1 = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nationality *</Text>
            <TextInput
                style={styles.input}
                value={nationality}
                onChangeText={setNationality}
                placeholder="e.g. Nigerian"
                placeholderTextColor={colors.gray}
            />

            <Text style={styles.label}>Date of Birth (YYYY-MM-DD) *</Text>
            <TextInput
                style={styles.input}
                value={dob}
                onChangeText={setDob}
                placeholder={`e.g. ${maxDob}`}
                keyboardType="numeric"
                placeholderTextColor={colors.gray}
                maxLength={10}
            />

            <Text style={styles.label}>Residential Address *</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Full Address"
                multiline
                placeholderTextColor={colors.gray}
            />

            <Text style={styles.label}>Gender *</Text>
            <View style={styles.pickerRow}>
                {[{ l: 'Male', v: 1 }, { l: 'Female', v: 2 }, { l: 'Others', v: 3 }].map(g => (
                    <TouchableOpacity
                        key={g.v}
                        style={[styles.chip, gender === g.v && styles.chipActive]}
                        onPress={() => setGender(g.v)}
                    >
                        <Text style={[styles.chipTxt, gender === g.v && styles.chipTxtActive]}>{g.l}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>Occupation *</Text>
            <View style={styles.pickerRow}>
                {[{ l: 'Formal', v: 1 }, { l: 'Informal', v: 2 }].map(o => (
                    <TouchableOpacity
                        key={o.v}
                        style={[styles.chip, occupation === o.v && styles.chipActive]}
                        onPress={() => setOccupation(o.v)}
                    >
                        <Text style={[styles.chipTxt, occupation === o.v && styles.chipTxtActive]}>{o.l}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.hintText}>
                Click "Continue" below to save your info and proceed to identity verification.
            </Text>
        </ScrollView>
    );

    // ─── Render Tab 2 ──────────────────────────────────────────────────────────
    const renderTab2 = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Identity Verification</Text>
            <Text style={styles.verifyDesc}>
                Complete your identity verification.
            </Text>

            {/* Status banners */}
            {kycStatus === 'Pending' && (
                <View style={[styles.statusBox, styles.statusPending]}>
                    <Icon name="clock-outline" size={20} color="#92400E" style={{ marginBottom: 6 }} />
                    <Text style={[styles.statusTxt, { color: '#92400E' }]}>
                        Verification in progress. Please complete the process in your browser.
                    </Text>
                </View>
            )}

            {kycStatus === 'Verified' || isVerifiedByAccount ? (
                <View style={[styles.statusBox, styles.statusSuccess]}>
                    <Icon name="check-circle-outline" size={20} color={colors.success} style={{ marginBottom: 6 }} />
                    <Text style={[styles.statusTxt, { color: colors.success }]}>
                        Your identity has been verified successfully. You can now trade.
                    </Text>
                </View>
            ) : null}

            {kycStatus === 'Rejected' && (
                <View style={[styles.statusBox, styles.statusDanger]}>
                    <Icon name="alert-circle-outline" size={20} color={colors.danger} style={{ marginBottom: 6 }} />
                    <Text style={[styles.statusTxt, { color: colors.danger }]}>
                        Verification failed. Please retry.
                    </Text>
                </View>
            )}

            {/* Start / Retry button */}
            {kycStatus !== 'Verified' && !isVerifiedByAccount && (
                <TouchableOpacity
                    style={[styles.kycBtn, startingKyc && styles.btnDisabled]}
                    onPress={startKyc}
                    disabled={startingKyc}
                >
                    {startingKyc ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Icon name="shield-check-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.kycBtnTxt}>
                                {kycStatus === 'Rejected' ? 'Retry Verification' : 'Start Verification'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            )}

            <Text style={styles.verifyNote}>
                A secure browser window will open where you can complete verification process.
            </Text>
        </ScrollView>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#0D1B40' }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient colors={['#0D1B40', '#1A3FD8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bgGradient}>
                <SafeAreaView style={{ flex: 1 }}>
                    {/* Header */}
                    <View style={styles.mockHeader}>
                        <View style={styles.userInfo}>
                            <View style={styles.avatar}><Text style={styles.avatarTxt}>{initials}</Text></View>
                            <View>
                                <Text style={styles.greeting}>Welcome back 👋</Text>
                                <Text style={styles.userName}>{userName}</Text>
                            </View>
                        </View>
                        <View style={styles.headerIcons}>
                            <TouchableOpacity style={styles.bellBtn}>
                                <Icon name="bell-outline" size={20} color="#fff" />
                                <View style={styles.bellDot} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={logout} style={styles.logoutTopBtn}>
                                <Icon name="logout" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Main Content Card */}
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Setup Profile</Text>
                            <Text style={styles.sub}>Complete your profile to start trading</Text>
                        </View>

                        {/* Tabs */}
                        <View style={styles.tabs}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 0 && styles.tabActive]}
                                onPress={() => setActiveTab(0)}
                            >
                                <Text style={[styles.tabTxt, activeTab === 0 && styles.tabTxtActive]}>Personal Info</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 1 && styles.tabActive]}
                                onPress={() => {
                                    if (!canProceedTab1) {
                                        Alert.alert('Notice', 'Complete Personal Info first');
                                    } else {
                                        setActiveTab(1);
                                    }
                                }}
                            >
                                <Text style={[styles.tabTxt, activeTab === 1 && styles.tabTxtActive]}>Verification</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1 }}>
                            {activeTab === 0 ? renderTab1() : renderTab2()}
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            {activeTab === 0 ? (
                                <TouchableOpacity
                                    style={[styles.mainBtn, (!canProceedTab1 || saving) && styles.btnDisabled]}
                                    onPress={handleContinue}
                                    disabled={!canProceedTab1 || saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.mainBtnTxt}>Continue</Text>
                                    )}
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.footerRow}>
                                    <TouchableOpacity style={styles.backBtn} onPress={() => setActiveTab(0)}>
                                        <Text style={styles.backBtnTxt}>Back</Text>
                                    </TouchableOpacity>
                                    {/* Refresh KYC status after user returns from browser */}
                                    <TouchableOpacity style={[styles.mainBtn, { flex: 2 }]} onPress={loadKycStatus}>
                                        <Icon name="refresh" size={16} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={styles.mainBtnTxt}>Refresh Status</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    bgGradient: { flex: 1 },
    mockHeader: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.accent,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarTxt: { color: '#0D1B40', fontWeight: '700', fontSize: 14 },
    greeting: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
    userName: { color: '#fff', fontWeight: '700', fontSize: 14 },
    headerIcons: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    bellBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center', alignItems: 'center',
    },
    bellDot: {
        position: 'absolute', top: 8, right: 8,
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: colors.accent2,
        borderWidth: 1.5, borderColor: '#1A3FD8',
    },
    logoutTopBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center', alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: 24, paddingTop: 30,
    },
    header: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text },
    sub: { fontSize: 13, color: colors.gray, marginTop: 4 },
    tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 20 },
    tab: { paddingVertical: 12, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: colors.blue },
    tabTxt: { fontSize: 14, fontWeight: '600', color: colors.gray },
    tabTxtActive: { color: colors.blue },
    tabContent: { flex: 1 },
    label: { fontSize: 13, fontWeight: '700', color: colors.text2, marginBottom: 8, marginTop: 16 },
    input: {
        backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#eee',
        borderRadius: 12, padding: 14, fontSize: 15, color: colors.text,
    },
    pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#F3F4F6',
    },
    chipActive: { backgroundColor: '#EEF2FF', borderColor: colors.blue },
    chipTxt: { fontSize: 13, color: colors.gray, fontWeight: '600' },
    chipTxtActive: { color: colors.blue },
    hintText: { fontSize: 12, color: colors.gray, marginTop: 20, textAlign: 'right' },

    // Verification tab
    sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 8, marginTop: 4 },
    verifyDesc: { fontSize: 13, color: colors.gray, lineHeight: 20, marginBottom: 16 },
    statusBox: {
        marginTop: 8, marginBottom: 12,
        padding: 16, borderRadius: 16,
        borderWidth: 1, alignItems: 'center',
    },
    statusPending: { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' },
    statusSuccess: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
    statusDanger: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
    statusTxt: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
    kycBtn: {
        flexDirection: 'row',
        backgroundColor: colors.blue,
        paddingVertical: 16, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
        marginTop: 8, elevation: 2,
    },
    kycBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
    verifyNote: {
        fontSize: 12, color: colors.gray,
        textAlign: 'center', marginTop: 16, lineHeight: 18,
    },

    // Footer
    footer: { paddingTop: 20, borderTopWidth: 1, borderTopColor: '#eee' },
    mainBtn: {
        backgroundColor: colors.blue,
        paddingVertical: 16, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'row', elevation: 2,
    },
    mainBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
    btnDisabled: { opacity: 0.5 },
    footerRow: { flexDirection: 'row', gap: 12 },
    backBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#F3F4F6' },
    backBtnTxt: { color: colors.text, fontWeight: '600' },
});

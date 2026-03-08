import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../core/api/axios';
import { ACCOUNT_ENDPOINTS } from '../../core/api/endpoints';
import { colors } from '../../theme/colors';
import { AuthStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'OTP'>;

const OTP_LENGTH = 6;

export default function OtpScreen() {
    const navigation = useNavigation<Nav>();
    const insets = useSafeAreaInsets();
    const route = useRoute<any>();
    const params = route.params as AuthStackParamList['OTP'];
    const { email } = params;

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(58);
    const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleChange = (index: number, val: string) => {
        const cleaned = val.replace(/[^0-9]/g, '').slice(-1);
        const next = [...otp];
        next[index] = cleaned;
        setOtp(next);
        if (cleaned && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (index: number, key: string) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < OTP_LENGTH) { setError('Please enter the full 6-digit code'); return; }
        try {
            setLoading(true); setError(null);
            await apiClient.post(ACCOUNT_ENDPOINTS.verifyEmailCode, { code });
            navigation.navigate('Login');
        } catch (err: any) {
            setError(err.message || 'Invalid code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await apiClient.post(ACCOUNT_ENDPOINTS.resendConfirmation, { email });
            setCountdown(58);
        } catch { /* silent */ }
    };

    return (
        <SafeAreaView style={s.root} edges={['bottom', 'left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <LinearGradient
                    colors={['#0D1B40', '#1A3FD8', '#4361EE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[s.hero, { paddingTop: Math.max(insets.top, 24) }]}
                >
                    <View style={s.circle1} /><View style={s.circle2} />
                    <View style={s.logoRow}>
                        <View style={s.logoIcon}><Icon name="shield-checkmark" color="#0D1B40" size={18} /></View>
                        <Text style={s.logoText}>EscrowITX</Text>
                    </View>
                    <Text style={s.tagline}>EMAIL VERIFICATION</Text>
                    <Text style={s.headline}>Verify Your{'\n'}<Text style={s.accentText}>Email</Text></Text>
                    <Text style={s.subText}>We've sent a 6-digit verification code to {email}.</Text>
                </LinearGradient>

                <View style={s.card}>
                    <Text style={s.cardTitle}>Enter OTP Code</Text>
                    <Text style={s.cardSub}>Check your email for the verification code</Text>

                    <View style={s.otpRow}>
                        {otp.map((digit, i) => (
                            <TextInput
                                key={i}
                                ref={r => { inputRefs.current[i] = r; }}
                                style={[s.otpBox, digit ? s.otpBoxFilled : null]}
                                value={digit}
                                onChangeText={v => handleChange(i, v)}
                                onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(i, key)}
                                keyboardType="number-pad"
                                maxLength={1}
                                textAlign="center"
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {error ? <Text style={s.errText}>{error}</Text> : null}

                    <TouchableOpacity style={s.btn} onPress={handleVerify} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Verify & Continue</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
                        <Text style={s.resendTxt}>
                            Didn't receive code?{' '}
                            <Text style={[s.link, countdown > 0 && { color: colors.gray }]}>
                                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0D1B40' },
    hero: { paddingHorizontal: 24, paddingBottom: 52, overflow: 'hidden' },
    circle1: { position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)' },
    circle2: { position: 'absolute', bottom: -60, left: -20, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(0,212,170,0.1)' },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
    logoIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#00D4AA', justifyContent: 'center', alignItems: 'center' },
    logoText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    tagline: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '500', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
    headline: { color: '#fff', fontSize: 26, fontWeight: '800', lineHeight: 32, marginBottom: 10 },
    accentText: { color: '#00D4AA' },
    subText: { color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 18 },
    card: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, marginTop: -20, minHeight: 360 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 3 },
    cardSub: { fontSize: 12, color: colors.gray, marginBottom: 16 },
    link: { color: colors.blue, fontWeight: '600' },
    otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 20 },
    otpBox: { width: 46, height: 52, borderWidth: 2, borderColor: colors.grayLight, borderRadius: 11, fontSize: 20, fontWeight: '700', color: colors.blue, backgroundColor: '#F9FAFB', textAlign: 'center' },
    otpBoxFilled: { borderColor: colors.blue },
    errText: { color: colors.danger, fontSize: 12, marginBottom: 12, textAlign: 'center' },
    btn: { backgroundColor: colors.blue, borderRadius: 13, paddingVertical: 14, alignItems: 'center', marginBottom: 16, elevation: 4 },
    btnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
    resendTxt: { textAlign: 'center', fontSize: 12, color: colors.gray },
});

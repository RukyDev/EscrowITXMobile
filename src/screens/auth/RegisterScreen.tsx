import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, KeyboardAvoidingView,
    Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../../core/api/auth.api';
import { colors } from '../../theme/colors';
import { AuthStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
    const navigation = useNavigation<Nav>();
    const insets = useSafeAreaInsets();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

    const handleRegister = async () => {
        if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
            setError('Please fill in all fields'); return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match'); return;
        }
        if (!agreed) { setError('Please accept the Terms of Service'); return; }
        try {
            setLoading(true); setError(null);
            await authApi.register({
                firstName: form.firstName,
                surname: form.lastName,
                userName: form.email,
                emailAddress: form.email,
                password: form.password,
                phoneNumber: form.phone,
            });
            navigation.navigate('OTP', { email: form.email });
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.root} edges={['bottom', 'left', 'right']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
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
                        <Text style={s.tagline}>SECURE CURRENCY EXCHANGE</Text>
                        <Text style={s.headline}>Secure Naira to{'\n'}<Text style={s.accentText}>Pound Exchange</Text></Text>
                        <Text style={s.subText}>The safest way to buy and sell British Pounds with Nigerian Naira. Our escrow service guarantees your money reaches its destination.</Text>
                    </LinearGradient>

                    <View style={s.card}>
                        <Text style={s.cardTitle}>Get Started</Text>
                        <Text style={s.cardSub}>Already have an account? <Text style={s.link} onPress={() => navigation.navigate('Login')}>Sign In</Text></Text>

                        <View style={s.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.label}>First Name</Text>
                                <TextInput style={s.input} placeholder="Oluwaseun" placeholderTextColor={colors.gray} value={form.firstName} onChangeText={set('firstName')} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.label}>Last Name</Text>
                                <TextInput style={s.input} placeholder="Adeyemi" placeholderTextColor={colors.gray} value={form.lastName} onChangeText={set('lastName')} />
                            </View>
                        </View>

                        <Text style={s.label}>Email Address</Text>
                        <TextInput style={s.input} placeholder="email@example.com" placeholderTextColor={colors.gray} value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" />

                        <Text style={s.label}>Phone Number</Text>
                        <TextInput style={s.input} placeholder="+234 800 000 0000" placeholderTextColor={colors.gray} value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />

                        <Text style={s.label}>Password</Text>
                        <View style={s.inputWrap}>
                            <TextInput style={[s.input, { paddingRight: 46, marginBottom: 0 }]} placeholder="Create password" placeholderTextColor={colors.gray} value={form.password} onChangeText={set('password')} secureTextEntry={!showPwd} />
                            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPwd(!showPwd)}><Icon name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray} /></TouchableOpacity>
                        </View>

                        <Text style={[s.label, { marginTop: 14 }]}>Confirm Password</Text>
                        <View style={s.inputWrap}>
                            <TextInput style={[s.input, { paddingRight: 46, marginBottom: 0 }]} placeholder="Confirm password" placeholderTextColor={colors.gray} value={form.confirmPassword} onChangeText={set('confirmPassword')} secureTextEntry={!showConfirm} />
                            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}><Icon name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray} /></TouchableOpacity>
                        </View>

                        <TouchableOpacity style={s.checkRow} onPress={() => setAgreed(!agreed)}>
                            <View style={[s.checkbox, agreed && s.checkboxOn]}>
                                {agreed && <Icon name="checkmark" size={12} color="#fff" />}
                            </View>
                            <Text style={s.checkTxt}>I agree to the <Text style={s.link}>Terms of Service</Text> and <Text style={s.link}>Privacy Policy</Text></Text>
                        </TouchableOpacity>

                        {error ? <Text style={s.errText}>{error}</Text> : null}

                        <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Create Account</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    card: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, marginTop: -20 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 3 },
    cardSub: { fontSize: 12, color: colors.gray, marginBottom: 18 },
    link: { color: colors.blue, fontWeight: '600' },
    row: { flexDirection: 'row', gap: 10 },
    label: { fontSize: 11, fontWeight: '600', color: colors.text2, marginBottom: 5 },
    input: { borderWidth: 1.5, borderColor: colors.grayLight, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 12, fontSize: 13, color: colors.text, backgroundColor: '#F9FAFB', marginBottom: 14 },
    inputWrap: { position: 'relative', marginBottom: 0 },
    eyeBtn: { position: 'absolute', right: 13, top: 0, bottom: 0, justifyContent: 'center' },
    checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 14 },
    checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colors.grayLight, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
    checkboxOn: { backgroundColor: colors.blue, borderColor: colors.blue },
    checkTxt: { fontSize: 11, color: colors.gray, flex: 1 },
    errText: { color: colors.danger, fontSize: 12, marginBottom: 12 },
    btn: { backgroundColor: colors.blue, borderRadius: 13, paddingVertical: 14, alignItems: 'center', marginTop: 4, elevation: 4 },
    btnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

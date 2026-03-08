import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../../core/api/auth.api';
import { colors } from '../../theme/colors';
import { AuthStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
    const navigation = useNavigation<Nav>();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async () => {
        if (!email) { setError('Please enter your email address'); return; }
        try {
            setLoading(true); setError(null);
            await authApi.forgotPassword(email);
            navigation.navigate('ForgotPasswordSent');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.root} edges={['bottom', 'left', 'right']}>
            <View style={[s.header, { paddingTop: Math.max(insets.top, 14) }]}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={18} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Forgot Password</Text>
            </View>

            <ScrollView style={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={s.iconBox}>
                    <Text style={{ fontSize: 28 }}>🔐</Text>
                </View>

                <Text style={s.title}>Reset Password</Text>
                <Text style={s.sub}>Enter your email and we'll send you a reset link</Text>

                <Text style={s.label}>Email Address</Text>
                <TextInput
                    style={s.input}
                    placeholder="email@example.com"
                    placeholderTextColor={colors.gray}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                {error ? <Text style={s.errText}>{error}</Text> : null}

                <TouchableOpacity style={s.btn} onPress={handleSend} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Send Reset Link</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 16, paddingBottom: 14 },
    backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    body: { flex: 1, paddingHorizontal: 24 },
    iconBox: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 6 },
    sub: { fontSize: 12, color: colors.gray, marginBottom: 24, lineHeight: 18 },
    label: { fontSize: 11, fontWeight: '600', color: colors.text2, marginBottom: 5 },
    input: { borderWidth: 1.5, borderColor: colors.grayLight, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 12, fontSize: 13, color: colors.text, backgroundColor: '#F9FAFB', marginBottom: 14 },
    errText: { color: colors.danger, fontSize: 12, marginBottom: 12 },
    btn: { backgroundColor: colors.blue, borderRadius: 13, paddingVertical: 14, alignItems: 'center', elevation: 4 },
    btnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

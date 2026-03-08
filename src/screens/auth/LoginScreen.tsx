import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Alert, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { AUTH_ENDPOINTS } from '../../core/api/endpoints';
import { AuthStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    try {
      setError(null);
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      Alert.alert('Login Error', `URL: ${AUTH_ENDPOINTS.login}\nError: ${err.message}`);
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
              <Image source={require('../../assets/images/logo.png')} style={s.logoImg} />
              <Text style={s.logoText}>EscrowITX</Text>
            </View>
            <Text style={s.tagline}>WELCOME BACK</Text>
            <Text style={s.headline}>Sign In to Your{'\n'}<Text style={s.accentText}>Account</Text></Text>
            <Text style={s.subText}>Securely access your escrow account and continue your currency exchange transactions.</Text>
          </LinearGradient>

          <View style={s.card}>
            <Text style={s.cardTitle}>Sign In</Text>
            <Text style={s.cardSub}>New to EscrowITX? <Text style={s.link} onPress={() => navigation.navigate('Register')}>Create Account</Text></Text>

            <Text style={s.label}>Email Address</Text>
            <TextInput style={s.input} placeholder="email@example.com" placeholderTextColor={colors.gray} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

            <Text style={s.label}>Password</Text>
            <View style={s.inputWrap}>
              <TextInput style={[s.input, { paddingRight: 46 }]} placeholder="Your password" placeholderTextColor={colors.gray} value={password} onChangeText={setPassword} secureTextEntry={!showPwd} />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPwd(!showPwd)}>
                <Icon name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray} />
              </TouchableOpacity>
            </View>

            <View style={s.remRow}>
              <Text style={s.remText}>Remember me</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}><Text style={s.link}>Forgot Password?</Text></TouchableOpacity>
            </View>

            {error ? <Text style={s.errText}>{error}</Text> : null}

            <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Sign In</Text>}
            </TouchableOpacity>
            <Text style={s.bottomTxt}>Don't have an account? <Text style={s.link} onPress={() => navigation.navigate('Register')}>Get Started</Text></Text>
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
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoImg: { width: 36, height: 36, borderRadius: 8, resizeMode: 'contain' },
  logoText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  tagline: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '500', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  headline: { color: '#fff', fontSize: 26, fontWeight: '800', lineHeight: 32, marginBottom: 10 },
  accentText: { color: '#00D4AA' },
  subText: { color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 18 },
  card: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, marginTop: -20, minHeight: 420 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 3 },
  cardSub: { fontSize: 12, color: colors.gray, marginBottom: 20 },
  link: { color: colors.blue, fontWeight: '600' },
  label: { fontSize: 11, fontWeight: '600', color: colors.text2, marginBottom: 5 },
  input: { borderWidth: 1.5, borderColor: colors.grayLight, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 12, fontSize: 13, color: colors.text, backgroundColor: '#F9FAFB', marginBottom: 14 },
  inputWrap: { position: 'relative', marginBottom: 14 },
  eyeBtn: { position: 'absolute', right: 13, top: 0, bottom: 0, justifyContent: 'center' },
  remRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  remText: { fontSize: 11, color: colors.gray },
  errText: { color: colors.danger, fontSize: 12, marginBottom: 12 },
  btn: { backgroundColor: colors.blue, borderRadius: 13, paddingVertical: 14, alignItems: 'center', marginBottom: 16, elevation: 4 },
  btnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  bottomTxt: { textAlign: 'center', fontSize: 12, color: colors.gray },
});
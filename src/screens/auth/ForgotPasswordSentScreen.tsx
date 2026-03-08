import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { AuthStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPasswordSent'>;

export default function ForgotPasswordSentScreen() {
    const navigation = useNavigation<Nav>();

    return (
        <SafeAreaView style={s.root}>
            <View style={s.container}>
                <View style={s.iconWrap}>
                    <Text style={{ fontSize: 32 }}>📧</Text>
                </View>
                <Text style={s.title}>Password Reset Sent</Text>
                <Text style={s.sub}>We've sent a reset link to your email. Check your inbox and follow the instructions.</Text>
                <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Login')}>
                    <Text style={s.btnTxt}>Back to Sign In</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#00D4AA', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#00D4AA', shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
    title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' },
    sub: { fontSize: 13, color: colors.gray, lineHeight: 20, marginBottom: 28, textAlign: 'center' },
    btn: { width: '100%', maxWidth: 260, backgroundColor: colors.blue, borderRadius: 13, paddingVertical: 14, alignItems: 'center', elevation: 4 },
    btnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

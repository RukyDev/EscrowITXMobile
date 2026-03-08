import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { EscrowStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<EscrowStackParamList, 'DisputeSubmitted'>;

export default function DisputeSubmittedScreen() {
    const navigation = useNavigation<Nav>();

    return (
        <SafeAreaView style={s.root}>
            <View style={s.container}>
                <View style={s.iconWrap}>
                    <Icon name="warning" size={60} color={colors.danger} />
                </View>
                <Text style={s.title}>Dispute Submitted</Text>
                <Text style={s.sub}>Your dispute has been logged successfully. Our support team will review the evidence and contact you shortly. Your funds are entirely safe.</Text>

                <View style={s.btnWrap}>
                    <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('EscrowList')}>
                        <Text style={s.btnTxt}>Return to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.white },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    iconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 12 },
    sub: { fontSize: 14, color: colors.gray, textAlign: 'center', lineHeight: 22 },
    btnWrap: { width: '100%', marginTop: 40 },
    btn: { backgroundColor: colors.danger, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' }
});

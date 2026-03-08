import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { EscrowStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<EscrowStackParamList, 'EscrowSuccess'>;

export default function EscrowSuccessScreen() {
    const navigation = useNavigation<Nav>();

    return (
        <SafeAreaView style={s.root}>
            <View style={s.container}>
                <View style={s.iconWrap}>
                    <Icon name="checkmark-done-circle" size={80} color={colors.success} />
                </View>
                <Text style={s.title}>Transaction Complete</Text>
                <Text style={s.sub}>The escrow transaction has been successfully confirmed and funds have been released to the designated wallet.</Text>

                <View style={s.btnWrap}>
                    <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('EscrowList')}>
                        <Text style={s.btnTxt}>Back to Escrow List</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.white },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    iconWrap: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 12, textAlign: 'center' },
    sub: { fontSize: 14, color: colors.gray, textAlign: 'center', lineHeight: 22, marginTop: 8, paddingHorizontal: 20 },
    btnWrap: { width: '100%', marginTop: 40, paddingHorizontal: 16 },
    btn: { backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' }
});

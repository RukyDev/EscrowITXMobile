import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme/colors';

export default function AdSuccessScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const type = route.params?.type || 'ad';

    return (
        <SafeAreaView style={s.root}>
            <StatusBar barStyle="dark-content" />
            <View style={s.container}>
                <LinearGradient
                    colors={['#F0FDF4', '#DCFCE7']}
                    style={s.iconCircle}
                >
                    <Icon name="check-decagram" size={80} color={colors.success} />
                </LinearGradient>

                <Text style={s.title}>Advertisement Published!</Text>
                <Text style={s.sub}>
                    Your {type} advertisement is now live on the marketplace. Other users can now see and trade with you.
                </Text>

                <View style={s.card}>
                    <View style={s.infoRow}>
                        <Icon name="shield-check" size={20} color={colors.blue} />
                        <Text style={s.infoTxt}>Secure Escrow Protection Enabled</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={s.btn}
                    onPress={() => navigation.navigate('Marketplace')}
                >
                    <Text style={s.btnTxt}>Back to Marketplace</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={s.secondaryBtn}
                    onPress={() => navigation.navigate('Home', { screen: 'Dashboard' })}
                >
                    <Text style={s.secondaryBtnTxt}>Go to Dashboard</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.white },
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    iconCircle: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 12, textAlign: 'center' },
    sub: { fontSize: 15, color: colors.gray, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20, marginBottom: 40 },
    card: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 16, width: '100%', marginBottom: 40, borderWidth: 1, borderColor: colors.grayLight },
    infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    infoTxt: { fontSize: 13, fontWeight: '600', color: colors.text2 },
    btn: { width: '100%', backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, elevation: 2 },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' },
    secondaryBtn: { width: '100%', paddingVertical: 16, alignItems: 'center' },
    secondaryBtnTxt: { color: colors.gray, fontSize: 15, fontWeight: '600' }
});

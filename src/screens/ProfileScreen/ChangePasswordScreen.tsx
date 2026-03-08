import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { profileApi } from '../../core/api/profile.api';

export default function ChangePasswordScreen() {
    const navigation = useNavigation();

    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const handleUpdate = async () => {
        if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await profileApi.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            });

            Alert.alert('Success', 'Password changed successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e: any) {
            Alert.alert('Change Failed', e.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Change Password</Text>
            </View>

            <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
                <View style={s.card}>
                    <Text style={s.lbl}>Current Password</Text>
                    <View style={s.inputWrap}>
                        <TextInput
                            style={s.inputInner}
                            secureTextEntry={!showCurrent}
                            value={form.currentPassword}
                            onChangeText={(t) => setForm({ ...form, currentPassword: t })}
                            placeholder="Enter current password"
                        />
                        <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={s.eyeBtn}>
                            <Icon name={showCurrent ? "eye-off" : "eye"} size={20} color={colors.gray} />
                        </TouchableOpacity>
                    </View>

                    <Text style={s.lbl}>New Password</Text>
                    <View style={s.inputWrap}>
                        <TextInput
                            style={s.inputInner}
                            secureTextEntry={!showNew}
                            value={form.newPassword}
                            onChangeText={(t) => setForm({ ...form, newPassword: t })}
                            placeholder="Enter new password"
                        />
                        <TouchableOpacity onPress={() => setShowNew(!showNew)} style={s.eyeBtn}>
                            <Icon name={showNew ? "eye-off" : "eye"} size={20} color={colors.gray} />
                        </TouchableOpacity>
                    </View>

                    <Text style={s.lbl}>Confirm New Password</Text>
                    <View style={s.inputWrap}>
                        <TextInput
                            style={s.inputInner}
                            secureTextEntry={!showNew} // share toggle state with New Password
                            value={form.confirmPassword}
                            onChangeText={(t) => setForm({ ...form, confirmPassword: t })}
                            placeholder="Re-enter new password"
                        />
                    </View>
                </View>

                <View style={s.footer}>
                    <TouchableOpacity
                        style={[s.btn, (!form.currentPassword || !form.newPassword || !form.confirmPassword) && s.btnDisabled]}
                        onPress={handleUpdate}
                        disabled={loading || (!form.currentPassword || !form.newPassword || !form.confirmPassword)}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Update Password</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    card: { backgroundColor: colors.white, padding: 20, borderRadius: 16, elevation: 1 },
    lbl: { fontSize: 13, fontWeight: '600', color: colors.text2, marginBottom: 8, marginTop: 16 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 12, paddingHorizontal: 16 },
    inputInner: { flex: 1, paddingVertical: 16, fontSize: 14, color: colors.text },
    eyeBtn: { padding: 8 },
    footer: { marginTop: 32 },
    btn: { width: '100%', backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    btnDisabled: { backgroundColor: '#A5B4FC' },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' },
});

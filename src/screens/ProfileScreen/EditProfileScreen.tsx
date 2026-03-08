import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, StatusBar, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/auth.store';
import { profileApi } from '../../core/api/profile.api';
import { SessionUser } from '../../core/api/auth.api';

const GENDERS = [
    { label: 'Male', value: 1 },
    { label: 'Female', value: 2 },
    { label: 'Others', value: 3 },
];

const OCCUPATIONS = [
    { label: 'Formal', value: 1 },
    { label: 'Informal', value: 2 },
];

export default function EditProfileScreen() {
    const navigation = useNavigation();
    const { user, setUser } = useAuthStore();

    const [form, setForm] = useState({
        name: user?.name || '',
        surname: user?.surname || '',
        emailAddress: user?.emailAddress || '',
        nationality: user?.nationality || '',
        phoneNumber: user?.phoneNumber || '',
        dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user?.gender || 1,
        occupation: user?.occupation || 1,
        residentialAddress: user?.residentialAddress || '',
    });

    const [loading, setLoading] = useState(false);
    const [showGenderModal, setShowGenderModal] = useState(false);
    const [showOccupationModal, setShowOccupationModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Date picker states
    const [selYear, setSelYear] = useState(new Date().getFullYear());
    const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1);
    const [selDay, setSelDay] = useState(new Date().getDate());

    const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 18 - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const onConfirmDate = () => {
        const dateStr = `${selYear}-${String(selMonth).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`;
        setForm({ ...form, dateOfBirth: dateStr });
        setShowDatePicker(false);
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const payload: any = {
                ...form,
                id: user?.id || 0,
                userName: user?.userName || form.emailAddress,
                isActive: true,
                fullName: `${form.name} ${form.surname}`,
                isVerified: user?.isVerified ?? false,
                roleNames: [],
                creationTime: new Date().toISOString(),
                lastLoginTime: new Date().toISOString(),
                status: ''
            };

            await profileApi.updateProfile(payload);

            const updatedUser: SessionUser = {
                ...user!,
                ...form,
            };

            setUser(updatedUser);

            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e: any) {
            Alert.alert('Update Failed', e.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const renderPicker = (label: string, value: string, onPress: () => void) => (
        <View style={s.pickerGroup}>
            <Text style={s.lbl}>{label}</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={onPress}>
                <Text style={s.pickerBtnTxt}>{value}</Text>
                <Icon name="chevron-down" size={20} color={colors.gray} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={s.root}>
            <StatusBar barStyle="dark-content" />
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Edit Profile</Text>
            </View>

            <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
                <View style={s.card}>
                    <View style={s.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={s.lbl}>First Name</Text>
                            <TextInput style={s.input} value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={s.lbl}>Surname</Text>
                            <TextInput style={s.input} value={form.surname} onChangeText={(t) => setForm({ ...form, surname: t })} />
                        </View>
                    </View>

                    <Text style={s.lbl}>Email Address</Text>
                    <TextInput style={[s.input, s.inputDisabled]} value={form.emailAddress} editable={false} />

                    <Text style={s.lbl}>Phone Number</Text>
                    <TextInput style={s.input} value={form.phoneNumber} onChangeText={(t) => setForm({ ...form, phoneNumber: t })} keyboardType="phone-pad" />

                    <View style={s.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={s.lbl}>Nationality</Text>
                            <TextInput style={s.input} value={form.nationality} onChangeText={(t) => setForm({ ...form, nationality: t })} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={s.lbl}>Date of Birth</Text>
                            <TouchableOpacity style={s.input} onPress={() => setShowDatePicker(true)}>
                                <Text style={{ color: form.dateOfBirth ? colors.text : colors.gray }}>
                                    {form.dateOfBirth || 'Select Date'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={s.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            {renderPicker('Gender', GENDERS.find(g => g.value === form.gender)?.label || 'Select', () => setShowGenderModal(true))}
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            {renderPicker('Occupation', OCCUPATIONS.find(o => o.value === form.occupation)?.label || 'Select', () => setShowOccupationModal(true))}
                        </View>
                    </View>

                    <Text style={s.lbl}>Residential Address</Text>
                    <TextInput style={[s.input, { height: 80 }]} value={form.residentialAddress} onChangeText={(t) => setForm({ ...form, residentialAddress: t })} multiline />
                </View>

                <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleUpdate} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Save Changes</Text>}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal visible={showGenderModal} transparent animationType="fade">
                <TouchableOpacity style={s.modalOverlay} onPress={() => setShowGenderModal(false)}>
                    <View style={s.modalCard}>
                        {GENDERS.map(g => (
                            <TouchableOpacity key={g.value} style={s.modalItem} onPress={() => { setForm({ ...form, gender: g.value }); setShowGenderModal(false); }}>
                                <Text style={s.modalItemTxt}>{g.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={showOccupationModal} transparent animationType="fade">
                <TouchableOpacity style={s.modalOverlay} onPress={() => setShowOccupationModal(false)}>
                    <View style={s.modalCard}>
                        {OCCUPATIONS.map(o => (
                            <TouchableOpacity key={o.value} style={s.modalItem} onPress={() => { setForm({ ...form, occupation: o.value }); setShowOccupationModal(false); }}>
                                <Text style={s.modalItemTxt}>{o.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Simple Date Picker Modal */}
            <Modal visible={showDatePicker} transparent animationType="slide">
                <View style={s.modalOverlay}>
                    <View style={[s.modalCard, { width: '90%', padding: 20 }]}>
                        <Text style={[s.headerTitle, { textAlign: 'center', marginBottom: 20 }]}>Select Date of Birth</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, marginRight: 5 }}>
                                <Text style={s.lbl}>Day</Text>
                                <ScrollView style={{ height: 150 }}>
                                    {days.map(d => (
                                        <TouchableOpacity key={d} style={[s.dateItem, selDay === d && s.dateItemSel]} onPress={() => setSelDay(d)}>
                                            <Text style={[s.dateItemTxt, selDay === d && s.dateItemTxtSel]}>{d}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                            <View style={{ flex: 1.5, marginHorizontal: 5 }}>
                                <Text style={s.lbl}>Month</Text>
                                <ScrollView style={{ height: 150 }}>
                                    {months.map(m => (
                                        <TouchableOpacity key={m} style={[s.dateItem, selMonth === m && s.dateItemSel]} onPress={() => setSelMonth(m)}>
                                            <Text style={[s.dateItemTxt, selMonth === m && s.dateItemTxtSel]}>
                                                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                            <View style={{ flex: 1, marginLeft: 5 }}>
                                <Text style={s.lbl}>Year</Text>
                                <ScrollView style={{ height: 150 }}>
                                    {years.map(y => (
                                        <TouchableOpacity key={y} style={[s.dateItem, selYear === y && s.dateItemSel]} onPress={() => setSelYear(y)}>
                                            <Text style={[s.dateItemTxt, selYear === y && s.dateItemTxtSel]}>{y}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                            <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: colors.grayLight }]} onPress={() => setShowDatePicker(false)}>
                                <Text style={[s.btnTxt, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.btn, { flex: 1 }]} onPress={onConfirmDate}>
                                <Text style={s.btnTxt}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    card: { backgroundColor: colors.white, padding: 20, borderRadius: 16, marginBottom: 24, elevation: 1 },
    row: { flexDirection: 'row', marginBottom: 0 },
    lbl: { fontSize: 13, fontWeight: '600', color: colors.text2, marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 12, padding: 14, fontSize: 14, color: colors.text },
    inputDisabled: { backgroundColor: colors.grayLight, color: colors.gray },
    pickerGroup: { flex: 1 },
    pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 12, padding: 14 },
    pickerBtnTxt: { fontSize: 14, color: colors.text },
    btn: { backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    btnDisabled: { opacity: 0.6 },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalCard: { backgroundColor: colors.white, width: '80%', borderRadius: 16, paddingVertical: 8 },
    modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.grayLight },
    modalItemTxt: { fontSize: 16, color: colors.text, textAlign: 'center' },
    dateItem: { paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    dateItemSel: { backgroundColor: colors.blue },
    dateItemTxt: { fontSize: 14, color: colors.text },
    dateItemTxtSel: { color: colors.white, fontWeight: '700' },
});

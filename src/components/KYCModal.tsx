import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
    ScrollView, ActivityIndicator, Alert, Platform, Switch
} from 'react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { colors } from '../theme/colors';
import { documentApi, DocumentUploadStatus } from '../core/api/document.api';
import { useAuthStore } from '../store/auth.store';

interface KYCModalProps {
    visible: boolean;
    onComplete: () => void;
}

export default function KYCModal({ visible, onComplete }: KYCModalProps) {
    const { user, bootstrap } = useAuthStore();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Tab 1: Personal Info
    const [nationality, setNationality] = useState(user?.nationality || '');
    const [dob, setDob] = useState(user?.dateOfBirth ? moment(user.dateOfBirth).format('YYYY-MM-DD') : '');
    const [address, setAddress] = useState(user?.residentialAddress || '');
    const [gender, setGender] = useState<number | null>(user?.gender || null);
    const [occupation, setOccupation] = useState<number | null>(user?.occupation || null);

    // Tab 2: Verification & Uploads
    const [nin, setNin] = useState('');
    const [bvn, setBvn] = useState('');
    const [governmentId, setGovernmentId] = useState<any>(null);
    const [selfie, setSelfie] = useState<any>(null);
    const [proofOfAddress, setProofOfAddress] = useState<any>(null);

    const [status, setStatus] = useState<DocumentUploadStatus | null>(null);

    useEffect(() => {
        if (visible) {
            checkStatus();
        }
    }, [visible]);

    const checkStatus = async () => {
        try {
            const s = await documentApi.getStatus();
            setStatus(s);
        } catch (e) { }
    };

    const pickDocument = async (type: 'governmentId' | 'selfie' | 'proofOfAddress') => {
        try {
            const [res] = await pick({
                type: [types.images, types.pdf],
                mode: 'open',
            });
            if (res) {
                if (type === 'governmentId') setGovernmentId(res);
                if (type === 'selfie') setSelfie(res);
                if (type === 'proofOfAddress') setProofOfAddress(res);
            }
        } catch (err: any) {
            if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                // User cancelled - ignore
            } else {
                Alert.alert('Error', 'Failed to pick document');
            }
        }
    };

    const canProceedTab1 = nationality.trim() !== '' && dob !== '' && address.trim() !== '' && gender !== null && occupation !== null;

    const isUploaded = status === DocumentUploadStatus.Uploaded || status === DocumentUploadStatus.underReview;
    const isApproved = status === DocumentUploadStatus.AllApproved;
    const isGovIdDeclined = status === DocumentUploadStatus.GovernmentIDDeclined || status === DocumentUploadStatus.AllDeclined;
    const isPOADeclined = status === DocumentUploadStatus.POADeclined || status === DocumentUploadStatus.AllDeclined;
    const isSelfieDeclined = status === DocumentUploadStatus.SelfieDeclined || status === DocumentUploadStatus.AllDeclined;
    const isNINDeclined = status === DocumentUploadStatus.NINFaild || status === DocumentUploadStatus.AllDeclined;
    const isBVNDeclined = status === DocumentUploadStatus.BVNFaild || status === DocumentUploadStatus.AllDeclined;

    const canSave = canProceedTab1 &&
        (isNINDeclined ? nin.length === 11 : true) &&
        (isBVNDeclined ? bvn.length === 11 : true) &&
        (isGovIdDeclined ? !!governmentId : true) &&
        (isSelfieDeclined ? !!selfie : true) &&
        (isPOADeclined ? !!proofOfAddress : true) &&
        (status !== null && status !== DocumentUploadStatus.Uploaded && status !== DocumentUploadStatus.underReview && status !== DocumentUploadStatus.AllApproved);

    const handleSave = async () => {
        if (!canSave) return;
        setSaving(true);
        try {
            await documentApi.uploadKYC({
                governmentId: governmentId ? { uri: governmentId.uri, name: governmentId.name, type: governmentId.type } : undefined,
                selfie: selfie ? { uri: selfie.uri, name: selfie.name, type: selfie.type } : undefined,
                proofOfAddress: proofOfAddress ? { uri: proofOfAddress.uri, name: proofOfAddress.name, type: proofOfAddress.type } : undefined,
                bvn,
                nin,
                nationality,
                dateOfBirth: moment(dob).toISOString(),
                address,
                gender: gender!,
                occupation: occupation!,
            });
            Alert.alert('Success', 'Profile setup completed! Admin will review your documents soon.');
            await bootstrap();
            onComplete();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to upload documents');
        } finally {
            setSaving(false);
        }
    };

    const renderTab1 = () => (
        <ScrollView style={styles.tabContent}>
            <Text style={styles.label}>Nationality *</Text>
            <TextInput
                style={[styles.input, isUploaded && styles.btnDisabled]}
                value={nationality}
                onChangeText={setNationality}
                placeholder="e.g. Nigerian"
                editable={!isUploaded}
            />

            <Text style={styles.label}>Date of Birth (YYYY-MM-DD) *</Text>
            <TextInput
                style={[styles.input, isUploaded && styles.btnDisabled]}
                value={dob}
                onChangeText={setDob}
                placeholder="1990-01-01"
                keyboardType="numeric"
                editable={!isUploaded}
            />

            <Text style={styles.label}>Residential Address *</Text>
            <TextInput
                style={[styles.input, { height: 80 }, isUploaded && styles.btnDisabled]}
                value={address}
                onChangeText={setAddress}
                placeholder="Full Address"
                multiline
                editable={!isUploaded}
            />

            <Text style={styles.label}>Gender *</Text>
            <View style={styles.pickerRow}>
                {[{ l: 'Male', v: 1 }, { l: 'Female', v: 2 }, { l: 'Others', v: 3 }].map(g => (
                    <TouchableOpacity
                        key={g.v}
                        disabled={isUploaded}
                        style={[styles.chip, gender === g.v && styles.chipActive, isUploaded && styles.btnDisabled]}
                        onPress={() => setGender(g.v)}
                    >
                        <Text style={[styles.chipTxt, gender === g.v && styles.chipTxtActive]}>{g.l}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>Occupation *</Text>
            <View style={styles.pickerRow}>
                {[{ l: 'Formal', v: 1 }, { l: 'Informal', v: 2 }].map(o => (
                    <TouchableOpacity
                        key={o.v}
                        disabled={isUploaded}
                        style={[styles.chip, occupation === o.v && styles.chipActive, isUploaded && styles.btnDisabled]}
                        onPress={() => setOccupation(o.v)}
                    >
                        <Text style={[styles.chipTxt, occupation === o.v && styles.chipTxtActive]}>{o.l}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    const renderTab2 = () => (
        <ScrollView style={styles.tabContent}>
            <Text style={styles.label}>NIN (11 Digits) *</Text>
            <TextInput
                style={[styles.input, (!isNINDeclined && status !== null) && styles.btnDisabled]}
                value={nin}
                onChangeText={t => setNin(t.replace(/\D/g, '').slice(0, 11))}
                keyboardType="numeric"
                placeholder="Enter NIN"
                editable={isNINDeclined || status === null}
            />

            <Text style={styles.label}>BVN (11 Digits) *</Text>
            <TextInput
                style={[styles.input, (!isBVNDeclined && status !== null) && styles.btnDisabled]}
                value={bvn}
                onChangeText={t => setBvn(t.replace(/\D/g, '').slice(0, 11))}
                keyboardType="numeric"
                placeholder="Enter BVN"
                editable={isBVNDeclined || status === null}
            />

            <Text style={[styles.label, { marginTop: 10 }]}>Uploads</Text>

            <TouchableOpacity
                style={[styles.uploadBtn, (!isGovIdDeclined && status !== null) && styles.btnDisabled]}
                onPress={() => pickDocument('governmentId')}
                disabled={!isGovIdDeclined && status !== null}
            >
                <Icon name={governmentId ? "check-circle" : "file-upload"} size={20} color={governmentId ? colors.success : colors.blue} />
                <Text style={styles.uploadBtnTxt}>{governmentId ? governmentId.name : "Government ID (Passport/ID Card)"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.uploadBtn, (!isSelfieDeclined && status !== null) && styles.btnDisabled]}
                onPress={() => pickDocument('selfie')}
                disabled={!isSelfieDeclined && status !== null}
            >
                <Icon name={selfie ? "check-circle" : "camera"} size={20} color={selfie ? colors.success : colors.blue} />
                <Text style={styles.uploadBtnTxt}>{selfie ? selfie.name : "Selfie Image"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.uploadBtn, (!isPOADeclined && status !== null) && styles.btnDisabled]}
                onPress={() => pickDocument('proofOfAddress')}
                disabled={!isPOADeclined && status !== null}
            >
                <Icon name={proofOfAddress ? "check-circle" : "home-city"} size={20} color={proofOfAddress ? colors.success : colors.blue} />
                <Text style={styles.uploadBtnTxt}>{proofOfAddress ? proofOfAddress.name : "Proof of Address (Utility Bill/Statement)"}</Text>
            </TouchableOpacity>

            {isUploaded ? (
                <View style={styles.statusBox}>
                    <Text style={styles.statusTxt}>Documents under review. You'll be notified once approved.</Text>
                </View>
            ) : isApproved ? (
                <View style={[styles.statusBox, { borderColor: colors.success, backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.statusTxt, { color: colors.success }]}>Verification completed successfully!</Text>
                </View>
            ) : status !== null ? (
                <View style={[styles.statusBox, { borderColor: colors.danger, backgroundColor: '#FEF2F2' }]}>
                    <Text style={[styles.statusTxt, { color: colors.danger }]}>Some details require attention. Please update the enabled fields.</Text>
                </View>
            ) : null}
        </ScrollView>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Setup Profile</Text>
                        <Text style={styles.sub}>Complete your profile to start trading</Text>
                    </View>

                    <View style={styles.tabs}>
                        <TouchableOpacity style={[styles.tab, activeTab === 0 && styles.tabActive]} onPress={() => setActiveTab(0)}>
                            <Text style={[styles.tabTxt, activeTab === 0 && styles.tabTxtActive]}>Personal Info</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tab, activeTab === 1 && styles.tabActive]} onPress={() => activeTab === 0 && canProceedTab1 ? setActiveTab(1) : Alert.alert('Notice', 'Complete Personal Info first')}>
                            <Text style={[styles.tabTxt, activeTab === 1 && styles.tabTxtActive]}>Verification</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                        {activeTab === 0 ? renderTab1() : renderTab2()}
                    </View>

                    <View style={styles.footer}>
                        {activeTab === 0 ? (
                            <TouchableOpacity style={[styles.mainBtn, !canProceedTab1 && styles.btnDisabled]} onPress={() => canProceedTab1 && setActiveTab(1)}>
                                <Text style={styles.mainBtnTxt}>Continue</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.footerRow}>
                                <TouchableOpacity style={styles.backBtn} onPress={() => setActiveTab(0)}>
                                    <Text style={styles.backBtnTxt}>Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.mainBtn, { flex: 2 }, !canSave && styles.btnDisabled]} onPress={handleSave}>
                                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnTxt}>Save & Submit</Text>}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    container: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '90%', padding: 24 },
    header: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text },
    sub: { fontSize: 13, color: colors.gray, marginTop: 4 },
    tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 20 },
    tab: { paddingVertical: 12, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: colors.blue },
    tabTxt: { fontSize: 14, fontWeight: '600', color: colors.gray },
    tabTxtActive: { color: colors.blue },
    tabContent: { flex: 1 },
    label: { fontSize: 13, fontWeight: '700', color: colors.text2, marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14, fontSize: 15, color: colors.text },
    pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#F3F4F6' },
    chipActive: { backgroundColor: '#EEF2FF', borderColor: colors.blue },
    chipTxt: { fontSize: 13, color: colors.gray, fontWeight: '600' },
    chipTxtActive: { color: colors.blue },
    uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.blue, borderRadius: 12, padding: 16, marginTop: 12, gap: 12 },
    uploadBtnTxt: { fontSize: 13, fontWeight: '600', color: colors.text2, flex: 1 },
    statusBox: { marginTop: 20, padding: 16, backgroundColor: '#FFFBEB', borderRadius: 12, borderWidth: 1, borderColor: '#FEF3C7' },
    statusTxt: { fontSize: 13, color: '#92400E', fontWeight: '600', textAlign: 'center' },
    footer: { paddingTop: 20, borderTopWidth: 1, borderTopColor: '#eee' },
    mainBtn: { backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
    mainBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
    btnDisabled: { opacity: 0.5 },
    footerRow: { flexDirection: 'row', gap: 12 },
    backBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#F3F4F6' },
    backBtnTxt: { color: colors.text, fontWeight: '600' }
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { EscrowStackParamList } from '../../navigation/types';
import { escrowApi } from '../../core/api/escrow.api';

type Nav = NativeStackNavigationProp<EscrowStackParamList, 'Dispute'>;

export default function DisputeScreen() {
    const navigation = useNavigation<Nav>();
    const route = useRoute<any>();
    const escrowId = route.params?.escrowId;

    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<{ uri: string, name: string } | null>(null);

    const handleAttach = () => {
        // In a real app we would use react-native-document-picker or similar here.
        // For now we mock selection.
        Alert.alert('Mock Attach', 'Selected an image evidence.', [{
            text: 'OK', onPress: () => setSelectedDoc({ uri: 'content://mock/img.jpg', name: 'evidence.jpg' })
        }]);
    };

    const handleSubmit = async () => {
        if (!reason || reason.trim().length < 10) {
            Alert.alert('Required', 'Please provide a detailed reason (at least 10 characters).');
            return;
        }

        setLoading(true);
        try {
            // 1. Create the dispute
            const resp = await escrowApi.createDispute(escrowId, reason);
            const disputeId = resp.result?.id || resp.id; // handle based on true ABP response wrapper

            // 2. Upload doc if selected
            if (selectedDoc && disputeId) {
                await escrowApi.uploadDisputeDoc(disputeId, selectedDoc.uri, selectedDoc.name, 'image/jpeg');
            }

            navigation.navigate('DisputeSubmitted');
        } catch (e: any) {
            Alert.alert('Dispute Failed', e.message || 'Failed to file the dispute.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>File a Dispute</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
                <View style={s.alertBox}>
                    <Icon name="warning" size={20} color={colors.danger} />
                    <Text style={s.alertTxt}>Filing a dispute will freeze the escrow funds. Our support team will review the evidence to resolve the issue.</Text>
                </View>

                <View style={s.card}>
                    <Text style={s.label}>Reason for Dispute</Text>
                    <TextInput
                        style={s.textArea}
                        placeholder="Please describe the issue in detail..."
                        multiline
                        numberOfLines={5}
                        value={reason}
                        onChangeText={setReason}
                        textAlignVertical="top"
                    />

                    <Text style={[s.label, { marginTop: 24 }]}>Attach Evidence (Optional)</Text>
                    {selectedDoc ? (
                        <View style={s.docChip}>
                            <Icon name="document-text" size={18} color={colors.blue} />
                            <Text style={s.docName}>{selectedDoc.name}</Text>
                            <TouchableOpacity onPress={() => setSelectedDoc(null)}>
                                <Icon name="close-circle" size={20} color={colors.gray} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={s.uploadBox} onPress={handleAttach}>
                            <Icon name="cloud-upload-outline" size={28} color={colors.gray} />
                            <Text style={s.uploadTxt}>Tap to select screenshots or receipts</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <View style={s.footer}>
                <TouchableOpacity
                    style={[s.btn, (!reason || reason.trim().length < 10) && s.btnDisabled]}
                    onPress={handleSubmit}
                    disabled={loading || !reason || reason.trim().length < 10}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Submit Dispute</Text>}
                </TouchableOpacity>
            </View>
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
        justifyContent: 'space-between',
        backgroundColor: colors.white
    },
    backBtn: { padding: 4, width: 40 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    body: { flex: 1, padding: 16 },
    alertBox: { flexDirection: 'row', backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12, marginBottom: 20, gap: 12 },
    alertTxt: { flex: 1, fontSize: 13, color: colors.danger, lineHeight: 20 },
    card: { backgroundColor: colors.white, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.grayLight },
    label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 },
    textArea: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 12, padding: 16, fontSize: 14, color: colors.text, minHeight: 120 },
    uploadBox: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.blue, borderRadius: 12, padding: 24, alignItems: 'center', backgroundColor: '#EEF2FF' },
    uploadTxt: { fontSize: 13, color: colors.blue, marginTop: 8, fontWeight: '600' },
    docChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.grayLight },
    docName: { flex: 1, fontSize: 13, color: colors.text, marginHorizontal: 8 },
    footer: { padding: 24, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.grayLight },
    btn: { width: '100%', backgroundColor: colors.danger, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    btnDisabled: { backgroundColor: '#FCA5A5' },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' }
});

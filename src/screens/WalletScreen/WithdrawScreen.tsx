import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { walletApi, Bank } from '../../core/api/wallet.api';
import { useWalletStore } from '../../store/wallet.store';
import { Platform, StatusBar } from 'react-native';


export default function WithdrawScreen() {
    const navigation = useNavigation<any>();
    const { banks, fetchBanks } = useWalletStore();

    const [amount, setAmount] = useState('');
    const [acctNumber, setAcctNumber] = useState('');
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [acctName, setAcctName] = useState('');
    const [narration, setNarration] = useState('');

    const [loadingName, setLoadingName] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);

    useEffect(() => {
        if (banks.length === 0) fetchBanks();
    }, []);

    const resolveAccountName = async (bankUuid: string, acct: string, amt: string) => {
        if (acct.length === 10 && bankUuid) {
            setLoadingName(true);
            const valAmt = parseFloat(amt) || 10;
            try {
                const res = await walletApi.validateAccount(bankUuid, acct, valAmt);
                const name = (res as any)?.payload?.accountName || (res as any)?.accountName || (typeof res === 'string' ? res : '');
                if (name) setAcctName(name);
            } catch (e) {
                // We DON'T reset acctName here so user can type it if API fails
                // Alert.alert('Notice', 'Could not auto-verify name. Please enter it manually.');
            } finally {
                setLoadingName(false);
            }
        }
    };


    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Withdraw Funds</Text>
            </View>

            <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
                <View style={s.card}>
                    <Text style={s.lbl}>Amount (NGN)</Text>
                    <View style={s.inputWrap}>
                        <Text style={s.currencyPrefix}>₦</Text>
                        <TextInput
                            style={s.inputAmt}
                            keyboardType="numeric"
                            placeholder="0.00"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>
                    {!!amount && parseFloat(amount) < 5000 && (
                        <Text style={s.errorTxt}>Minimum withdrawal is ₦5,000</Text>
                    )}

                    <Text style={s.lbl}>Destination Bank</Text>
                    <TouchableOpacity style={s.pickerBtn} onPress={() => setShowBankModal(true)}>
                        <Text style={[s.pickerTxt, !selectedBank && { color: colors.gray }]}>
                            {selectedBank ? selectedBank.name : 'Select Bank'}
                        </Text>
                        <Icon name="chevron-down" size={20} color={colors.gray} />
                    </TouchableOpacity>

                    <Text style={s.lbl}>Account Number</Text>
                    <TextInput
                        style={s.input}
                        keyboardType="numeric"
                        placeholder="Enter 10-digit account number"
                        maxLength={10}
                        value={acctNumber}
                        onChangeText={(val) => {
                            setAcctNumber(val);
                            setAcctName('');
                            if (val.length === 10 && selectedBank) {
                                resolveAccountName(selectedBank.uuid, val, amount);
                            }
                        }}
                    />
                    <Text style={s.lbl}>Account Name</Text>
                    <View style={s.inputContainer}>
                        <TextInput
                            style={[s.input, !!acctName && !loadingName && { borderColor: colors.success, backgroundColor: '#F0FDF4' }]}
                            placeholder="Account name will appear here"
                            value={acctName}
                            onChangeText={setAcctName}
                            editable={false}
                        />
                        {loadingName && (
                            <ActivityIndicator
                                size="small"
                                color={colors.blue}
                                style={{ position: 'absolute', right: 16, top: 16 }}
                            />
                        )}
                    </View>

                    <Text style={s.lbl}>Narration (Optional)</Text>
                    <TextInput
                        style={s.input}
                        placeholder="What is this for?"
                        value={narration}
                        onChangeText={setNarration}
                    />
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>

            <View style={s.footer}>
                <TouchableOpacity
                    style={[s.btn, (!amount || parseFloat(amount) < 5000 || !acctNumber || !acctName) && s.btnDisabled]}
                    onPress={() => {
                        if (parseFloat(amount) < 5000) {
                            Alert.alert('Invalid Amount', 'The minimum withdrawal amount is ₦5,000');
                            return;
                        }
                        navigation.navigate('WithdrawPin', {
                            data: {
                                amount: parseFloat(amount),
                                bankUuid: selectedBank?.uuid,
                                accountNumber: acctNumber,
                                accountName: acctName,
                                narration: narration || 'Withdrawal from EscrowITX'
                            }
                        })
                    }}
                    disabled={!amount || parseFloat(amount) < 5000 || !acctNumber || !acctName}
                >
                    <Text style={s.btnTxt}>Continue</Text>
                </TouchableOpacity>
            </View>

            {/* Bank Picker Modal */}
            <Modal visible={showBankModal} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Select Bank</Text>
                            <TouchableOpacity onPress={() => setShowBankModal(false)}><Icon name="close" size={24} color={colors.text} /></TouchableOpacity>
                        </View>
                        <ScrollView>
                            {banks.length === 0 ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <ActivityIndicator color={colors.blue} />
                                    <Text style={{ marginTop: 10, color: colors.gray }}>Loading banks...</Text>
                                </View>
                            ) : banks.map(b => (
                                <TouchableOpacity
                                    key={b.uuid}
                                    style={[s.bankOption, selectedBank?.uuid === b.uuid && s.bankOptionSelected]}
                                    onPress={() => {
                                        setSelectedBank(b);
                                        setShowBankModal(false);
                                        if (acctNumber.length === 10) resolveAccountName(b.uuid, acctNumber, amount);
                                    }}
                                >
                                    <Text style={[s.bankOptionTxt, selectedBank?.uuid === b.uuid && s.bankOptionTxtSelected]}>{b.name}</Text>
                                    {selectedBank?.uuid === b.uuid && <Icon name="checkmark" size={20} color={colors.blue} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
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
    card: { backgroundColor: colors.white, padding: 20, borderRadius: 16, elevation: 1 },
    lbl: { fontSize: 13, fontWeight: '600', color: colors.text2, marginBottom: 8, marginTop: 16 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.blue, paddingBottom: 8 },
    currencyPrefix: { fontSize: 24, fontWeight: '700', color: colors.blue, marginRight: 8 },
    inputAmt: { flex: 1, fontSize: 32, fontWeight: '700', color: colors.text, padding: 0 },
    pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 12, padding: 16 },
    pickerTxt: { fontSize: 14, color: colors.text },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 12, padding: 16, fontSize: 14, color: colors.text },
    inputContainer: { position: 'relative' },
    nameResolve: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 10, borderRadius: 8, marginTop: 8 },
    nameResolveTxt: { fontSize: 12, color: colors.success, fontWeight: '600' },
    footer: { padding: 24, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.grayLight },
    btn: { width: '100%', backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    btnDisabled: { backgroundColor: '#A5B4FC' },
    btnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    bankOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.grayLight },
    bankOptionSelected: { backgroundColor: '#F8FAFF' },
    bankOptionTxt: { fontSize: 15, color: colors.text },
    bankOptionTxtSelected: { fontWeight: '700', color: colors.blue },
    errorTxt: { fontSize: 12, color: colors.danger, marginTop: 4, fontWeight: '500' }
});

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../theme/colors';

export interface ReceiptData {
    amount: number;
    beneficiaryName: string;
    senderName: string;
    status: string;
    reference?: string;
    date?: string;
    bankName?: string;
    accountNumber?: string;
    currency?: string;
}

interface Props {
    data: ReceiptData;
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View style={s.row}>
            <Text style={s.rowLabel}>{label}</Text>
            <Text style={s.rowValue}>{value}</Text>
        </View>
    );
}

export default function ReceiptCard({ data }: Props) {
    const currency = data.currency || 'NGN';
    const formattedAmount = data.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <View style={s.card} collapsable={false}>
            <View style={s.header}>
                <View style={s.headerLeft}>
                    <Image source={require('../assets/images/logo.png')} style={s.logo} />
                    <Text style={s.brand}>EscrowITX</Text>
                </View>
                <Text style={s.headerRight}>Transaction Receipt</Text>
            </View>

            <View style={s.body}>
                <Text style={s.amountLabel}>Your transfer of</Text>
                <Text style={s.amount}>{currency} {formattedAmount}</Text>

                <View style={s.divider} />

                <Row label="Beneficiary Details" value={data.beneficiaryName || 'N/A'} />
                {!!data.bankName && <Row label="Bank" value={data.bankName} />}
                {!!data.accountNumber && <Row label="Account Number" value={data.accountNumber} />}
                <Row label="Sender's Details" value={data.senderName || 'N/A'} />
                <Row label="Transaction Status" value={data.status} />
                <Row label="Amount Sent" value={`${formattedAmount} ${currency}`} />
                {!!data.date && <Row label="Transaction Date" value={data.date} />}
                {!!data.reference && <Row label="Reference" value={data.reference} />}
            </View>

            <View style={s.footer}>
                <Text style={s.footerTxt}>Thank you for using EscrowITX.</Text>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: { backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden' },
    header: {
        backgroundColor: colors.text,
        paddingHorizontal: 20,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logo: { width: 24, height: 24, borderRadius: 6, resizeMode: 'contain' },
    brand: { color: '#fff', fontSize: 16, fontWeight: '800' },
    headerRight: { color: '#D1D5DB', fontSize: 13, fontWeight: '600' },
    body: { padding: 20 },
    amountLabel: { fontSize: 13, color: colors.gray, textAlign: 'center' },
    amount: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: 4, marginBottom: 16 },
    divider: { height: 1, backgroundColor: colors.grayLight, marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    rowLabel: { fontSize: 13, color: colors.gray, flex: 1 },
    rowValue: { fontSize: 13, fontWeight: '700', color: colors.text, flex: 1, textAlign: 'right' },
    footer: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#F9FAFB' },
    footerTxt: { fontSize: 11, color: colors.gray, textAlign: 'center' },
});

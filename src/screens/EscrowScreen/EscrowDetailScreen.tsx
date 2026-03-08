import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { EscrowStackParamList } from '../../navigation/types';
import { TransStatus } from '../../core/api/escrow.api';

type Nav = NativeStackNavigationProp<EscrowStackParamList, 'EscrowDetail'>;
type RouteType = any; // RouteProp<EscrowStackParamList, 'EscrowDetail'>;

export default function EscrowDetailScreen() {
    const navigation = useNavigation<Nav>();
    const route = useRoute<RouteType>();
    const e = route.params.escrow;

    const isBuy = e.excrowType === 0;
    const counterparty = isBuy ? e.sellerName : e.buyerName;

    const getStepProgress = () => {
        switch (e.transactionStatus) {
            case TransStatus.Pending:
            case TransStatus.In_Escrow:
            case TransStatus.OnHold: return 1;
            case TransStatus.BuyerDebited: return 2;
            case TransStatus.SellerDebited: return 3;
            case TransStatus.Completed: return 4;
            default: return 1;
        }
    };

    const getActionLabel = () => {
        // Basic logic mapping status to action to simplify
        if (isBuy) {
            if (e.transactionStatus === TransStatus.In_Escrow) return 'I Have Paid NGN';
            if (e.transactionStatus === TransStatus.SellerDebited) return 'Confirm Receipt';
        } else {
            if (e.transactionStatus === TransStatus.BuyerDebited) return 'Confirm Payment';
        }
        return null;
    };

    const currentStep = getStepProgress();
    const actionLbl = getActionLabel();

    const handleAction = () => {
        // Both buyer and seller confirmation usually require a PIN in EscrowITX design
        navigation.navigate('PinConfirm', { escrowId: e.id, isBuy });
    };

    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Escrow Order</Text>
                <View style={s.headerRight}>
                    {e.transactionStatus === TransStatus.Disputed && <View style={s.chipWarn}><Text style={s.chipWarnTxt}>Disputed</Text></View>}
                    {e.transactionStatus === TransStatus.Completed && <View style={s.chipSuccess}><Text style={s.chipSuccessTxt}>Done</Text></View>}
                </View>
            </View>

            <ScrollView style={s.body} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Progress Steps */}
                <View style={s.stepsWrap}>
                    <View style={s.step}><View style={[s.stepCircle, currentStep >= 1 ? s.done : s.todo]}><Icon name="checkmark" size={14} color="#FFF" /></View><Text style={s.stepLbl}>Created</Text></View>
                    <View style={[s.line, currentStep >= 2 && s.bgDone]} />
                    <View style={s.step}><View style={[s.stepCircle, currentStep >= 2 ? s.done : s.todo]}>{currentStep >= 2 ? <Icon name="checkmark" size={14} color="#FFF" /> : <Text style={s.todoNum}>2</Text>}</View><Text style={s.stepLbl}>Locked</Text></View>
                    <View style={[s.line, currentStep >= 3 && s.bgDone]} />
                    <View style={s.step}><View style={[s.stepCircle, currentStep >= 3 ? s.done : s.todo]}>{currentStep >= 3 ? <Icon name="checkmark" size={14} color="#FFF" /> : <Text style={s.todoNum}>3</Text>}</View><Text style={s.stepLbl}>Transfer</Text></View>
                    <View style={[s.line, currentStep >= 4 && s.bgDone]} />
                    <View style={s.step}><View style={[s.stepCircle, currentStep >= 4 ? s.done : s.todo]}>{currentStep >= 4 ? <Icon name="checkmark" size={14} color="#FFF" /> : <Text style={s.todoNum}>4</Text>}</View><Text style={s.stepLbl}>Confirmed</Text></View>
                </View>

                {/* Amount Card */}
                <View style={s.sumCard}>
                    <View style={s.sumHeader}>
                        <Text style={s.sumTitle}>{isBuy ? 'Buying GBP' : 'Selling GBP'}</Text>
                        <Text style={s.sumOrder}>Order #{e.id}</Text>
                    </View>
                    <Text style={s.sumTotal}>£{e.volume.toLocaleString()}</Text>
                    <View style={s.sumRow}><Text style={s.sumLbl}>Exchange Rate</Text><Text style={s.sumVal}>₦{e.rate.toLocaleString()}</Text></View>
                    <View style={s.sumRow}><Text style={s.sumLbl}>Naira Equivalent</Text><Text style={s.sumVal}>₦{e.amountEquivalent?.toLocaleString()}</Text></View>
                </View>

                {/* Counterparty info */}
                <Text style={s.sectionTitle}>{isBuy ? 'Seller' : 'Buyer'} Details</Text>
                <View style={s.cpCard}>
                    <View style={s.cpHeader}>
                        <View style={s.cpAvatar}><Icon name="person" size={20} color={colors.white} /></View>
                        <View>
                            <Text style={s.cpName}>{counterparty}</Text>
                            <Text style={s.cpRating}>100% completion rate</Text>
                        </View>
                    </View>
                    {isBuy && e.wallet && (
                        <View style={s.bankDetails}>
                            <Text style={s.bdTitle}>Please transfer NGN to:</Text>
                            <View style={s.bdRow}><Text style={s.bdLbl}>Bank</Text><Text style={s.bdVal}>{e.wallet.bankName || 'N/A'}</Text></View>
                            <View style={s.bdRow}><Text style={s.bdLbl}>Account #</Text><Text style={s.bdVal}>{e.wallet.accountNumber || 'N/A'}</Text></View>
                            <View style={s.bdRow}><Text style={s.bdLbl}>Account Name</Text><Text style={s.bdVal}>{e.wallet.accountName || 'N/A'}</Text></View>
                        </View>
                    )}
                </View>

                {/* Escrow Rule alert */}
                <View style={s.note}>
                    <Icon name="lock-closed" size={16} color={colors.success} />
                    <Text style={s.noteTxt}>The GBP is locked in EscrowITX until both parties confirm.</Text>
                </View>

            </ScrollView>

            {/* Fixed bottom actions */}
            <View style={s.footer}>
                {actionLbl ? (
                    <TouchableOpacity style={s.actionBtn} onPress={handleAction}>
                        <Text style={s.actionBtnTxt}>{actionLbl}</Text>
                    </TouchableOpacity>
                ) : null}

                {e.transactionStatus !== TransStatus.Completed && e.transactionStatus !== TransStatus.Disputed && e.transactionStatus !== TransStatus.Cancled && (
                    <TouchableOpacity
                        style={s.disputeBtn}
                        onPress={() => navigation.navigate('Dispute', { escrowId: e.id })}
                    >
                        <Text style={s.disputeBtnTxt}>File a Dispute</Text>
                    </TouchableOpacity>
                )}
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
        backgroundColor: colors.white
    },
    backBtn: { padding: 4, marginRight: 12 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text, flex: 1 },
    headerRight: { width: 60, alignItems: 'flex-end', justifyContent: 'center' },
    chipWarn: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    chipWarnTxt: { color: colors.danger, fontSize: 10, fontWeight: '700' },
    chipSuccess: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    chipSuccessTxt: { color: colors.success, fontSize: 10, fontWeight: '700' },
    body: { flex: 1, padding: 16 },
    stepsWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 8 },
    step: { alignItems: 'center', width: 60 },
    stepCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    done: { backgroundColor: colors.success },
    todo: { backgroundColor: colors.grayLight },
    todoNum: { fontSize: 12, fontWeight: '700', color: colors.gray },
    stepLbl: { fontSize: 11, color: colors.gray, fontWeight: '600' },
    line: { flex: 1, height: 2, backgroundColor: colors.grayLight, marginHorizontal: -10, marginBottom: 18 },
    bgDone: { backgroundColor: colors.success },
    sumCard: { backgroundColor: colors.white, padding: 20, borderRadius: 16, marginBottom: 24, elevation: 1 },
    sumHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    sumTitle: { fontSize: 14, color: colors.gray },
    sumOrder: { fontSize: 13, fontWeight: '600', color: colors.text },
    sumTotal: { fontSize: 32, fontWeight: '800', color: colors.blue, marginBottom: 16 },
    sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    sumLbl: { fontSize: 13, color: colors.text2 },
    sumVal: { fontSize: 13, fontWeight: '700', color: colors.text },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
    cpCard: { backgroundColor: colors.white, padding: 16, borderRadius: 16, marginBottom: 16, elevation: 1 },
    cpHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cpAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#c4b5fd', justifyContent: 'center', alignItems: 'center' },
    cpName: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 2 },
    cpRating: { fontSize: 12, color: colors.gray },
    bankDetails: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.grayLight },
    bdTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
    bdRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    bdLbl: { fontSize: 12, color: colors.gray },
    bdVal: { fontSize: 12, fontWeight: '600', color: colors.text },
    note: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 12, borderRadius: 10, gap: 10 },
    noteTxt: { fontSize: 12, color: colors.success, flex: 1 },
    footer: { padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.grayLight },
    actionBtn: { width: '100%', backgroundColor: colors.blue, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
    actionBtnTxt: { color: colors.white, fontSize: 16, fontWeight: '700' },
    disputeBtn: { width: '100%', paddingVertical: 12, alignItems: 'center' },
    disputeBtnTxt: { color: colors.danger, fontSize: 14, fontWeight: '600' }
});

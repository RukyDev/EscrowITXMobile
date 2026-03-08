import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';

const MOCK_NOTIFS: any[] = [];

export default function NotificationsScreen() {
    const navigation = useNavigation();
    const [filter, setFilter] = React.useState<'All' | 'Read' | 'Unread'>('All');
    const [notifications, setNotifications] = React.useState(MOCK_NOTIFS);

    const filtered = notifications.filter(n => {
        if (filter === 'Read') return n.read;
        if (filter === 'Unread') return !n.read;
        return true;
    });

    const handleClearAll = () => {
        Alert.alert('Clear All', 'Are you sure you want to clear all notifications?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => setNotifications([]) }
        ]);
    };

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={handleMarkAllRead}><Text style={s.headerAction}>Mark all read</Text></TouchableOpacity>
            </View>

            <View style={s.filterRow}>
                {['All', 'Unread', 'Read'].map((f: any) => (
                    <TouchableOpacity
                        key={f}
                        style={[s.filterBtn, filter === f && s.filterBtnActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[s.filterTxt, filter === f && s.filterTxtActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={s.clearBtn} onPress={handleClearAll}>
                    <Text style={s.clearBtnTxt}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={s.body}>
                {filtered.length === 0 ? (
                    <View style={s.empty}>
                        <Icon name="notifications-off-outline" size={48} color={colors.grayLight} />
                        <Text style={s.emptyTxt}>No notifications yet</Text>
                    </View>
                ) : (
                    filtered.map(n => (
                        <View key={n.id} style={[s.card, !n.read && s.cardUnread]}>
                            <View style={[s.iconBox, { backgroundColor: n.type === 'alert' ? '#FEF2F2' : n.type === 'success' ? '#F0FDF4' : '#EEF2FF' }]}>
                                <Icon
                                    name={n.type === 'alert' ? 'warning' : n.type === 'success' ? 'checkmark-circle' : 'information-circle'}
                                    size={20}
                                    color={n.type === 'alert' ? colors.danger : n.type === 'success' ? colors.success : colors.blue}
                                />
                            </View>
                            <View style={s.content}>
                                <Text style={s.title}>{n.title}</Text>
                                <Text style={s.msg}>{n.msg}</Text>
                                <Text style={s.time}>{n.time}</Text>
                            </View>
                            {!n.read && <View style={s.dot} />}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 16,
        paddingBottom: 16,
        backgroundColor: colors.white
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    headerAction: { fontSize: 12, color: colors.blue, fontWeight: '600' },
    filterRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.grayLight },
    filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8 },
    filterBtnActive: { backgroundColor: colors.blue },
    filterTxt: { fontSize: 12, color: colors.text2, fontWeight: '600' },
    filterTxtActive: { color: colors.white },
    clearBtn: { marginLeft: 'auto' },
    clearBtnTxt: { fontSize: 12, color: colors.danger, fontWeight: '600' },
    body: { flex: 1, padding: 16 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    emptyTxt: { marginTop: 12, color: colors.gray, fontSize: 14 },
    card: { flexDirection: 'row', backgroundColor: colors.white, padding: 16, borderRadius: 12, marginBottom: 12 },
    cardUnread: { backgroundColor: '#F8FAFF', borderWidth: 1, borderColor: 'rgba(26,63,216,0.1)' },
    iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    content: { flex: 1 },
    title: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
    msg: { fontSize: 12, color: colors.text2, lineHeight: 18, marginBottom: 6 },
    time: { fontSize: 10, color: colors.gray },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue, alignSelf: 'center', marginLeft: 8 }
});

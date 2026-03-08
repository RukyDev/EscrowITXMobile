import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking, Platform, StatusBar, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/auth.store';
import { ProfileStackParamList } from '../../navigation/types';
import LinearGradient from 'react-native-linear-gradient';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuthStore();
  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);

  console.log('[ProfileScreen] logoutModalVisible state:', logoutModalVisible);

  React.useEffect(() => {
    console.log('[ProfileScreen] Current User State:', JSON.stringify(user, null, 2));
  }, [user]);

  const handleLogout = () => {
    console.log('[ProfileScreen] Logout button clicked - Attempting DIRECT logout to bypass Modal/Alert issues');
    logout();
  };

  const getInitials = (ident: string) => {
    if (!ident || ident === 'User') return '??';
    const parts = ident.split(' ').filter(p => !!p);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return ident.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Premium Header */}
      <LinearGradient colors={['#0D1B40', '#1A3FD8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>Profile</Text>
        </View>

        <View style={s.profileCardRow}>
          <View style={s.avatar}>
            <Text style={s.avatarInitials}>{getInitials(user?.userName || user?.name || user?.fullName || '')}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{user?.userName || user?.name || user?.fullName || 'User'}</Text>
            <Text style={s.profileEmail}>{user?.emailAddress || '---'}</Text>
            <View style={s.statusBadge}>
              <Icon name="checkmark-circle" size={12} color={colors.success} style={{ marginRight: 4 }} />
              <Text style={s.statusText}>Verified Account</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* Menu Items */}
        <View style={s.menuSection}>
          <Text style={s.sectionTitle}>Account Settings</Text>

          <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate('EditProfile')}>
            <View style={[s.menuIconBox, { backgroundColor: '#EEF2FF' }]}>
              <Icon name="person" size={20} color={colors.blue} />
            </View>
            <Text style={s.menuItemTitle}>Personal Information</Text>
            <Icon name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate('Security')}>
            <View style={[s.menuIconBox, { backgroundColor: '#FFF7ED' }]}>
              <Icon name="lock-closed" size={20} color={colors.accent2} />
            </View>
            <Text style={s.menuItemTitle}>Security & Password</Text>
            <Icon name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={s.menuItem}>
            <View style={[s.menuIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Icon name="shield-checkmark" size={20} color={colors.success} />
            </View>
            <Text style={s.menuItemTitle}>Verification (KYC)</Text>
            <Icon name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
        </View>

        <View style={s.menuSection}>
          <Text style={s.sectionTitle}>Support & Legal</Text>

          <TouchableOpacity style={s.menuItem} onPress={() => Linking.openURL('https://www.escrowitx.com/help-center')}>
            <View style={[s.menuIconBox, { backgroundColor: colors.grayLight }]}>
              <Icon name="help-circle" size={20} color={colors.gray} />
            </View>
            <Text style={s.menuItemTitle}>Help Center</Text>
            <Icon name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={s.menuItem} onPress={() => Linking.openURL('https://www.escrowitx.com/terms')}>
            <View style={[s.menuIconBox, { backgroundColor: colors.grayLight }]}>
              <Icon name="document-text" size={20} color={colors.gray} />
            </View>
            <Text style={s.menuItemTitle}>Terms of Service</Text>
            <Icon name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color={colors.danger} style={{ marginRight: 8 }} />
          <Text style={s.logoutTxt}>Log Out</Text>
        </TouchableOpacity>

        <Text style={s.versionTxt}>EscrowITX v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="fade" onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalIcon}>
              <Icon name="log-out" size={32} color={colors.danger} />
            </View>
            <Text style={s.modalTitle}>Confirm Logout</Text>
            <Text style={s.modalText}>Are you sure you want to sign out of your account?</Text>

            <View style={s.modalButtons}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => {
                console.log('[ProfileScreen] Logout Modal - Cancel clicked');
                setLogoutModalVisible(false);
              }}>
                <Text style={s.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmBtn} onPress={() => {
                console.log('[ProfileScreen] Logout Modal - Confirm clicked');
                setLogoutModalVisible(false);
                logout();
              }}>
                <Text style={s.confirmBtnTxt}>Logout</Text>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: { marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.white },
  profileCardRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)' },
  avatarInitials: { fontSize: 24, fontWeight: '800', color: '#0D1B40' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: colors.white, marginBottom: 2 },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  statusBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(240, 253, 244, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600', color: colors.success },
  body: { flex: 1, padding: 16, marginTop: 10 },
  menuSection: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.gray, marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.grayLight },
  menuIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuItemTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 12, marginTop: 8, marginBottom: 24 },
  logoutTxt: { fontSize: 16, fontWeight: '700', color: colors.danger },
  versionTxt: { textAlign: 'center', fontSize: 12, color: colors.gray },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: colors.white, borderRadius: 24, padding: 32, alignItems: 'center' },
  modalIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 12 },
  modalText: { fontSize: 15, color: colors.gray, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelBtnTxt: { fontSize: 16, fontWeight: '700', color: colors.text },
  confirmBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, backgroundColor: colors.danger, alignItems: 'center' },
  confirmBtnTxt: { fontSize: 16, fontWeight: '700', color: colors.white },
});

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuthStore } from '../store/auth.store';
import { colors } from '../theme/colors';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ForgotPasswordSentScreen from '../screens/auth/ForgotPasswordSentScreen';

// Home (Dashboard) screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import NotificationsScreen from './../screens/dashboard/NotificationsScreen';

// Market screens
import AdsScreen from './../screens/AdsScreen/AdsScreen';
import BuyFromTraderScreen from './../screens/AdsScreen/BuyFromTraderScreen';
import SellToTraderScreen from './../screens/AdsScreen/SellToTraderScreen';
import CreateBuyAdScreen from './../screens/AdsScreen/CreateBuyAdScreen';
import CreateSellAdScreen from './../screens/AdsScreen/CreateSellAdScreen';
import AdSuccessScreen from './../screens/AdsScreen/AdSuccessScreen';
import EscrowCreatedScreen from './../screens/AdsScreen/EscrowCreatedScreen';
import PersonalAdsScreen from './../screens/AdsScreen/PersonalAdsScreen';
import EditAdScreen from './../screens/AdsScreen/EditAdScreen';

// Escrow screens
import EscrowScreen from './../screens/EscrowScreen/EscrowScreen';
import EscrowDetailScreen from './../screens/EscrowScreen/EscrowDetailScreen';
import PinConfirmScreen from './../screens/EscrowScreen/PinConfirmScreen';
import EscrowSuccessScreen from './../screens/EscrowScreen/EscrowSuccessScreen';
import DisputeScreen from './../screens/EscrowScreen/DisputeScreen';
import DisputeSubmittedScreen from './../screens/EscrowScreen/DisputeSubmittedScreen';

// Wallet screens
import WalletScreen from './../screens/WalletScreen/WalletScreen';
import DepositScreen from './../screens/WalletScreen/DepositScreen';
import WithdrawScreen from './../screens/WalletScreen/WithdrawScreen';
import WithdrawPinScreen from './../screens/WalletScreen/WithdrawPinScreen';
import WithdrawSuccessScreen from './../screens/WalletScreen/WithdrawSuccessScreen';

// Profile
import ProfileScreen from './../screens/ProfileScreen/ProfileScreen';
import EditProfileScreen from './../screens/ProfileScreen/EditProfileScreen';
import ChangePasswordScreen from './../screens/ProfileScreen/ChangePasswordScreen';
import SecurityScreen from './../screens/ProfileScreen/SecurityScreen';

import {
  AuthStackParamList,
  HomeStackParamList,
  MarketStackParamList,
  EscrowStackParamList,
  WalletStackParamList,
  ProfileStackParamList,
} from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const MarketStack = createNativeStackNavigator<MarketStackParamList>();
const EscrowStack = createNativeStackNavigator<EscrowStackParamList>();
const WalletStack = createNativeStackNavigator<WalletStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="OTP" component={OtpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ForgotPasswordSent" component={ForgotPasswordSentScreen} />
    </AuthStack.Navigator>
  );
}

function HomeNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
    </HomeStack.Navigator>
  );
}

function MarketNavigator() {
  return (
    <MarketStack.Navigator>
      <MarketStack.Screen name="Marketplace" component={AdsScreen} options={{ headerShown: false }} />
      <MarketStack.Screen name="PersonalAds" component={PersonalAdsScreen} options={{ headerShown: false }} />
      <MarketStack.Screen name="BuyFromTrader" component={BuyFromTraderScreen} options={{ headerShown: false }} />
      <MarketStack.Screen name="SellToTrader" component={SellToTraderScreen} options={{ headerShown: false }} />
      <MarketStack.Screen name="CreateBuyAd" component={CreateBuyAdScreen} options={{ headerShown: false }} />
      <MarketStack.Screen name="CreateSellAd" component={CreateSellAdScreen} options={{ headerShown: false }} />
      <MarketStack.Screen name="EditAd" component={EditAdScreen} options={{ headerShown: false }} />
      <MarketStack.Screen name="AdSuccess" component={AdSuccessScreen} options={{ headerShown: false }} />
      <MarketStack.Screen name="EscrowCreated" component={EscrowCreatedScreen} options={{ headerShown: false }} />
    </MarketStack.Navigator>
  );
}

function EscrowNavigator() {
  return (
    <EscrowStack.Navigator>
      <EscrowStack.Screen name="EscrowList" component={EscrowScreen} options={{ headerShown: false }} />
      <EscrowStack.Screen name="EscrowDetail" component={EscrowDetailScreen} options={{ headerShown: false }} />
      <EscrowStack.Screen name="PinConfirm" component={PinConfirmScreen} options={{ headerShown: false }} />
      <EscrowStack.Screen name="EscrowSuccess" component={EscrowSuccessScreen} options={{ headerShown: false }} />
      <EscrowStack.Screen name="Dispute" component={DisputeScreen} options={{ headerShown: false }} />
      <EscrowStack.Screen name="DisputeSubmitted" component={DisputeSubmittedScreen} options={{ headerShown: false }} />
    </EscrowStack.Navigator>
  );
}

function WalletNavigator() {
  return (
    <WalletStack.Navigator>
      <WalletStack.Screen name="WalletHome" component={WalletScreen} options={{ headerShown: false }} />
      <WalletStack.Screen name="Deposit" component={DepositScreen} options={{ headerShown: false }} />
      <WalletStack.Screen name="Withdraw" component={WithdrawScreen} options={{ headerShown: false }} />
      <WalletStack.Screen name="WithdrawPin" component={WithdrawPinScreen} options={{ headerShown: false }} />
      <WalletStack.Screen name="WithdrawSuccess" component={WithdrawSuccessScreen} options={{ headerShown: false }} />
    </WalletStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Security" component={SecurityScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 4,
          backgroundColor: colors.white,
          borderTopColor: colors.grayLight,
        },
        unmountOnBlur: true,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => {
          const icons: Record<string, string> = {
            Home: focused ? 'home' : 'home-outline',
            Market: focused ? 'storefront' : 'storefront-outline',
            Escrow: focused ? 'shield-check' : 'shield-check-outline',
            Wallet: focused ? 'wallet' : 'wallet-outline',
            Profile: focused ? 'account' : 'account-outline',
          };
          return <Icon name={icons[route.name] || 'circle'} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Market" component={MarketNavigator} />
      <Tab.Screen name="Escrow" component={EscrowNavigator} />
      <Tab.Screen name="Wallet" component={WalletNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, bootstrap, isLoading } = useAuthStore();

  useEffect(() => { bootstrap(); }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
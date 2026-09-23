import React from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '../navigation/RootNavigator';
import { useIdleLogout } from '../hooks/useIdleLogout';

export default function App() {
  const recordActivity = useIdleLogout();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <View
        style={{ flex: 1 }}
        onStartShouldSetResponderCapture={() => {
          recordActivity();
          return false;
        }}
      >
        <RootNavigator />
      </View>
    </SafeAreaProvider>
  );
}
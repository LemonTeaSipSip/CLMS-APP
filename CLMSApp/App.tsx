import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import GenerateQRScreen from './src/screens/GenerateQRScreen';
import PayScreen from './src/screens/PayScreen';
import RepaymentScreen from './src/screens/RepaymentScreen';
import StatementScreen from './src/screens/StatementScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {backgroundColor: '#0a1628'},
          headerTintColor: '#4f8ef7',
          headerTitleStyle: {fontWeight: 'bold', color: '#fff'},
          contentStyle: {backgroundColor: '#0a1628'},
        }}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{title: 'CLMS Dashboard', headerBackVisible: false}}
        />
        <Stack.Screen
          name="GenerateQR"
          component={GenerateQRScreen}
          options={{title: 'Generate QR'}}
        />
        <Stack.Screen
          name="Pay"
          component={PayScreen}
          options={{title: 'Pay via UPI'}}
        />
        <Stack.Screen
          name="Repayment"
          component={RepaymentScreen}
          options={{title: 'Repay Credit'}}
        />
        <Stack.Screen
          name="Statement"
          component={StatementScreen}
          options={{title: 'Statement'}}
        />
        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{title: 'Scan QR', headerShown: false}}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{title: 'Create Account'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React, {useState, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {API} from '../config/api';
import {popScannedQR} from '../utils/qrStore';

const MCC_OPTIONS = [
  {label: 'Education (5912)', value: '5912'},
  {label: 'Books (5942)', value: '5942'},
  {label: 'Grocery (5411)', value: '5411'},
  {label: 'Restaurant (5812)', value: '5812'},
  {label: 'Electronics (5732)', value: '5732'},
];

export default function PayScreen({route, navigation}) {
  const {token, user, account} = route.params;
  const [merchantName, setMerchantName] = useState('');
  const [amount, setAmount] = useState('');
  const [mcc, setMcc] = useState('5912');
  const [upiPin, setUpiPin] = useState('');
  const [loading, setLoading] = useState(false);

  const available = account ? parseFloat(account.available_limit) : 0;

  useFocusEffect(useCallback(() => {
    const scanned = popScannedQR();
    if (!scanned) return;
    if (scanned.merchantName) setMerchantName(scanned.merchantName);
    if (scanned.amount) setAmount(String(scanned.amount));
    if (scanned.mcc) setMcc(scanned.mcc);
  }, []));

  const openScanner = () => {
    navigation.navigate('QRScanner');
  };

  const handlePay = async () => {
    if (!merchantName || !amount || !upiPin) {
      Alert.alert('Error', 'Fill all required fields');
      return;
    }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Error', 'Enter a valid amount');
      return;
    }
    if (amt > available) {
      Alert.alert('Insufficient Credit', `Available limit: ₹${available.toFixed(2)}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API.pay, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          account_id: user.account_id,
          upi_pin: upiPin,
          amount: amt,
          merchant_name: merchantName,
          mcc,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.reasons?.join(', ') || 'Payment failed');
      Alert.alert(
        'Payment Successful',
        `₹${amt} paid to ${merchantName}\nRemaining limit: ₹${data.remaining_limit}`,
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    } catch (err) {
      Alert.alert('Payment Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pay via UPI Credit</Text>
      <Text style={styles.available}>Available: ₹{available.toFixed(2)}</Text>

      <TouchableOpacity style={styles.scanBtn} onPress={openScanner}>
        <Text style={styles.scanBtnText}>📷  Scan QR Code</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Merchant Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. College Canteen"
        placeholderTextColor="#999"
        value={merchantName}
        onChangeText={setMerchantName}
      />

      <Text style={styles.label}>Amount (₹) *</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor="#999"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Category (MCC)</Text>
      <View style={styles.mccRow}>
        {MCC_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.mccBtn, mcc === opt.value && styles.mccBtnActive]}
            onPress={() => setMcc(opt.value)}>
            <Text style={[styles.mccBtnText, mcc === opt.value && styles.mccBtnTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>UPI PIN *</Text>
      <TextInput
        style={styles.input}
        placeholder="6-digit PIN"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        value={upiPin}
        onChangeText={setUpiPin}
      />

      <TouchableOpacity style={styles.btn} onPress={handlePay} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Pay ₹{amount || '0'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a1628', padding: 20},
  title: {fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4, marginTop: 10},
  available: {color: '#4caf50', fontSize: 13, marginBottom: 20},
  label: {color: '#8899aa', fontSize: 13, marginBottom: 6},
  input: {
    backgroundColor: '#1a2a3a',
    color: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  mccRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16},
  mccBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1a2a3a',
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  mccBtnActive: {borderColor: '#4f8ef7', backgroundColor: '#1a3060'},
  mccBtnText: {color: '#8899aa', fontSize: 12},
  mccBtnTextActive: {color: '#4f8ef7'},
  scanBtn: {
    backgroundColor: '#1a2a3a',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4f8ef7',
  },
  scanBtnText: {color: '#4f8ef7', fontSize: 15, fontWeight: '600'},
  btn: {
    backgroundColor: '#4caf50',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  btnText: {color: '#fff', fontSize: 17, fontWeight: '600'},
});

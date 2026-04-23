import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import {API} from '../config/api';

const MCC_OPTIONS = [
  {label: 'Education (5912)', value: '5912'},
  {label: 'Books & Stationery (5942)', value: '5942'},
  {label: 'Grocery (5411)', value: '5411'},
  {label: 'Restaurant (5812)', value: '5812'},
  {label: 'Electronics (5732)', value: '5732'},
];

export default function GenerateQRScreen({route}) {
  const {token} = route.params;
  const [merchantName, setMerchantName] = useState('');
  const [amount, setAmount] = useState('');
  const [mcc, setMcc] = useState('5912');
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);

  const handleGenerate = async () => {
    if (!merchantName || !amount) {
      Alert.alert('Error', 'Enter merchant name and amount');
      return;
    }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Error', 'Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API.generateQR, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({merchant_name: merchantName, amount: amt, mcc}),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to generate QR');
      setQrData(data);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Generate QR Code</Text>

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

      <TouchableOpacity style={styles.btn} onPress={handleGenerate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Generate QR</Text>}
      </TouchableOpacity>

      {qrData && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>QR Ready — Show to Customer</Text>
          {qrData.qr_code ? (
            <Image
              source={{uri: qrData.qr_code}}
              style={styles.qrImage}
              resizeMode="contain"
            />
          ) : null}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{qrData.order?.order_id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Merchant</Text>
            <Text style={styles.infoValue}>{qrData.order?.merchant_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Amount</Text>
            <Text style={styles.infoValue}>₹{qrData.order?.amount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, {color: '#f9a825'}]}>{qrData.order?.status?.toUpperCase()}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a1628', padding: 20},
  title: {fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20, marginTop: 10},
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
  mccRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20},
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
  btn: {
    backgroundColor: '#4f8ef7',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  btnText: {color: '#fff', fontSize: 16, fontWeight: '600'},
  result: {
    backgroundColor: '#1a2a3a',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a3a4a',
    marginBottom: 30,
  },
  resultTitle: {fontSize: 14, fontWeight: 'bold', color: '#4f8ef7', marginBottom: 14, textAlign: 'center'},
  qrImage: {width: 220, height: 220, alignSelf: 'center', marginBottom: 16, borderRadius: 8, backgroundColor: '#fff'},
  infoRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
  infoLabel: {color: '#8899aa', fontSize: 13},
  infoValue: {color: '#fff', fontSize: 13, fontWeight: '500', flex: 1, textAlign: 'right'},
});

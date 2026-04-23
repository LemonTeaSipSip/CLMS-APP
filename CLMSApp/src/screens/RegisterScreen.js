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
} from 'react-native';
import {API} from '../config/api';

const LOAN_TYPES = [
  {label: 'Education Loan', value: 'EDUCATION_LOAN'},
  {label: 'Consumer Loan', value: 'CONSUMER_LOAN'},
  {label: 'Agriculture Loan', value: 'AGRI_LOAN'},
];

export default function RegisterScreen({navigation}) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiPin, setUpiPin] = useState('');
  const [loanType, setLoanType] = useState('EDUCATION_LOAN');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !mobile.trim() || !upiId.trim() || !upiPin.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      Alert.alert('Error', 'Enter a valid 10-digit mobile number');
      return;
    }
    if (!/^\d{4,6}$/.test(upiPin)) {
      Alert.alert('Error', 'UPI PIN must be 4–6 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API.register, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: name.trim(), mobile, upi_id: upiId.trim(), loan_type: loanType, upi_pin: upiPin}),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Registration failed');
      Alert.alert('Registration Successful', data.message, [
        {text: 'Login Now', onPress: () => navigation.replace('Login')},
      ]);
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Credit limit: ₹25,000 on approval</Text>

      <Text style={styles.label}>Full Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Shrey Sharma"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Mobile Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="10-digit mobile"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        maxLength={10}
        value={mobile}
        onChangeText={setMobile}
      />

      <Text style={styles.label}>UPI ID *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. name@upi"
        placeholderTextColor="#999"
        autoCapitalize="none"
        value={upiId}
        onChangeText={setUpiId}
      />

      <Text style={styles.label}>UPI PIN * (4–6 digits)</Text>
      <TextInput
        style={styles.input}
        placeholder="Set your UPI PIN"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        value={upiPin}
        onChangeText={setUpiPin}
      />

      <Text style={styles.label}>Loan Type *</Text>
      <View style={styles.loanRow}>
        {LOAN_TYPES.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.loanBtn, loanType === opt.value && styles.loanBtnActive]}
            onPress={() => setLoanType(opt.value)}>
            <Text style={[styles.loanBtnText, loanType === opt.value && styles.loanBtnTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink} onPress={() => navigation.goBack()}>
        <Text style={styles.loginLinkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a1628', padding: 24},
  title: {fontSize: 26, fontWeight: 'bold', color: '#fff', marginTop: 40, marginBottom: 4},
  subtitle: {color: '#8899aa', fontSize: 13, marginBottom: 28},
  label: {color: '#8899aa', fontSize: 13, marginBottom: 6},
  input: {
    backgroundColor: '#1a2a3a',
    color: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  loanRow: {gap: 8, marginBottom: 24},
  loanBtn: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#1a2a3a',
    borderWidth: 1,
    borderColor: '#2a3a4a',
    alignItems: 'center',
  },
  loanBtnActive: {borderColor: '#4f8ef7', backgroundColor: '#1a3060'},
  loanBtnText: {color: '#8899aa', fontSize: 14},
  loanBtnTextActive: {color: '#4f8ef7', fontWeight: '600'},
  btn: {
    backgroundColor: '#4f8ef7',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnText: {color: '#fff', fontSize: 17, fontWeight: '600'},
  loginLink: {alignItems: 'center', marginBottom: 40},
  loginLinkText: {color: '#8899aa', fontSize: 14},
});

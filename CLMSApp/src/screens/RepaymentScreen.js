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

export default function RepaymentScreen({route, navigation}) {
  const {token, user, account} = route.params;
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const total = account ? parseFloat(account.total_limit) : 0;
  const available = account ? parseFloat(account.available_limit) : 0;
  const outstanding = (total - available).toFixed(2);

  const handleRepay = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Error', 'Enter a valid amount');
      return;
    }
    if (amt > parseFloat(outstanding)) {
      Alert.alert('Error', `Cannot repay more than outstanding ₹${outstanding}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API.repay, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          account_id: user.account_id,
          amount: amt,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Repayment failed');
      Alert.alert(
        'Repayment Successful',
        `₹${amt} repaid\nNew available limit: ₹${data.new_available_limit}`,
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    } catch (err) {
      Alert.alert('Repayment Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Repay Credit</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Outstanding Amount</Text>
        <Text style={styles.summaryAmount}>₹{outstanding}</Text>
        <Text style={styles.summaryMeta}>Total Limit: ₹{total.toFixed(2)}  |  Available: ₹{available.toFixed(2)}</Text>
      </View>

      <Text style={styles.label}>Repayment Amount (₹) *</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor="#999"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity
        style={styles.quickBtn}
        onPress={() => setAmount(outstanding)}>
        <Text style={styles.quickBtnText}>Pay Full Outstanding ₹{outstanding}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={handleRepay} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Repay ₹{amount || '0'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a1628', padding: 20},
  title: {fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20, marginTop: 10},
  summaryCard: {
    backgroundColor: '#1a2a3a',
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  summaryLabel: {color: '#8899aa', fontSize: 13},
  summaryAmount: {fontSize: 30, fontWeight: 'bold', color: '#f44336', marginTop: 4},
  summaryMeta: {color: '#8899aa', fontSize: 11, marginTop: 8},
  label: {color: '#8899aa', fontSize: 13, marginBottom: 6},
  input: {
    backgroundColor: '#1a2a3a',
    color: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  quickBtn: {
    backgroundColor: '#1a2a3a',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4f8ef7',
  },
  quickBtnText: {color: '#4f8ef7', fontSize: 13},
  btn: {
    backgroundColor: '#4f8ef7',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  btnText: {color: '#fff', fontSize: 17, fontWeight: '600'},
});

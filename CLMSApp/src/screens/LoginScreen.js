import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {API} from '../config/api';

export default function LoginScreen({navigation}) {
  const [mobile, setMobile] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!mobile || !upiId) {
      Alert.alert('Error', 'Enter mobile number and UPI ID');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API.login, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({mobile, upi_id: upiId}),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Login failed');

      // Fetch account_id for this user
      const accRes = await fetch(API.accountByUser(data.user.id), {
        headers: {Authorization: `Bearer ${data.token}`},
      });
      const accData = await accRes.json();
      if (!accRes.ok || !accData.success) throw new Error('Failed to load account');

      const user = {
        ...data.user,
        account_id: accData.data.id,
      };

      navigation.replace('Dashboard', {token: data.token, user});
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CLMS</Text>
      <Text style={styles.subtitle}>Credit Line Management System</Text>

      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        maxLength={10}
        value={mobile}
        onChangeText={setMobile}
      />
      <TextInput
        style={styles.input}
        placeholder="UPI ID (e.g. shrey@upi)"
        placeholderTextColor="#999"
        autoCapitalize="none"
        value={upiId}
        onChangeText={setUpiId}
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLinkText}>New user? Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
    justifyContent: 'center',
    padding: 28,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4f8ef7',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#8899aa',
    textAlign: 'center',
    marginBottom: 40,
  },
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
  btn: {
    backgroundColor: '#4f8ef7',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {color: '#fff', fontSize: 17, fontWeight: '600'},
  registerLink: {alignItems: 'center', marginTop: 20},
  registerLinkText: {color: '#4f8ef7', fontSize: 14},
});

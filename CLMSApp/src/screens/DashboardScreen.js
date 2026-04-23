import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {API} from '../config/api';

export default function DashboardScreen({route, navigation}) {
  const {token, user} = route.params;
  const [account, setAccount] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAccount = useCallback(async () => {
    try {
      const res = await fetch(API.account(user.account_id), {
        headers: {Authorization: `Bearer ${token}`},
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load account');
      setAccount(json.data);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [token, user.account_id]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccount();
    setRefreshing(false);
  };

  const total = account ? parseFloat(account.total_limit) : 0;
  const available = account ? parseFloat(account.available_limit) : 0;
  const used = (total - available).toFixed(2);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.greeting}>Hello, {user.name?.split(' ')[0]} 👋</Text>
      <Text style={styles.upiId}>{user.upi_id}</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Available Credit</Text>
        <Text style={styles.creditAmount}>₹{available.toFixed(2)}</Text>
        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.metaLabel}>Total Limit</Text>
            <Text style={styles.metaValue}>₹{total.toFixed(2)}</Text>
          </View>
          <View style={styles.half}>
            <Text style={styles.metaLabel}>Used</Text>
            <Text style={styles.metaValue}>₹{used}</Text>
          </View>
        </View>
        <View style={[styles.row, {marginTop: 8}]}>
          <View style={styles.half}>
            <Text style={styles.metaLabel}>Loan Type</Text>
            <Text style={styles.metaValue}>{account?.loan_type ?? '—'}</Text>
          </View>
          <View style={styles.half}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={[styles.metaValue, {color: account?.status === 'ACTIVE' ? '#4caf50' : '#f44336'}]}>
              {account?.status ?? '—'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        {[
          {label: 'Generate QR', screen: 'GenerateQR', icon: '📷'},
          {label: 'Pay via UPI', screen: 'Pay', icon: '💸'},
          {label: 'Repay', screen: 'Repayment', icon: '🔄'},
          {label: 'Statement', screen: 'Statement', icon: '📄'},
        ].map(item => (
          <TouchableOpacity
            key={item.screen}
            style={styles.tile}
            onPress={() => navigation.navigate(item.screen, {token, user, account})}>
            <Text style={styles.tileIcon}>{item.icon}</Text>
            <Text style={styles.tileLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a1628', padding: 20},
  greeting: {fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 10},
  upiId: {fontSize: 13, color: '#4f8ef7', marginBottom: 20},
  card: {
    backgroundColor: '#1a2a3a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  cardLabel: {color: '#8899aa', fontSize: 13, marginBottom: 4},
  creditAmount: {fontSize: 36, fontWeight: 'bold', color: '#4f8ef7', marginBottom: 16},
  row: {flexDirection: 'row'},
  half: {flex: 1},
  metaLabel: {color: '#8899aa', fontSize: 12},
  metaValue: {color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 2},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 30},
  tile: {
    width: '46%',
    backgroundColor: '#1a2a3a',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  tileIcon: {fontSize: 28, marginBottom: 8},
  tileLabel: {color: '#fff', fontSize: 14, fontWeight: '500'},
});

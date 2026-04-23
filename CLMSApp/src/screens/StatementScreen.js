import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {API} from '../config/api';

function TxItem({item}) {
  const isRepayment = item.merchant_name === 'REPAYMENT';
  const amount = parseFloat(item.amount || 0).toFixed(2);
  const date = item.created_at
    ? new Date(item.created_at).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  const statusColor = item.status === 'SUCCESS' ? '#4caf50'
    : item.status === 'REJECTED' ? '#f44336' : '#f9a825';

  return (
    <View style={styles.txItem}>
      <View style={styles.txLeft}>
        <Text style={styles.txMerchant}>{item.merchant_name || '—'}</Text>
        {item.rejection_reason ? (
          <Text style={styles.txRejection} numberOfLines={1}>{item.rejection_reason}</Text>
        ) : null}
        <Text style={styles.txDate}>{date}</Text>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, {color: isRepayment ? '#4caf50' : '#fff'}]}>
          {isRepayment ? '+' : '-'}₹{amount}
        </Text>
        <Text style={[styles.txStatus, {color: statusColor}]}>{item.status}</Text>
      </View>
    </View>
  );
}

export default function StatementScreen({route}) {
  const {token, user} = route.params;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatement = useCallback(async () => {
    try {
      const res = await fetch(API.statement(user.account_id), {
        headers: {Authorization: `Bearer ${token}`},
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load statement');
      setTransactions(data.data || []);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user.account_id]);

  useEffect(() => {
    fetchStatement();
  }, [fetchStatement]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatement();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f8ef7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Last 10 Transactions</Text>
      {transactions.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({item}) => <TxItem item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a1628', padding: 20},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: {fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 16, marginTop: 10},
  emptyText: {color: '#8899aa', fontSize: 15},
  txItem: {
    backgroundColor: '#1a2a3a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  txLeft: {flex: 1, marginRight: 12},
  txMerchant: {color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 2},
  txRejection: {color: '#f44336', fontSize: 11, marginBottom: 2},
  txDate: {color: '#8899aa', fontSize: 11},
  txRight: {alignItems: 'flex-end'},
  txAmount: {fontSize: 15, fontWeight: 'bold'},
  txStatus: {fontSize: 11, marginTop: 2},
});

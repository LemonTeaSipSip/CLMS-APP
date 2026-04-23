import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {Camera} from 'react-native-camera-kit';
import {setScannedQR} from '../utils/qrStore';

async function requestCameraPermission() {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Camera Permission',
      message: 'CLMS needs camera access to scan QR codes',
      buttonPositive: 'Allow',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export default function QRScannerScreen({navigation, route}) {
  const scanned = useRef(false);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    requestCameraPermission().then(setHasPermission);
  }, []);

  const handleScan = ({nativeEvent}) => {
    if (scanned.current) return;
    const raw = nativeEvent?.codeStringValue || '';
    if (!raw) return;
    scanned.current = true;

    const params = {};
    try {
      const url = new URL(raw);
      url.searchParams.forEach((v, k) => {
        params[k] = v;
      });
    } catch {
      const qs = raw.includes('?') ? raw.split('?')[1] : raw;
      qs.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }

    setScannedQR({
      merchantName: params.pn || params.merchant_name || '',
      amount: params.am || params.amount || '',
      mcc: params.mcc || '5912',
    });
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Requesting camera permission…</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Camera permission denied.</Text>
        <Text style={styles.sub}>
          Go to Settings → Apps → CLMS → Permissions → Camera and allow it.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        scanBarcode
        onReadCode={handleScan}
        allowedBarcodeTypes={['qr']}
        focusMode="on"
      />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.frame} />
      </View>
      <View style={styles.hintBox}>
        <Text style={styles.hint}>Point at a UPI QR code to scan</Text>
      </View>
      <TouchableOpacity
        style={styles.cancel}
        onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: '#4f8ef7',
    borderRadius: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a1628',
    padding: 24,
  },
  msg: {color: '#fff', fontSize: 15, marginBottom: 10, textAlign: 'center'},
  sub: {color: '#8899aa', fontSize: 13, textAlign: 'center', marginBottom: 20},
  btn: {
    backgroundColor: '#4f8ef7',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
  },
  btnText: {color: '#fff', fontWeight: '600'},
  hintBox: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  hint: {color: '#fff', fontSize: 13},
  cancel: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelText: {color: '#fff', fontSize: 15},
});

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import * as attendanceApi from '@/services/attendanceApi';

const QRScanner: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const processingRef = useRef(false);

  useEffect(() => {
    if (permission && !permission.granted) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned || processingRef.current) return;
      processingRef.current = true;
      setScanned(true);

      // Expected QR format: "session:<sessionId>:<qrCode>"
      const parts = data.split(':');
      if (parts.length >= 3 && parts[0] === 'session') {
        const sid = parts[1] ?? '';
        const qrCode = parts.slice(2).join(':');
        setSessionId(sid);
        setSubmitting(true);
        setResultMessage(null);
        setResultError(null);

        attendanceApi
          .checkInWithQR(sid, qrCode)
          .then(() => {
            setResultMessage('✅ Checked in successfully!');
          })
          .catch((err: unknown) => {
            setResultError(
              err instanceof Error ? err.message : 'Check-in failed',
            );
          })
          .finally(() => {
            setSubmitting(false);
          });
      } else {
        // Treat entire QR data as a qrCode string if sessionId is already known
        setResultError(
          'Invalid QR format. Expected format: session:<id>:<qrCode>',
        );
      }
    },
    [scanned],
  );

  const handleReset = () => {
    setScanned(false);
    setSessionId(null);
    setResultMessage(null);
    setResultError(null);
    processingRef.current = false;
  };

  if (!permission) {
    return <LoadingSpinner message="Requesting camera permission..." />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required to scan QR codes.
        </Text>
        <Button title="Grant Permission" onPress={() => { void requestPermission(); }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!scanned ? (
        <>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
          <View style={styles.overlay}>
            <View style={styles.scanBox} />
            <Text style={styles.hint}>Point camera at QR code</Text>
          </View>
        </>
      ) : (
        <View style={styles.resultContainer}>
          {submitting ? (
            <LoadingSpinner message="Checking in..." />
          ) : (
            <>
              {resultMessage ? (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>{resultMessage}</Text>
                  {sessionId ? (
                    <Text style={styles.sessionText}>Session: {sessionId}</Text>
                  ) : null}
                </View>
              ) : null}
              {resultError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>❌ {resultError}</Text>
                </View>
              ) : null}
              <Button
                title="Scan Again"
                onPress={handleReset}
                style={styles.resetButton}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  centeredContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    marginBottom: 20,
    padding: 20,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  permissionText: {
    color: '#374151',
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  resetButton: {
    marginHorizontal: 20,
  },
  resultContainer: {
    backgroundColor: '#F9FAFB',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  scanBox: {
    borderColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 3,
    height: 240,
    width: 240,
  },
  sessionText: {
    color: '#065F46',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    marginBottom: 20,
    padding: 20,
  },
  successText: {
    color: '#065F46',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default QRScanner;

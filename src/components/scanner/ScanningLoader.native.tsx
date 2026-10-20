import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LOADING_STEPS = [
  "📸 Uploading image securely...",
  "🔍 Analyzing machine structure & cables...",
  "⚖️ Checking weight stacks and pads...",
  "📋 Identifying gym machine & equipment..."
];

export default function ScanningLoader({ isScanning }: { isScanning: boolean }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isScanning) {
      setCurrentStepIndex(0);
      interval = setInterval(() => {
        setCurrentStepIndex((prevIndex) => 
          (prevIndex + 1) % LOADING_STEPS.length
        );
      }, 2500); // Changes message every 2.5 seconds
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.title}>AI Vision Scanning</Text>
        <Text style={styles.stepText}>{LOADING_STEPS[currentStepIndex]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

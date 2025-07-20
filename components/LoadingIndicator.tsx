import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { ProcessingStep } from '@/types/scanner';

interface LoadingIndicatorProps {
  steps: ProcessingStep[];
  currentStep: number;
  progress: number;
  message?: string;
}

export function LoadingIndicator({ steps, currentStep, progress, message }: LoadingIndicatorProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${interpolate(progress, [0, 100], [0, 100])}%`,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, animatedStyle]}>
        <View style={styles.spinnerInner} />
      </Animated.View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressBarStyle]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      {message && <Text style={styles.message}>{message}</Text>}

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepRow}>
            <View style={[
              styles.stepIndicator,
              step.completed && styles.stepCompleted,
              index === currentStep && styles.stepCurrent,
            ]}>
              {step.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[
              styles.stepLabel,
              step.completed && styles.stepLabelCompleted,
              index === currentStep && styles.stepLabelCurrent,
            ]}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#e0e0e0',
    borderTopColor: '#007AFF',
    marginBottom: 20,
  },
  spinnerInner: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: 'transparent',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepsContainer: {
    width: '100%',
    maxWidth: 300,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepCurrent: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  stepLabelCompleted: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  stepLabelCurrent: {
    color: '#007AFF',
    fontWeight: '500',
  },
});
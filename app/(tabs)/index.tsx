import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, FileText, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ScannerState, ScanResult, ProcessingStep } from '@/types/scanner';
import { pickImageFromGallery, captureImageFromCamera, generateImageId } from '@/utils/image';
import { extractTextFromImage } from '@/utils/api';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ImagePreview } from '@/components/ImagePreview';
import { ScanResult as ScanResultComponent } from '@/components/ScanResult';

const PROCESSING_STEPS: ProcessingStep[] = [
  { id: 'upload', label: 'Uploading image...', completed: false, progress: 0 },
  { id: 'analyze', label: 'Analyzing content...', completed: false, progress: 0 },
  { id: 'extract', label: 'Extracting text...', completed: false, progress: 0 },
  { id: 'process', label: 'Processing results...', completed: false, progress: 0 },
];

export default function ScannerScreen() {
  // One-tap scan with camera: open camera, scan, and show result
  const handleScanWithCamera = async () => {
    try {
      resetState();
      setScannerState(prev => ({ ...prev, isLoading: true }));
      updateProgress(10, 0);
      const result = await captureImageFromCamera();
      if (result) {
        setSelectedImage(result.uri);
        updateProgress(30, 1);
        // Upload and extract text
        const apiResult = await extractTextFromImage(result.uri);
        updateProgress(80, 2);
        if (apiResult.success && apiResult.data) {
          setScannerState(prev => ({ ...prev, isLoading: false, result: {
            id: generateImageId(),
            text: apiResult.data?.text ?? '',
            confidence: apiResult.data?.confidence ?? 0,
            timestamp: new Date(),
            imageUri: result.uri,
          }}));
          updateProgress(100, 3);
        } else {
          setScannerState(prev => ({ ...prev, isLoading: false, error: apiResult.error || 'Failed to extract text' }));
        }
      } else {
        setScannerState(prev => ({ ...prev, isLoading: false, error: 'No image captured' }));
      }
    } catch (error) {
      setScannerState(prev => ({ ...prev, isLoading: false, error: error instanceof Error ? error.message : 'Failed to scan image' }));
    }
  };
  const [scannerState, setScannerState] = useState<ScannerState>({
    isLoading: false,
    error: null,
    progress: 0,
    result: null,
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(PROCESSING_STEPS);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const scaleAnim = useSharedValue(1);
  const opacityAnim = useSharedValue(1);

  const resetState = useCallback(() => {
    setScannerState({
      isLoading: false,
      error: null,
      progress: 0,
      result: null,
    });
    setSelectedImage(null);
    setProcessingSteps(PROCESSING_STEPS.map(step => ({ ...step, completed: false })));
    setCurrentStep(0);
  }, []);

  const updateProgress = useCallback((progress: number, stepIndex: number) => {
    setScannerState(prev => ({ ...prev, progress }));
    setCurrentStep(stepIndex);
    
    setProcessingSteps(prev => prev.map((step, index) => ({
      ...step,
      completed: index < stepIndex,
      progress: index === stepIndex ? progress : (index < stepIndex ? 100 : 0),
    })));
  }, []);

  const handleImageSelection = async (source: 'gallery' | 'camera') => {
    try {
      resetState();
      
      const result = source === 'gallery' 
        ? await pickImageFromGallery()
        : await captureImageFromCamera();

      if (result) {
        setSelectedImage(result.uri);
        scaleAnim.value = withSpring(1.05, { duration: 300 });
        setTimeout(() => {
          scaleAnim.value = withSpring(1, { duration: 300 });
        }, 300);
      }
    } catch (error) {
      setScannerState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to select image',
      }));
    }
  };

  const handleScanImage = async () => {
    if (!selectedImage) return;

    setScannerState(prev => ({ ...prev, isLoading: true, error: null }));
    opacityAnim.value = withTiming(0.7, { duration: 300 });

    try {
      // Simulate processing steps
      updateProgress(25, 0);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateProgress(50, 1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateProgress(75, 2);
      const response = await extractTextFromImage(selectedImage);
      
      updateProgress(100, 3);
      await new Promise(resolve => setTimeout(resolve, 500));

      if (response.success && response.data) {
        const scanResult: ScanResult = {
          id: generateImageId(),
          text: response.data.text,
          confidence: response.data.confidence,
          timestamp: new Date(),
          imageUri: selectedImage,
        };

        setScannerState(prev => ({
          ...prev,
          isLoading: false,
          result: scanResult,
        }));
      } else {
        throw new Error(response.error || 'Failed to extract text');
      }
    } catch (error) {
      setScannerState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Scanning failed',
      }));
    } finally {
      opacityAnim.value = withTiming(1, { duration: 300 });
    }
  };

  const handleCopyText = async () => {
    if (scannerState.result) {
      await Clipboard.setStringAsync(scannerState.result.text);
      Alert.alert('Success', 'Text copied to clipboard');
    }
  };

  const handleShareText = async () => {
    if (scannerState.result) {
      try {
        await Share.share({
          message: scannerState.result.text,
          title: 'Scanned Text',
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to share text');
      }
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: opacityAnim.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#007AFF', '#5856D6']}
              style={styles.logoGradient}
            >
              <FileText size={32} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Answer Sheet Scanner</Text>
          <Text style={styles.subtitle}>
            Scan and extract text from answer sheets and documents
          </Text>
        </View>

        {/* Error Message */}
        {scannerState.error && (
          <ErrorMessage
            message={scannerState.error}
            onRetry={resetState}
          />
        )}

        {/* Image Preview */}
        {selectedImage && !scannerState.isLoading && !scannerState.result && (
          <ImagePreview
            imageUri={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}

        {/* Loading State */}
        {scannerState.isLoading && (
          <LoadingIndicator
            steps={processingSteps}
            currentStep={currentStep}
            progress={scannerState.progress}
            message="Processing your image..."
          />
        )}

        {/* Scan Result */}
        {scannerState.result && (
          <ScanResultComponent
            result={scannerState.result}
            onCopy={handleCopyText}
            onShare={handleShareText}
          />
        )}

        {/* Action Buttons */}
        {!scannerState.isLoading && !scannerState.result && (
          <View style={styles.buttonContainer}>
            {/* One-tap scan with camera */}
            {Platform.OS !== 'web' && (
              <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={handleScanWithCamera}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#45B649']}
                    style={styles.buttonGradient}
                  >
                    <Camera size={24} color="white" />
                    <Text style={styles.buttonText}>Scan with Camera</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Existing: Choose from gallery */}
            <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => handleImageSelection('gallery')}
              >
                <LinearGradient
                  colors={['#007AFF', '#5856D6']}
                  style={styles.buttonGradient}
                >
                  <ImageIcon size={24} color="white" />
                  <Text style={styles.buttonText}>Choose from Gallery</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Existing: Take photo (manual, with preview) */}
            {Platform.OS !== 'web' && (
              <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => handleImageSelection('camera')}
                >
                  <Camera size={24} color="#007AFF" />
                  <Text style={styles.secondaryButtonText}>Take Photo (Preview)</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Scan Text button for previewed image */}
            {selectedImage && (
              <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={handleScanImage}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#45B649']}
                    style={styles.buttonGradient}
                  >
                    <Sparkles size={24} color="white" />
                    <Text style={styles.buttonText}>Scan Text</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        )}

        {/* New Scan Button */}
        {scannerState.result && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.newScanButton}
              onPress={resetState}
            >
              <Text style={styles.newScanButtonText}>Scan Another Image</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions */}
        {!selectedImage && !scannerState.isLoading && !scannerState.result && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to get the best results:</Text>
            <View style={styles.instructionsList}>
              <Text style={styles.instructionItem}>• Ensure good lighting</Text>
              <Text style={styles.instructionItem}>• Hold the device steady</Text>
              <Text style={styles.instructionItem}>• Include the entire document</Text>
              <Text style={styles.instructionItem}>• Avoid shadows and glare</Text>
              <Text style={styles.instructionItem}>• Keep text clearly visible</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  buttonWrapper: {
    marginVertical: 4,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scanButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  newScanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  newScanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  instructionsContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
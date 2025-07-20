import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { X, RotateCw, ZoomIn } from 'lucide-react-native';

interface ImagePreviewProps {
  imageUri: string;
  onClose: () => void;
  onRotate?: () => void;
  onZoom?: () => void;
  showControls?: boolean;
}

export function ImagePreview({
  imageUri,
  onClose,
  onRotate,
  onZoom,
  showControls = true,
}: ImagePreviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      </View>
      
      {showControls && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
          
          {onRotate && (
            <TouchableOpacity style={styles.controlButton} onPress={onRotate}>
              <RotateCw size={24} color="#666" />
            </TouchableOpacity>
          )}
          
          {onZoom && (
            <TouchableOpacity style={styles.controlButton} onPress={onZoom}>
              <ZoomIn size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Image ready for scanning</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  footer: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Copy, Share, Save } from 'lucide-react-native';
import { ScanResult as ScanResultType } from '@/types/scanner';

interface ScanResultProps {
  result: ScanResultType;
  onCopy?: () => void;
  onShare?: () => void;
  onSave?: () => void;
}

export function ScanResult({ result, onCopy, onShare, onSave }: ScanResultProps) {
  const confidenceColor = result.confidence > 0.8 ? '#4CAF50' : 
                         result.confidence > 0.6 ? '#FF9800' : '#FF5722';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Extracted Text</Text>
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Confidence: </Text>
          <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
            {Math.round(result.confidence * 100)}%
          </Text>
        </View>
      </View>

      <ScrollView style={styles.textContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.extractedText}>{result.text}</Text>
      </ScrollView>

      <View style={styles.actions}>
        {onCopy && (
          <TouchableOpacity style={styles.actionButton} onPress={onCopy}>
            <Copy size={20} color="#007AFF" />
            <Text style={styles.actionText}>Copy</Text>
          </TouchableOpacity>
        )}
        
        {onShare && (
          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Share size={20} color="#007AFF" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        )}
        
        {onSave && (
          <TouchableOpacity style={styles.actionButton} onPress={onSave}>
            <Save size={20} color="#007AFF" />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.metadata}>
        <Text style={styles.metadataText}>
          Scanned on {result.timestamp.toLocaleDateString()} at {result.timestamp.toLocaleTimeString()}
        </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  textContainer: {
    maxHeight: 200,
    padding: 16,
  },
  extractedText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  metadata: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: '#999',
  },
});
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Minus, RotateCcw } from 'lucide-react-native';
import { useFontSize } from '@/shared/contexts/FontSizeContext';

interface FontSizeControlsProps {
  style?: any;
  compact?: boolean; // Mode compact pour affichage dans des espaces réduits
}

export const FontSizeControls = ({ style, compact = false }: FontSizeControlsProps) => {
  const {
    arabicFontSize,
    translationFontSize,
    increaseArabicFontSize,
    decreaseArabicFontSize,
    increaseTranslationFontSize,
    decreaseTranslationFontSize,
    resetFontSizes,
  } = useFontSize();

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactRow}>
          <Text style={styles.compactLabel}>عربي</Text>
          <TouchableOpacity style={styles.compactButton} onPress={decreaseArabicFontSize}>
            <Minus color="#6b7280" size={16} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.compactButton} onPress={increaseArabicFontSize}>
            <Plus color="#6b7280" size={16} />
          </TouchableOpacity>
        </View>
        <View style={styles.compactRow}>
          <Text style={styles.compactLabel}>FR</Text>
          <TouchableOpacity style={styles.compactButton} onPress={decreaseTranslationFontSize}>
            <Minus color="#6b7280" size={16} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.compactButton} onPress={increaseTranslationFontSize}>
            <Plus color="#6b7280" size={16} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={resetFontSizes}>
          <RotateCcw color="#9333ea" size={14} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Taille du texte</Text>
      
      {/* Contrôles pour le texte arabe */}
      <View style={styles.row}>
        <Text style={styles.label}>Arabe ({arabicFontSize}px)</Text>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={decreaseArabicFontSize}>
            <Minus color="#ffffff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={increaseArabicFontSize}>
            <Plus color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contrôles pour la traduction */}
      <View style={styles.row}>
        <Text style={styles.label}>Traduction ({translationFontSize}px)</Text>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={decreaseTranslationFontSize}>
            <Minus color="#ffffff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={increaseTranslationFontSize}>
            <Plus color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bouton de réinitialisation */}
      <TouchableOpacity style={styles.resetButtonFull} onPress={resetFontSizes}>
        <RotateCcw color="#9333ea" size={18} />
        <Text style={styles.resetText}>Réinitialiser</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    backgroundColor: '#9333ea',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#f3e8ff',
    borderRadius: 12,
    marginTop: 8,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9333ea',
  },
  // Styles pour mode compact
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 4,
  },
  compactButton: {
    width: 28,
    height: 28,
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    width: 28,
    height: 28,
    backgroundColor: '#f3e8ff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

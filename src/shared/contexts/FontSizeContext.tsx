import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UniversalStorage } from '@/infra/secondary/storage/UniversalStorage';

interface FontSizeContextType {
  arabicFontSize: number;
  translationFontSize: number;
  increaseArabicFontSize: () => void;
  decreaseArabicFontSize: () => void;
  increaseTranslationFontSize: () => void;
  decreaseTranslationFontSize: () => void;
  resetFontSizes: () => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

// Tailles par défaut
const DEFAULT_ARABIC_SIZE = 28;
const DEFAULT_TRANSLATION_SIZE = 16;
const MIN_ARABIC_SIZE = 16;
const MAX_ARABIC_SIZE = 48;
const MIN_TRANSLATION_SIZE = 12;
const MAX_TRANSLATION_SIZE = 24;
const STEP = 2; // Incrément de 2 pixels à chaque fois

export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [arabicFontSize, setArabicFontSize] = useState(DEFAULT_ARABIC_SIZE);
  const [translationFontSize, setTranslationFontSize] = useState(DEFAULT_TRANSLATION_SIZE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les tailles depuis le storage au démarrage
  useEffect(() => {
    const loadFontSizes = async () => {
      try {
        const savedArabicSize = await UniversalStorage.getItem('arabicFontSize');
        const savedTranslationSize = await UniversalStorage.getItem('translationFontSize');

        if (savedArabicSize) {
          setArabicFontSize(parseInt(savedArabicSize, 10));
        }
        if (savedTranslationSize) {
          setTranslationFontSize(parseInt(savedTranslationSize, 10));
        }
      } catch (error) {
        console.error('Error loading font sizes:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadFontSizes();
  }, []);

  // Sauvegarder les tailles dans le storage à chaque changement
  useEffect(() => {
    if (!isLoaded) return;

    const saveFontSizes = async () => {
      try {
        await UniversalStorage.setItem('arabicFontSize', arabicFontSize.toString());
        await UniversalStorage.setItem('translationFontSize', translationFontSize.toString());
      } catch (error) {
        console.error('Error saving font sizes:', error);
      }
    };

    saveFontSizes();
  }, [arabicFontSize, translationFontSize, isLoaded]);

  const increaseArabicFontSize = () => {
    setArabicFontSize((prev) => Math.min(prev + STEP, MAX_ARABIC_SIZE));
  };

  const decreaseArabicFontSize = () => {
    setArabicFontSize((prev) => Math.max(prev - STEP, MIN_ARABIC_SIZE));
  };

  const increaseTranslationFontSize = () => {
    setTranslationFontSize((prev) => Math.min(prev + STEP, MAX_TRANSLATION_SIZE));
  };

  const decreaseTranslationFontSize = () => {
    setTranslationFontSize((prev) => Math.max(prev - STEP, MIN_TRANSLATION_SIZE));
  };

  const resetFontSizes = () => {
    setArabicFontSize(DEFAULT_ARABIC_SIZE);
    setTranslationFontSize(DEFAULT_TRANSLATION_SIZE);
  };

  return (
    <FontSizeContext.Provider
      value={{
        arabicFontSize,
        translationFontSize,
        increaseArabicFontSize,
        decreaseArabicFontSize,
        increaseTranslationFontSize,
        decreaseTranslationFontSize,
        resetFontSizes,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};

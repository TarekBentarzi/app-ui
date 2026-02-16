// jest.setup.js
/**
 * Setup global Jest for Expo + React Native + TypeScript
 * ⚡ Résout les problèmes :
 * - ReferenceError: __DEV__ is not defined
 * - Modules Expo non disponibles dans Jest
 * - Mock des modules React Native/Expo
 */

// Définir __DEV__ pour les modules React Native / Expo
global.__DEV__ = true;

// Filtrer le warning "react-test-renderer is deprecated"
// Note: Ce warning provient de @testing-library/react-native v13 qui utilise encore react-test-renderer
// La v14+ utilisera @testing-library/react-native-pure mais est encore en beta
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('react-test-renderer is deprecated')
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    manifest: {},
    expoConfig: {},
    platform: {},
    systemFonts: [],
    installationId: 'test-installation-id',
  },
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
  setStatusBarStyle: jest.fn(),
  setStatusBarBackgroundColor: jest.fn(),
}));

// Mock expo-modules-core
jest.mock('expo-modules-core', () => ({
  CodedError: class extends Error { },
  requireOptionalNativeModule: jest.fn(() => null),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
  Path: 'Path',
  Rect: 'Rect',
  G: 'G',
  Line: 'Line',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  Stop: 'Stop',
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock i18n
jest.mock('./src/shared/i18n', () => ({
  i18n: {
    language: 'en',
    changeLanguage: jest.fn(),
  },
}));

// Mock react-native Platform et NativeModules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: { ...RN.Platform, OS: 'ios', select: (obj) => obj.ios },
    NativeModules: { ...RN.NativeModules },
    ScrollView: ({ children }: any) => children,
    StyleSheet: {
      ...RN.StyleSheet,
      flatten: (style: any) => style || {},
    },
    Touchable: {
      Mixin: {},
    },
  };
});
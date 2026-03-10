import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { UserProgressProvider } from '@/shared/contexts/UserProgressContext';
import { FontSizeProvider } from '@/shared/contexts/FontSizeContext';
import { AppNavigator } from '@/infra/primary/navigation/AppNavigator';
import './src/shared/i18n'; // Initialize i18n

export default function App() {
  return (
    <AuthProvider>
      <UserProgressProvider>
        <FontSizeProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </FontSizeProvider>
      </UserProgressProvider>
    </AuthProvider>
  );
}

import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { UserProgressProvider } from '@/shared/contexts/UserProgressContext';
import { AppNavigator } from '@/infra/primary/navigation/AppNavigator';
import './src/shared/i18n'; // Initialize i18n

export default function App() {
  return (
    <AuthProvider>
      <UserProgressProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </UserProgressProvider>
    </AuthProvider>
  );
}

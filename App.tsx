import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Application & Shared
import { UserApplicationService } from '@/application/services/UserApplicationService';
import { useAuth } from '@/shared/hooks/useAuth';
import { CreateUserDTO } from '@/application/dto/UserDTO';

// Infra
import { UserApiRepository } from '@/infra/secondary/repositories/UserApiRepository';

// Components
import { AuthHeader } from '@/infra/primary/components/AuthHeader';
import { RegistrationForm } from '@/infra/primary/components/RegistrationForm';

// Init dependencies
const userRepository = new UserApiRepository();
const userService = new UserApplicationService(userRepository);

export default function App() {
  const { user, loading, signIn, signOut } = useAuth(userService);
  const [showRegistration, setShowRegistration] = useState(false);

  const handleRegister = async (data: CreateUserDTO) => {
    try {
      await signIn(data);
      setShowRegistration(false);
      alert('Registration successful!');
    } catch (error: any) {
      console.error(error);
      alert(`Registration failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeader
        user={user}
        onSignInPress={() => setShowRegistration(true)}
        onSignOutPress={signOut}
      />

      <View style={styles.container}>
        {showRegistration ? (
          <RegistrationForm
            onRegister={handleRegister}
            onCancel={() => setShowRegistration(false)}
          />
        ) : (
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>Welcome to QLearn</Text>
            {user ? (
              <Text style={styles.subtitle}>You are signed in as {user.name}</Text>
            ) : (
              <Text style={styles.subtitle}>Sign in to start learning</Text>
            )}
          </View>
        )}
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

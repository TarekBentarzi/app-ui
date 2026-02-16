import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { ReadingScreen } from '../screens/ReadingScreen';
import { MemorizingScreen } from '../screens/MemorizingScreen';
import { PronunciationScreen } from '../screens/PronunciationScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Welcome">
                    {({ navigation }) => (
                        <WelcomeScreen onContinue={() => navigation.navigate('MainMenu')} />
                    )}
                </Stack.Screen>

                <Stack.Screen
                    name="MainMenu"
                    component={MainMenuScreen}
                />

                <Stack.Screen
                    name="SignIn"
                    component={SignInScreen}
                />

                <Stack.Screen
                    name="Reading"
                    component={ReadingScreen}
                />

                <Stack.Screen
                    name="Memorizing"
                    component={MemorizingScreen}
                />

                <Stack.Screen
                    name="Pronunciation"
                    component={PronunciationScreen}
                />

                <Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};


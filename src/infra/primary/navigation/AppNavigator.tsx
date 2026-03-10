import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/WelcomScreen/WelcomeScreen';
import { MainMenuScreen } from '../screens/MainMenuScreen/MainMenuScreen';
import { ReadingScreen } from '../screens/ReadingScreen/ReadingScreen';
import { MemorizingTabsScreen } from '../screens/MemorizingScreen/MemorizingTabsScreen';
import { PronunciationScreen } from '../screens/PronunciationScreen/PronunciationScreen';
import { SignInScreen } from '../screens/SignInScreen/SignInScreen';
import { ProfileScreen } from '../screens/ProfileScreen/ProfileScreen';
import { SouratesList } from '../quran/SouratesList';
import { VersetsList } from '../quran/VersetsList';
import { QuranDashboard } from '../quran/QuranDashboard';
import { QuizListScreen } from '../screens/QuizScreen/QuizListScreen';
import { QuizScreen } from '../screens/QuizScreen/QuizScreen';

type RootStackParamList = {
    Welcome: undefined;
    MainMenu: undefined;
    SignIn: undefined;
    Reading: undefined;
    Memorizing: undefined;
    Pronunciation: undefined;
    Profile: undefined;
    QuranDashboard: undefined;
    SouratesList: undefined;
    VersetsList: undefined;
    QuizList: undefined;
    Quiz: { sourateNumero: number; isNew: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
                    component={MemorizingTabsScreen}
                />

                <Stack.Screen
                    name="Pronunciation"
                    component={PronunciationScreen}
                />

                <Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                />

                <Stack.Screen
                    name="QuranDashboard"
                    component={QuranDashboard}
                    options={{ title: 'Quran' }}
                />

                <Stack.Screen
                    name="SouratesList"
                    component={SouratesList}
                    options={{ title: 'Sourates' }}
                />

                <Stack.Screen
                    name="VersetsList"
                    component={VersetsList}
                    options={{ title: 'Versets' }}
                />

                <Stack.Screen
                    name="QuizList"
                    component={QuizListScreen}
                    options={{ title: 'My Quiz' }}
                />

                <Stack.Screen name="Quiz">
                    {(props) => <QuizScreen {...props} />}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
};


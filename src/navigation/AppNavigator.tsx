import React, {useState, useEffect, useCallback} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '@/screens/HomeScreen';
import {PlayerScreen} from '@/screens/PlayerScreen';
import {LoginScreen} from '@/screens/LoginScreen';
import {Colors} from '@/theme/colors';
import {getStoredSession, validateSession} from '@/lib/auth';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Player: {channelId: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check stored session on mount
  useEffect(() => {
    (async () => {
      const session = await getStoredSession();
      if (session) {
        // Validate with server in background
        const result = await validateSession();
        setIsAuthenticated(result.valid);
      } else {
        setIsAuthenticated(false);
      }
    })();
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  // Still checking auth state - show nothing (splash is still showing)
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {backgroundColor: Colors.background},
        }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="Player"
              component={PlayerScreen}
              options={{animation: 'slide_from_right'}}
            />
          </>
        ) : (
          <Stack.Screen name="Login">
            {() => <LoginScreen onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

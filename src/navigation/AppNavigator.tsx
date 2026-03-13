import React, {useCallback} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '@/screens/HomeScreen';
import {PlayerScreen} from '@/screens/PlayerScreen';
import {LoginScreen} from '@/screens/LoginScreen';
import {Colors} from '@/theme/colors';
import {useStoredSession, useValidateSession} from '@/hooks/useAuth';
import {useQueryClient} from '@tanstack/react-query';
import {authKeys} from '@/hooks/useAuth';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Player: {channelId: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const queryClient = useQueryClient();
  const {data: session, isLoading: sessionLoading} = useStoredSession();
  const hasSession = !!session;

  const {data: validation, isLoading: validationLoading} =
    useValidateSession(hasSession);

  const isLoading = sessionLoading || (hasSession && validationLoading);
  const isAuthenticated = hasSession && (validation?.valid ?? true);

  const handleLoginSuccess = useCallback(() => {
    queryClient.invalidateQueries({queryKey: authKeys.session});
    queryClient.invalidateQueries({queryKey: authKeys.validation});
  }, [queryClient]);

  // Still checking auth state - show nothing (splash is still showing)
  if (isLoading) {
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

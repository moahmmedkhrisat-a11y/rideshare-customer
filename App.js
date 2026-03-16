import React, { useState, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import translations from './i18n';

export const LangContext = createContext();

const Stack = createStackNavigator();

export default function App() {
  const [authData, setAuthData] = useState(null);
  const [lang, setLang] = useState('ar');
  const t = translations[lang];

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <NavigationContainer>
        <Stack.Navigator>
          {authData == null ? (
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
              initialParams={{ setAuthData }}
            />
          ) : (
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: t.customerTitle,
                headerLeft: () => null,
              }}
              initialParams={{ token: authData.token, userId: authData.user.id }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </LangContext.Provider>
  );
}

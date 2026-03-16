import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  const [token, setToken] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {token == null ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
            initialParams={{ setToken }} 
          />
        ) : (
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Rideshare Customer' }} 
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

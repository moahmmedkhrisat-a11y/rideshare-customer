import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

export default function LoginScreen({ navigation, route }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const { setToken } = route.params;

  const handleAuth = async () => {
    try {
      const endpoint = isLogin ? '/api/login' : '/api/signup';
      const payload = isLogin ? { phone, password } : { phone, password, role: 'customer' };
      
      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      
      if (isLogin) {
        setToken(response.data.token);
      } else {
        Alert.alert('تم التسجيل بنجاح', 'حسابك في انتظار موافقة المسؤول. لا يمكنك تسجيل الدخول بعد.');
        setIsLogin(true);
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('خطأ', error.response.data.error || 'فشلت المصادقة');
      } else {
        Alert.alert('خطأ في الشبكة', 'تعذر الاتصال بالخادم ' + API_URL);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تطبيق العميل</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="رقم الهاتف"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="كلمة المرور"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textAlign="right"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchText}>
          {isLogin ? "ليس لديك حساب؟ سجل الآن" : 'لديك حساب بالفعل؟ تسجيل الدخول'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#007AFF',
    fontSize: 16,
  },
});


import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';

import { supabase } from '../lib/supabase';

export default function AuthScreen({ language = 'zh' }) {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const zh = language === 'zh';

  async function submit() {
    setMessage('');
    setIsError(false);

    // 檢查電子郵件和密碼
    if (!email.trim() || !password) {
      setIsError(true);
      setMessage(
        zh
          ? '❌ 請輸入電子郵件和密碼'
          : '❌ Please enter your email and password'
      );
      return;
    }

    // 檢查密碼長度
    if (password.length < 6) {
      setIsError(true);
      setMessage(
        zh
          ? '❌ 密碼至少需要 6 個字元'
          : '❌ Password must be at least 6 characters'
      );
      return;
    }

    // 註冊時檢查暱稱
    if (register && !nickname.trim()) {
      setIsError(true);
      setMessage(
        zh
          ? '❌ 請輸入暱稱'
          : '❌ Please enter a nickname'
      );
      return;
    }

    setLoading(true);

    try {
      if (register) {
        // 取得目前 Expo Snack Web 預覽網址
        const redirectUrl =
          typeof window !== 'undefined'
            ? window.location.origin
            : undefined;

        // 註冊帳號
        const { data, error } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              ...(redirectUrl
                ? { emailRedirectTo: redirectUrl }
                : {}),
              data: {
                nickname: nickname.trim()
              }
            }
          });

        if (error) throw error;

        if (data.session) {
          setMessage(
            zh
              ? '✅ 註冊成功，已登入！'
              : '✅ Account created! You are signed in.'
          );
        } else {
          setMessage(
            zh
              ? '✅ 註冊請求已送出！請查看電子郵件是否有驗證信。'
              : '✅ Registration submitted! Check your email for a confirmation link.'
          );

          setRegister(false);
        }

      } else {
        // 登入帳號
        const { error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });

        if (error) throw error;

        setMessage(
          zh
            ? '✅ 登入成功！'
            : '✅ Logged in successfully!'
        );
      }

    } catch (error) {
      setIsError(true);
      setMessage(
        '❌ ' + (error.message || String(error))
      );

    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setRegister(!register);
    setMessage('');
    setIsError(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.logo}>
          Let's Play! 🎮
        </Text>

        <Text style={styles.subtitle}>
          {register
            ? (zh
                ? '建立你的專屬帳號'
                : 'Create your account')
            : (zh
                ? '歡迎回來！'
                : 'Welcome back!')}
        </Text>

        {register && (
          <TextInput
            style={styles.input}
            placeholder={
              zh ? '使用者暱稱' : 'Nickname'
            }
            value={nickname}
            onChangeText={setNickname}
            maxLength={30}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder={
            zh ? '電子郵件' : 'Email'
          }
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder={
            zh
              ? '密碼（至少 6 個字元）'
              : 'Password (6+ characters)'
          }
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {message ? (
          <View
            style={[
              styles.messageBox,
              isError
                ? styles.errorBox
                : styles.successBox
            ]}
          >
            <Text style={styles.messageText}>
              {message}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.disabledButton
          ]}
          onPress={submit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {register
                ? (zh ? '註冊' : 'Sign Up')
                : (zh ? '登入' : 'Log In')}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={switchMode}
          disabled={loading}
        >
          <Text style={styles.switchText}>
            {register
              ? (zh
                  ? '已經有帳號？登入'
                  : 'Already have an account? Log in')
              : (zh
                  ? '還沒有帳號？立即註冊'
                  : 'No account? Sign up')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7'
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25
  },

  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6688CC'
  },

  subtitle: {
    textAlign: 'center',
    color: '#777',
    marginTop: 12,
    marginBottom: 35
  },

  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    fontSize: 16
  },

  messageBox: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 15
  },

  successBox: {
    backgroundColor: '#E7F5E9'
  },

  errorBox: {
    backgroundColor: '#FFE8E8'
  },

  messageText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center'
  },

  button: {
    backgroundColor: '#6688CC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },

  disabledButton: {
    opacity: 0.6
  },

  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold'
  },

  switchText: {
    textAlign: 'center',
    color: '#6688CC',
    marginTop: 25
  }
});

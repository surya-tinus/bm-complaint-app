import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLogin } from '@/features/auth/hooks/useLogin'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { mutate: login, isPending, error } = useLogin()

  const handleLogin = () => {
    login({ email, password })
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Selamat Datang</Text>
        <Text style={styles.subtitle}>Masuk ke dashboard kamu</Text>

        {error && (
          <Text style={styles.errorText}>{(error as Error).message}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Hint saat pakai mock */}
        <Text style={styles.hint}>
          (Mock) Email: surya@example.com | Password: password123
        </Text>

        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Masuk</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
    color: '#1a1a2e',
  },
  hint: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
})

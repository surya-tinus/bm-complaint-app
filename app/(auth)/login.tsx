import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, Dimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { colors, spacing, typography, radius, screenPadding } from '@/constants'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { mutate: login, isPending, error } = useLogin()
  const insets = useSafeAreaInsets()

  const handleLogin = () => login({ email, password })

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.brand} />

      {/* ── Top brand panel ── */}
      <View style={[styles.brandPanel, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.brandEyebrow}>UMN COMPLAINT PORTAL</Text>
        <Text style={styles.brandHeading}>Hello,</Text>
        <Text style={styles.brandHeadingMuted}>Sign in to continue.</Text>
      </View>

      {/* ── Form card — overlaps brand panel ── */}
      <View style={styles.formCard}>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{(error as Error).message}</Text>
          </View>
        )}

        <Text style={styles.fieldLabel}>EMAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          placeholder="Your password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isPending}
          activeOpacity={0.85}
        >
          {isPending
            ? <ActivityIndicator color={colors.textOnBrand} />
            : <Text style={styles.buttonText}>Sign In</Text>
          }
        </TouchableOpacity>

        <Text style={styles.footer}>Building Management · UMN</Text>
      </View>

      {/* Safe area bottom fill */}
      <View style={[styles.bottomFill, { height: insets.bottom }]} />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },

  // Brand panel — top 40% layar
  brandPanel: {
    backgroundColor: colors.brand,
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.xl * 2,
    justifyContent: 'flex-end',
    minHeight: SCREEN_HEIGHT * 0.38,
  },
  brandEyebrow: {
    fontSize: 11,
    fontFamily: typography.fonts.medium,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  brandHeading: {
    fontSize: 38,
    fontFamily: typography.fonts.bold,
    color: colors.textOnBrand,
    lineHeight: 44,
  },
  brandHeadingMuted: {
  fontSize: 28,
  fontFamily: typography.fonts.bold,
  color: 'rgba(255,255,255,0.3)',
  lineHeight: 34,
  marginTop: 4,
},

  // Form card — overlap ke brand panel
  formCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    marginHorizontal: spacing.md,
    marginTop: -32,
    padding: spacing.xl,
    borderWidth: 0.5,
    borderColor: colors.borderDefault,
    flex: 1,
  },

  errorBox: {
    backgroundColor: '#2a0e0e',
    borderRadius: radius.input,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.regular,
    color: '#e05555',
    textAlign: 'center',
  },

  fieldLabel: {
    fontSize: 11,
    fontFamily: typography.fonts.medium,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.regular,
    color: colors.textPrimary,
  },

  button: {
    backgroundColor: colors.brand,
    borderRadius: radius.button,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: colors.textOnBrand,
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.button,
  },

  footer: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },

  bottomFill: {
    backgroundColor: colors.bgBase,
  },
})
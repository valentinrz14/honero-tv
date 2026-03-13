import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {Colors, Spacing, FontSizes, BorderRadius} from '@/theme/colors';
import {loginWithCode} from '@/lib/auth';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({onLoginSuccess}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue: 10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 0, duration: 50, useNativeDriver: true}),
    ]).start();
  }, [shakeAnim]);

  const handleSubmit = useCallback(async () => {
    if (code.length !== 6) {
      setError('Ingresá un código de 6 dígitos');
      shake();
      return;
    }

    setLoading(true);
    setError('');

    const result = await loginWithCode(code);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => onLoginSuccess(), 1000);
    } else {
      setError(result.message);
      shake();
      setLoading(false);
    }
  }, [code, onLoginSuccess, shake]);

  const handleCodeChange = useCallback((text: string) => {
    // Only allow digits, max 6
    const digits = text.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setError('');
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('@/assets/hornero-icon.png')}
          style={styles.icon}
        />
        <Text style={styles.title}>Hornero TV</Text>
        <Text style={styles.subtitle}>Ingresá tu código de acceso</Text>

        <Animated.View style={{transform: [{translateX: shakeAnim}]}}>
          <TextInput
            ref={inputRef}
            style={[styles.codeInput, error ? styles.codeInputError : null]}
            value={code}
            onChangeText={handleCodeChange}
            placeholder="000000"
            placeholderTextColor="#555"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            editable={!loading}
            textAlign="center"
            onSubmitEditing={handleSubmit}
          />
        </Animated.View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : success ? (
          <Text style={styles.successText}>{success}</Text>
        ) : (
          <Text style={styles.hintText}>
            El código te lo proporciona tu proveedor
          </Text>
        )}

        <TouchableOpacity
          style={[styles.button, (loading || code.length !== 6) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading || code.length !== 6}>
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl * 2,
    alignItems: 'center',
    minWidth: 380,
    elevation: 8,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  codeInput: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
    letterSpacing: 12,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.backgroundLight,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    minWidth: 260,
    textAlign: 'center',
  },
  codeInputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: FontSizes.sm,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  successText: {
    color: '#27ae60',
    fontSize: FontSizes.sm,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  hintText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  button: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl * 2,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
});

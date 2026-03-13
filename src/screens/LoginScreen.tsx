import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {Colors, Spacing, FontSizes, BorderRadius} from '@/theme/colors';
import {useLogin} from '@/hooks/useAuth';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const NUM_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['del', '0', 'ok'],
];

export const LoginScreen: React.FC<LoginScreenProps> = ({onLoginSuccess}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const loginMutation = useLogin();

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

    setError('');

    loginMutation.mutate(code, {
      onSuccess: result => {
        setSuccess(result.message);
        setTimeout(() => onLoginSuccess(), 1000);
      },
      onError: (err: Error) => {
        setError(err.message);
        shake();
      },
    });
  }, [code, onLoginSuccess, shake, loginMutation]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (loginMutation.isPending) return;

      if (key === 'del') {
        setCode(prev => prev.slice(0, -1));
        setError('');
      } else if (key === 'ok') {
        handleSubmit();
      } else if (code.length < 6) {
        setCode(prev => prev + key);
        setError('');
      }
    },
    [code, loginMutation.isPending, handleSubmit],
  );

  // Render the 6-digit display
  const renderCodeDisplay = () => {
    const digits = code.split('');
    return (
      <Animated.View
        style={[styles.codeDisplay, {transform: [{translateX: shakeAnim}]}]}>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <View
            key={i}
            style={[
              styles.digitBox,
              i < code.length && styles.digitBoxFilled,
              i === code.length && styles.digitBoxActive,
              error ? styles.digitBoxError : null,
            ]}>
            <Text style={styles.digitText}>
              {digits[i] || ''}
            </Text>
          </View>
        ))}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <Image
          source={require('@/assets/hornero-icon.png')}
          style={styles.icon}
        />
        <Text style={styles.title}>Hornero TV</Text>
        <Text style={styles.subtitle}>Ingresá tu código de acceso</Text>

        {/* Code display */}
        {renderCodeDisplay()}

        {/* Status message */}
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : success ? (
          <Text style={styles.successText}>{success}</Text>
        ) : (
          <Text style={styles.hintText}>
            El código te lo proporciona tu proveedor
          </Text>
        )}

        {/* On-screen numpad */}
        {loginMutation.isPending ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingText}>Verificando...</Text>
          </View>
        ) : (
          <View style={styles.numpad}>
            {NUM_KEYS.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.numpadRow}>
                {row.map(key => {
                  const isDelete = key === 'del';
                  const isOk = key === 'ok';
                  const isDisabled = isOk && code.length !== 6;
                  const isFocused = focusedKey === key;

                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.numpadKey,
                        isDelete && styles.numpadKeySpecial,
                        isOk && styles.numpadKeyOk,
                        isDisabled && styles.numpadKeyDisabled,
                        isFocused && styles.numpadKeyFocused,
                      ]}
                      onPress={() => handleKeyPress(key)}
                      onFocus={() => setFocusedKey(key)}
                      onBlur={() => setFocusedKey(null)}
                      disabled={isDisabled}
                      activeOpacity={0.7}
                      // First key of numpad gets initial focus for TV navigation
                      hasTVPreferredFocus={rowIndex === 0 && key === '1'}>
                      <Text
                        style={[
                          styles.numpadKeyText,
                          isDelete && styles.numpadKeyTextSpecial,
                          isOk && styles.numpadKeyTextOk,
                          isDisabled && styles.numpadKeyTextDisabled,
                        ]}>
                        {isDelete ? 'Borrar' : isOk ? 'Ingresar' : key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}
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
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl * 1.5,
    alignItems: 'center',
    minWidth: 420,
    elevation: 8,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.lg,
  },
  // Code display
  codeDisplay: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  digitBox: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.backgroundLight,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitBoxFilled: {
    borderColor: Colors.accent,
    backgroundColor: Colors.backgroundElevated,
  },
  digitBoxActive: {
    borderColor: Colors.primaryLight,
  },
  digitBoxError: {
    borderColor: '#e74c3c',
  },
  digitText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  // Messages
  errorText: {
    color: '#e74c3c',
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
    textAlign: 'center',
    minHeight: 20,
  },
  successText: {
    color: '#27ae60',
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
    textAlign: 'center',
    minHeight: 20,
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
    textAlign: 'center',
    minHeight: 20,
  },
  // Loading
  loadingContainer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    marginTop: Spacing.md,
  },
  // Numpad
  numpad: {
    gap: Spacing.sm,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  numpadKey: {
    width: 100,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  numpadKeySpecial: {
    backgroundColor: Colors.backgroundLight,
  },
  numpadKeyOk: {
    backgroundColor: Colors.primary,
  },
  numpadKeyDisabled: {
    opacity: 0.3,
  },
  numpadKeyFocused: {
    borderColor: Colors.focusedBorder,
    backgroundColor: Colors.focused,
  },
  numpadKeyText: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.white,
  },
  numpadKeyTextSpecial: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  numpadKeyTextOk: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.white,
  },
  numpadKeyTextDisabled: {
    color: Colors.textMuted,
  },
});

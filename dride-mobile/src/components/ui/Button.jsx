import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { Colors } from '@/constants/colors'

export default function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) {
  const isSecondary = variant === 'secondary'
  const isOutline   = variant === 'outline'

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        isSecondary && styles.secondary,
        isOutline   && styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={isOutline ? Colors.verde : '#fff'} size="small" />
        : <Text style={[styles.text, (isSecondary || isOutline) && styles.textDark]}>
            {title}
          </Text>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base:      { backgroundColor: Colors.verde, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: Colors.verdeOscuro },
  outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.verde },
  disabled:  { opacity: 0.5 },
  text:      { color: '#fff', fontSize: 14, fontWeight: '600' },
  textDark:  { color: Colors.verde },
})

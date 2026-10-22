import { StyleSheet, TextInput, TextInputProps } from 'react-native';

export function Input({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#94a3b8"
      underlineColorAndroid="transparent"
      {...props}
      style={[styles.input, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#fff',
    color: '#172033',
    fontSize: 16,
  },
});

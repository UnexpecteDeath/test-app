import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  active: boolean;
  onPress: () => void;
};

// Звёздочка «в избранное».
export function FavoriteButton({ active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Убрать из избранного' : 'Добавить в избранное'}
      accessibilityState={{ selected: active }}
      style={styles.button}
    >
      <Text style={[styles.star, active && styles.active]}>{active ? '★' : '☆'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontSize: 22,
    color: '#9ca3af',
  },
  active: {
    color: '#ef3124',
  },
});

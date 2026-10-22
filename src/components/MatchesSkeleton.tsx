import { StyleSheet, Text, View } from 'react-native';

export function MatchesSkeleton() {
  return (
    <View accessibilityState={{ busy: true }} accessibilityLabel="Загрузка матчей">
      <Text accessibilityLiveRegion="polite" style={styles.label}>Загружаем матчи…</Text>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.list}>
        {[0, 1, 2, 3].map((item) => (
          <View key={item} style={styles.card}>
            <View style={[styles.bar, styles.date]} />
            <View style={styles.row}>
              <View style={[styles.bar, styles.team]} />
              <View style={[styles.bar, styles.score]} />
            </View>
            <View style={[styles.bar, styles.caption]} />
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={[styles.bar, styles.team]} />
              <View style={[styles.bar, styles.score]} />
            </View>
            <View style={[styles.bar, styles.caption]} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  list: { gap: 12 },
  card: { padding: 18, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 18, backgroundColor: '#fff' },
  bar: { backgroundColor: '#e8edf2', borderRadius: 5 },
  date: { height: 15, width: '58%', marginBottom: 22 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  team: { height: 19, width: '65%' },
  score: { height: 25, width: 28 },
  caption: { height: 12, width: '40%', marginTop: 6 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 14 },
});

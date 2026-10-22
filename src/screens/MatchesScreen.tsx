import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { MatchesSkeleton } from '../components/MatchesSkeleton';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { useFavorites } from '../hooks/useFavorites';
import { useMatches } from '../hooks/useMatches';
import { filterMatches, MatchFilter } from '../models/matches';

const FILTERS: { value: MatchFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'upcoming', label: 'Предстоящие' },
  { value: 'finished', label: 'Завершённые' },
];

export function MatchesScreen() {
  const { data, loading, error, updatedAt, reload } = useMatches();
  const { favorites, isFavorite, toggle } = useFavorites();
  const [filter, setFilter] = useState<MatchFilter>('all');
  const matches = filterMatches(data?.matches ?? [], filter);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={styles.title}>Матчи тура</Text>
            <Text style={styles.subtitle}>
              {data ? `Тур ${data.round}` : 'Расписание и результаты'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: loading, busy: loading }}
            disabled={loading}
            onPress={() => void reload()}
            style={({ pressed }) => [styles.refresh, pressed && styles.pressed, loading && styles.disabled]}
          >
            <Text style={styles.refreshText}>{loading ? 'Загрузка…' : 'Обновить'}</Text>
          </Pressable>
        </View>

        <View style={styles.updated}>
          {updatedAt && <UpdatedAgo since={updatedAt} />}
        </View>

        <View accessibilityRole="tablist" style={styles.filters}>
          {FILTERS.map(({ value, label }) => (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityState={{ selected: filter === value }}
              onPress={() => setFilter(value)}
              style={({ pressed }) => [styles.filter, filter === value && styles.activeFilter, pressed && styles.pressed]}
            >
              <Text style={[styles.filterText, filter === value && styles.activeFilterText]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={matches}
          extraData={favorites}
          keyExtractor={(match) => match.id}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={() => toggle(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          ListHeaderComponent={error ? (
            <View style={styles.error}>
              <Text accessibilityRole="alert" style={styles.errorTitle}>
                {data ? 'Не удалось обновить матчи' : 'Не удалось загрузить матчи'}
              </Text>
              <Text style={styles.errorText}>{error}</Text>
              {data && <Text style={styles.errorText}>Показаны ранее загруженные данные.</Text>}
              <Pressable
                accessibilityRole="button"
                onPress={() => void reload()}
                style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
              >
                <Text style={styles.retryText}>Повторить</Text>
              </Pressable>
            </View>
          ) : null}
          ListEmptyComponent={loading && !data ? <MatchesSkeleton /> : !error ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {data?.matches.length === 0 ? 'Матчей пока нет' : 'В этой категории матчей нет'}
              </Text>
              <Text style={styles.emptyText}>
                {data?.matches.length === 0
                  ? 'Расписание появится здесь. Попробуйте обновить данные позже.'
                  : 'Выберите другой фильтр или обновите данные.'}
              </Text>
            </View>
          ) : null}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8fa' },
  content: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 16 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, paddingTop: 24 },
  heading: { flexGrow: 1, flexShrink: 1 },
  title: { fontSize: 28, fontWeight: '700', color: '#172033' },
  subtitle: { marginTop: 5, fontSize: 14, color: '#64748b' },
  refresh: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, backgroundColor: '#fff' },
  refreshText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.7 },
  updated: { minHeight: 32, justifyContent: 'center', marginTop: 6 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6, marginBottom: 18 },
  filter: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 10, backgroundColor: '#e9eef3' },
  activeFilter: { backgroundColor: '#172033' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  activeFilterText: { color: '#fff' },
  list: { gap: 12, paddingBottom: 32 },
  error: { backgroundColor: '#fff1f2', borderRadius: 14, padding: 18, gap: 8 },
  errorTitle: { fontSize: 17, fontWeight: '600', color: '#9f1239' },
  errorText: { fontSize: 14, lineHeight: 21, color: '#9f1239' },
  retry: { alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 18, justifyContent: 'center', backgroundColor: '#9f1239', borderRadius: 10, marginTop: 4 },
  retryText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  empty: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 16, gap: 10 },
  emptyTitle: { fontSize: 19, fontWeight: '600', color: '#172033', textAlign: 'center' },
  emptyText: { fontSize: 14, lineHeight: 22, color: '#64748b', textAlign: 'center' },
});

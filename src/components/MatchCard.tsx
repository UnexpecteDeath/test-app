import { StyleSheet, Text, View } from 'react-native';
import { formatMatchStart, getMatchStatus, Match, Team } from '../models/matches';

type Props = { match: Match };

function TeamRow({ team, role, score }: { team: Team; role: string; score?: number }) {
  return (
    <View style={styles.teamRow}>
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.caption}>{role} · {team.city}</Text>
      </View>
      <Text accessibilityLabel={score == null ? 'Счёт пока неизвестен' : `Счёт: ${score}`} style={styles.score}>
        {score ?? '—'}
      </Text>
    </View>
  );
}

export function MatchCard({ match }: Props) {
  const live = match.status === 'live';

  return (
    <View style={styles.card}>
      <View style={styles.meta}>
        <Text style={styles.date}>{formatMatchStart(match.startsAt)}</Text>
        <Text style={[styles.status, live && styles.live]}>{getMatchStatus(match)}</Text>
      </View>
      <TeamRow team={match.home} role="Хозяева" score={match.score?.home} />
      <View style={styles.divider} />
      <TeamRow team={match.away} role="Гости" score={match.score?.away} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 18 },
  date: { flexGrow: 1, fontSize: 13, color: '#526075' },
  status: { fontSize: 12, fontWeight: '600', color: '#475569', backgroundColor: '#f1f5f9', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, overflow: 'hidden' },
  live: { color: '#166534', backgroundColor: '#dcfce7' },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 17, fontWeight: '600', color: '#172033' },
  caption: { fontSize: 12, color: '#64748b', marginTop: 4 },
  score: { minWidth: 36, textAlign: 'center', fontSize: 26, fontWeight: '700', color: '#172033', fontVariant: ['tabular-nums'] },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 14 },
});

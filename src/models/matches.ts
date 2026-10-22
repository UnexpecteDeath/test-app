export type Team = {
  id: string;
  name: string;
  city: string;
};

export type Match = {
  id: string;
  startsAt: string | null;
  status: string;
  minute?: number | null;
  home: Team;
  away: Team;
  score?: { home: number; away: number } | null;
};

export type MatchesResponse = {
  round: number;
  matches: Match[];
};

export type MatchFilter = 'all' | 'upcoming' | 'finished';

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').replace(/\s+/g, ' ');
}

export function filterMatches(matches: Match[], filter: MatchFilter, search = ''): Match[] {
  const query = normalizeSearch(search);

  return matches.filter((match) => {
    const matchesStatus = filter === 'all'
      || (filter === 'upcoming' && (match.status === 'scheduled' || match.status === 'postponed'))
      || (filter === 'finished' && match.status === 'finished');
    const matchesSearch = query.length === 0
      || normalizeSearch(match.home.name).includes(query)
      || normalizeSearch(match.away.name).includes(query);

    return matchesStatus && matchesSearch;
  });
}

export function getMatchStatus(match: Match): string {
  switch (match.status) {
    case 'scheduled':
      return 'Предстоит';
    case 'finished':
      return 'Завершён';
    case 'live':
      return match.minute == null ? 'Идёт матч' : `Идёт матч · ${match.minute}′`;
    case 'postponed':
      return 'Перенесён';
    case 'cancelled':
    case 'canceled':
      return 'Отменён';
    default:
      return 'Статус уточняется';
  }
}

export function formatMatchStart(startsAt: string | null): string {
  if (startsAt === null) return 'Дата и время уточняются';

  // Без timeZone: Intl использует часовой пояс устройства, включая переход даты.
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(startsAt));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTeam(value: unknown): value is Team {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.city === 'string';
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isMatch(value: unknown): value is Match {
  if (!isRecord(value)) return false;

  return typeof value.id === 'string'
    && typeof value.status === 'string'
    && (value.startsAt === null || (
      typeof value.startsAt === 'string'
      && /(Z|[+-]\d{2}:\d{2})$/i.test(value.startsAt)
      && Number.isFinite(Date.parse(value.startsAt))
    ))
    && isTeam(value.home)
    && isTeam(value.away)
    && (value.minute == null || isNonNegativeInteger(value.minute))
    && (value.score == null || (
      isRecord(value.score)
      && isNonNegativeInteger(value.score.home)
      && isNonNegativeInteger(value.score.away)
    ));
}

export function parseMatchesResponse(value: unknown): MatchesResponse {
  if (!isRecord(value)
    || !isNonNegativeInteger(value.round)
    || !Array.isArray(value.matches)
    || !value.matches.every(isMatch)
    || new Set(value.matches.map(({ id }) => id)).size !== value.matches.length) {
    throw new Error('Сервер вернул некорректные данные матчей.');
  }

  return { round: value.round, matches: value.matches };
}

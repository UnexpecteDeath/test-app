import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/models/matches.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
});
const {
  filterMatches,
  formatMatchStart,
  getMatchStatus,
  parseMatchesResponse,
} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const fixture = JSON.parse(readFileSync(new URL('../data/matches.json', import.meta.url), 'utf8'));

test('пример ответа: 8 матчей, 0:0 и неизвестная дата не теряются', () => {
  const data = parseMatchesResponse(fixture);
  assert.equal(data.matches.length, 8);
  assert.deepEqual(data.matches[1].score, { home: 0, away: 0 });
  assert.equal(data.matches[6].startsAt, null);
});

test('фильтры учитывают статусы, а не прошедшие даты из примера', () => {
  const { matches } = parseMatchesResponse(fixture);
  assert.deepEqual(filterMatches(matches, 'upcoming').map(({ id }) => id), ['m5', 'm6', 'm7', 'm8']);
  assert.deepEqual(filterMatches(matches, 'finished').map(({ id }) => id), ['m1', 'm2', 'm3']);
  assert.equal(filterMatches(matches, 'all').length, 8);
  assert.equal(matches.length, 8);
});

test('идущие, отменённые и неизвестные матчи остаются только во «Все»', () => {
  const matches = ['live', 'cancelled', 'new-status'].map((status, index) => ({
    ...fixture.matches[0], status, id: `extra-${index}`,
  }));
  assert.deepEqual(filterMatches(matches, 'upcoming'), []);
  assert.deepEqual(filterMatches(matches, 'finished'), []);
  assert.equal(filterMatches(matches, 'all').length, 3);
  assert.equal(getMatchStatus(matches[2]), 'Статус уточняется');
});

test('пустой ответ корректен; повреждённый ответ и повторяющиеся id — ошибка', () => {
  assert.deepEqual(parseMatchesResponse({ round: 12, matches: [] }).matches, []);
  for (const value of [null, {}, { round: 12, matches: {} }, {
    round: 12, matches: [fixture.matches[0], fixture.matches[0]],
  }]) {
    assert.throws(() => parseMatchesResponse(value), /некорректные данные/);
  }
});

test('некорректные даты, команды и счёт не попадают в карточку', () => {
  for (const patch of [
    { startsAt: 'invalid' },
    { startsAt: '2026-10-11T13:00:00' },
    { home: null },
    { score: { home: -1, away: 0 } },
    { score: { home: '2', away: 0 } },
  ]) {
    assert.throws(() => parseMatchesResponse({
      round: 12, matches: [{ ...fixture.matches[0], ...patch }],
    }), /некорректные данные/);
  }
});

test('необязательный счёт и минута 0 обрабатываются корректно', () => {
  const match = { ...fixture.matches[3], minute: 0 };
  delete match.score;
  const { matches } = parseMatchesResponse({ round: 12, matches: [match] });
  assert.equal(matches[0].score, undefined);
  assert.equal(getMatchStatus(matches[0]), 'Идёт матч · 0′');
  assert.equal(getMatchStatus({ ...match, minute: undefined }), 'Идёт матч');
});

test('все известные статусы имеют русские подписи', () => {
  assert.equal(getMatchStatus({ ...fixture.matches[0], status: 'scheduled' }), 'Предстоит');
  assert.equal(getMatchStatus(fixture.matches[0]), 'Завершён');
  assert.equal(getMatchStatus(fixture.matches[6]), 'Перенесён');
  assert.equal(getMatchStatus({ ...fixture.matches[0], status: 'cancelled' }), 'Отменён');
});

test('время устройства: Москва, смена дня на Гавайях, летнее/зимнее время в Нью-Йорке', () => {
  const originalTimeZone = process.env.TZ;
  try {
    process.env.TZ = 'Europe/Moscow';
    assert.match(formatMatchStart('2026-10-11T13:00:00Z'), /16:00/);
    process.env.TZ = 'Pacific/Honolulu';
    assert.match(formatMatchStart('2026-10-11T01:00:00Z'), /10 октября 2026.*15:00/);
    process.env.TZ = 'America/New_York';
    assert.match(formatMatchStart('2026-07-11T12:00:00Z'), /08:00/);
    assert.match(formatMatchStart('2026-01-11T12:00:00Z'), /07:00/);
  } finally {
    if (originalTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimeZone;
  }
  assert.equal(formatMatchStart(null), 'Дата и время уточняются');
});

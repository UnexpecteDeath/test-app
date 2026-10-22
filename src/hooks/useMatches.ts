import { useCallback, useEffect, useRef, useState } from 'react';
import { MATCHES_URL } from '../config';
import { MatchesResponse, parseMatchesResponse } from '../models/matches';

type MatchesState = {
  data: MatchesResponse | null;
  loading: boolean;
  error: string | null;
  updatedAt: Date | null;
};

export function useMatches() {
  const [state, setState] = useState<MatchesState>({
    data: null,
    loading: true,
    error: null,
    updatedAt: null,
  });
  const activeRequest = useRef<AbortController | null>(null);

  const reload = useCallback(async () => {
    // Не запускаем параллельные запросы при повторных нажатиях.
    if (activeRequest.current) return;

    const controller = new AbortController();
    activeRequest.current = controller;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    let timedOut = false;
    let errorMessage = 'Не удалось загрузить матчи. Проверьте подключение к интернету.';
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15_000);

    try {
      const response = await fetch(MATCHES_URL, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) {
        errorMessage = `Сервер вернул ошибку ${response.status}. Попробуйте ещё раз.`;
        throw new Error(errorMessage);
      }

      errorMessage = 'Сервер вернул некорректные данные матчей.';
      const data = parseMatchesResponse(await response.json());
      if (timedOut) throw new Error('timeout');
      if (activeRequest.current !== controller) return;

      setState({ data, loading: false, error: null, updatedAt: new Date() });
    } catch {
      // После размонтирования (в том числе в StrictMode) результат уже не нужен.
      if (activeRequest.current !== controller) return;

      setState((previous) => ({
        ...previous,
        loading: false,
        error: timedOut ? 'Сервер долго не отвечает. Попробуйте ещё раз.' : errorMessage,
      }));
    } finally {
      clearTimeout(timeout);
      if (activeRequest.current === controller) activeRequest.current = null;
    }
  }, []);

  useEffect(() => {
    void reload();
    return () => {
      const controller = activeRequest.current;
      activeRequest.current = null;
      controller?.abort();
    };
  }, [reload]);

  return { ...state, reload };
}

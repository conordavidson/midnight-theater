import * as Types from 'lib/types';

const basePath = () => {
  if (process.env.NODE_ENV === 'production') return 'https://reel.midnight.theater';
  return 'http://localhost:4000';
};

const getHeaders = (config: Types.ApiConfig) => {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Csrf-Token': config.csrfToken,
  };
};

export const Initializations = {
  index: (): Promise<{ csrf_token: string; current_account: Types.Account }> => {
    return fetch(`${basePath()}/api/initializations`, {
      credentials: 'include',
    }).then((res) => res.json());
  },
};

export const Genres = {
  index: (): Promise<Types.Genre[]> => {
    return fetch(`${basePath()}/api/genres`)
      .then((res) => res.json())
      .then((json) => json.genres);
  },
};

export const Movies = {
  index: (query: {
    releaseDateMin?: string;
    releaseDateMax?: string;
    genreIds?: string[];
  }): Promise<Types.Movie[]> => {
    const params = new URLSearchParams();
    if (query.releaseDateMin) params.append('release_date_min', query.releaseDateMin);
    if (query.releaseDateMax) params.append('release_date_max', query.releaseDateMax);
    if (query.genreIds) params.append('genre_ids', query.genreIds.join(','));

    return fetch(`${basePath()}/api/movies?${params}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((json) => json.movies);
  },
};

export const Logins = {
  create(config: Types.ApiConfig, { email }: { email: string }): Promise<{ email: string }> {
    return fetch(`${basePath()}/api/logins`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: getHeaders(config),
      credentials: 'include',
    }).then((res) => res.json());
  },
};

export const Logouts = {
  create(config: Types.ApiConfig) {
    return fetch(`${basePath()}/api/logouts`, {
      method: 'POST',
      headers: getHeaders(config),
      credentials: 'include',
    }).then((res) => res.json());
  },
};

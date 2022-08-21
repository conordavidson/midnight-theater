export type Genre = {
  id: string;
  tmdb_id: string;
  name: string;
  inserted_at: string;
  updated_at: string;
};

export type Video = {
  id: string;
  name: string;
  tmdb_id: string;
  key: string;
  site: string;
  size: string;
  type: string;
  official: boolean;
  published_at: string;
  inserted_at: string;
  updated_at: string;
};

export type Movie = {
  id: string;
  title: string;
  tmdb_id: string;
  imdb_id: string;
  overview: string;
  popularity: string;
  release_date: string;
  inserted_at: string;
  updated_at: string;
  video: Video;
  genres: Genre[];
};

export const ERAS = [
  '1950s',
  '1960s',
  '1970s',
  '1980s',
  '1990s',
  '2000s',
  '2010s',
  '2020s',
] as const;

export type EraId = typeof ERAS[number];

export const ERA_MAPPING: Record<EraId, ReleaseDateRange> = {
  '1950s': {
    min: '1950-01-01',
    max: '1959-12-31',
  },
  '1960s': {
    min: '1960-01-01',
    max: '1969-12-31',
  },
  '1970s': {
    min: '1970-01-01',
    max: '1979-12-31',
  },
  '1980s': {
    min: '1980-01-01',
    max: '1989-12-31',
  },
  '1990s': {
    min: '1990-01-01',
    max: '1999-12-31',
  },
  '2000s': {
    min: '2000-01-01',
    max: '2009-12-31',
  },
  '2010s': {
    min: '2010-01-01',
    max: '2019-12-31',
  },
  '2020s': {
    min: '2020-01-01',
    max: '2029-12-31',
  },
};

export type ReleaseDateRange = {
  min: string;
  max: string;
};

export type MovieQuery = {
  era: EraId | null;
  genre: string | null;
};

import {
  FC,
  PropsWithChildren,
  useContext as useReactContect,
  createContext,
  useEffect,
  useState,
} from 'react';

import * as Reel from 'lib/reel';
import * as Types from 'lib/types';
import * as Utils from 'lib/utils';

export const Globals = {
  get(): Promise<Types.Globals> {
    return Promise.all([Reel.Genres.index()]).then(([genres]) => {
      return {
        genres,
      };
    });
  },
};

type MovieControls = {
  onNext: () => void;
  onPrevious: () => void;
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  onChangeQuery: (query: Types.MovieQuery) => void;
  query: Types.MovieQuery;
};

type LoginStatus = Types.RequestStatus<{ email: string }, string>;

type UnauthenticatedAccountContext = {
  login: (email: string) => void;
  logout: null;
  currentAccount: null;
  onSaveMovie: null;
  onUnsaveMovie: null;
  savedMovieIds: null;
};

type AuthenticatedAccountContext = {
  login: null;
  logout: () => void;
  currentAccount: Types.Account;
  onSaveMovie: (movieId: string) => Promise<void>;
  onUnsaveMovie: (movieId: string) => Promise<void>;
  savedMovieIds: Set<string>;
};

type AccountContext = {
  loginStatus: LoginStatus;
  logoutStatus: Types.RequestStatus;
  saveMovieStatus: Types.RequestStatus;
  unsaveMovieStatus: Types.RequestStatus;
} & (AuthenticatedAccountContext | UnauthenticatedAccountContext);

type AppContext = {
  initializationStatus: Types.RequestStatus;
};

type MovieContext =
  | (MovieControls & {
      currentMovie: {
        status: 'PENDING';
      };
    })
  | (MovieControls & {
      currentMovie: {
        status: 'FULFILLED';
        movie: Types.FormattedMovie;
      };
    });

type TheaterContext = {
  movies: MovieContext;
  account: AccountContext;
  app: AppContext;
};

export const TheaterContext = createContext<TheaterContext>({
  movies: {
    onNext() {},
    onPrevious() {},
    isNextDisabled: false,
    isPreviousDisabled: false,
    onChangeQuery(_query) {},
    currentMovie: { status: 'PENDING' },
    query: { era: null, genre: null },
  },
  account: {
    login(_email) {},
    logout: null,
    currentAccount: null,
    loginStatus: { status: 'IDLE' },
    logoutStatus: { status: 'IDLE' },
    onSaveMovie: null,
    onUnsaveMovie: null,
    saveMovieStatus: { status: 'IDLE' },
    unsaveMovieStatus: { status: 'IDLE' },
    savedMovieIds: null,
  },
  app: {
    initializationStatus: { status: 'IDLE' },
  },
});

export const ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [movies, setMovies] = useState<Types.Movie[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [savedMovieIds, setSavedMovieIds] = useState<Set<string>>(new Set());
  const [saveMovieStatus, setSaveMovieStatus] = useState<Types.RequestStatus>({ status: 'IDLE' });
  const [unsaveMovieStatus, setUnsaveMovieStatus] = useState<Types.RequestStatus>({
    status: 'IDLE',
  });
  const [query, setQuery] = useState<Types.MovieQuery>({ era: null, genre: null });
  const [loginStatus, setLoginStatus] = useState<LoginStatus>({ status: 'IDLE' });
  const [logoutStatus, setLogoutStatus] = useState<Types.RequestStatus>({ status: 'IDLE' });
  const [initializationStatus, setInitializationStatus] = useState<Types.RequestStatus>({
    status: 'IDLE',
  });
  const [currentAccount, setCurrentAccount] = useState<null | Types.Account>(null);
  const [apiConfig, setApiConfig] = useState<null | Types.ApiConfig>(null);

  const isMount = Utils.useIsMount();

  const appendMoviesToEnd = (newMovies: Types.Movie[]) => setMovies([...movies, ...newMovies]);
  const appendMoviesAfterCurrent = (newMovies: Types.Movie[]) => {
    const existingMovies = movies.slice(0, index + 1);
    setMovies([...existingMovies, ...newMovies]);
  };

  const fetchMovies = () => {
    const era = query.era ? Types.ERA_MAPPING[query.era] : undefined;
    const genreIds = query.genre ? [query.genre] : undefined;

    return Reel.Movies.index({
      releaseDateMin: era?.min,
      releaseDateMax: era?.max,
      genreIds,
    });
  };

  const isNextDisabled = index === movies.length - 1;
  const isPreviousDisabled = index === 0;

  const onNext = () => {
    if (isNextDisabled) return;
    setIndex(index + 1);
  };
  const onPrevious = () => {
    if (isPreviousDisabled) return;
    setIndex(index - 1);
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') onPrevious();
    if (event.key === 'ArrowRight') onNext();
  };

  useEffect(() => {
    document.addEventListener('keydown', onKeydown);
    return () => {
      document.removeEventListener('keydown', onKeydown);
    };
  });

  useEffect(() => {
    setInitializationStatus({ status: 'PENDING' });
    Reel.Initializations.index()
      .then(({ csrf_token, current_account }) => {
        setCurrentAccount(current_account);
        setApiConfig({ csrfToken: csrf_token });
        setInitializationStatus({ status: 'FULFILLED' });
        if (current_account) setSavedMovieIds(new Set(current_account.saved_movie_ids));
      })
      .catch(() => {
        setInitializationStatus({ status: 'REJECTED' });
      });
  }, []);

  useEffect(() => {
    fetchMovies().then((movies) => {
      appendMoviesAfterCurrent(movies);
      if (!isMount) setIndex((index) => index + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (movies.length > 0 && index > movies.length - 5) {
      fetchMovies().then(appendMoviesToEnd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const login = (email: string) => {
    if (!apiConfig) return;
    setLoginStatus({ status: 'PENDING' });
    return Reel.Logins.create(apiConfig, { email })
      .then((data) => {
        setLoginStatus({ status: 'FULFILLED', data });
      })
      .catch(() => {
        setLoginStatus({
          status: 'REJECTED',
          error: 'There was a problem logging in. Please try again',
        });
      });
  };

  const logout = () => {
    if (!apiConfig) return;
    setLogoutStatus({ status: 'PENDING' });
    return Reel.Logouts.create(apiConfig)
      .then(() => {
        setLogoutStatus({ status: 'FULFILLED' });
        setCurrentAccount(null);
      })
      .catch(() => {
        setLogoutStatus({ status: 'REJECTED' });
      });
  };

  const onSaveMovie = (movieId: string) => {
    if (!apiConfig) return Promise.resolve();
    if (!currentAccount) return Promise.resolve();
    setSaveMovieStatus({ status: 'PENDING' });
    return Reel.Saves.create(apiConfig, { movieId })
      .then(({ saved_movie_ids }) => {
        setSaveMovieStatus({ status: 'FULFILLED' });
        setSavedMovieIds(new Set(saved_movie_ids));
      })
      .catch(() => {
        setSaveMovieStatus({ status: 'REJECTED' });
      });
  };

  const onUnsaveMovie = (movieId: string) => {
    if (!apiConfig) return Promise.resolve();
    if (!currentAccount) return Promise.resolve();
    setUnsaveMovieStatus({ status: 'PENDING' });
    return Reel.Unsaves.create(apiConfig, { movieId })
      .then(({ saved_movie_ids }) => {
        setUnsaveMovieStatus({ status: 'FULFILLED' });
        setSavedMovieIds(new Set(saved_movie_ids));
      })
      .catch(() => {
        setUnsaveMovieStatus({ status: 'REJECTED' });
      });
  };

  const movieControls = {
    onNext,
    onPrevious,
    onChangeQuery: setQuery,
    query: query,
    isNextDisabled,
    isPreviousDisabled,
  };

  const getMovieContext = () => {
    if (movies.length === 0)
      return { currentMovie: { status: 'PENDING' as const }, ...movieControls };
    if (!movies[index]) return { currentMovie: { status: 'PENDING' as const }, ...movieControls };
    return {
      currentMovie: {
        status: 'FULFILLED' as const,
        movie: {
          ...movies[index],
          is_saved: savedMovieIds.has(movies[index].id),
        },
      },
      ...movieControls,
    };
  };

  const getAccountContext = () => {
    const base = {
      loginStatus,
      logoutStatus,
      saveMovieStatus,
      unsaveMovieStatus,
    };

    if (currentAccount)
      return {
        ...base,
        currentAccount,
        login: null,
        logout,
        onSaveMovie,
        onUnsaveMovie,
        savedMovieIds,
      };

    return {
      ...base,
      currentAccount,
      login,
      logout: null,
      onSaveMovie: null,
      onUnsaveMovie: null,
      savedMovieIds: null,
    };
  };

  const getAppContext = () => {
    return {
      initializationStatus,
    };
  };

  const getContextValue = () => {
    return {
      movies: getMovieContext(),
      account: getAccountContext(),
      app: getAppContext(),
    };
  };

  return <TheaterContext.Provider value={getContextValue()}>{children}</TheaterContext.Provider>;
};

export const useContext = () => useReactContect(TheaterContext);

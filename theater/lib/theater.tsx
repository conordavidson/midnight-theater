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
};

type LoginStatus =
  | {
      status: 'IDLE';
    }
  | {
      status: 'PENDING';
    }
  | {
      status: 'REJECTED';
      error: string;
    }
  | {
      status: 'FULFILLED';
      data: {
        email: string;
      };
    };

type RequestStatus =
  | {
      status: 'IDLE';
    }
  | {
      status: 'PENDING';
    }
  | {
      status: 'REJECTED';
    }
  | {
      status: 'FULFILLED';
    };

type AccountContext = {
  login: (email: string) => void;
  logout: () => void;
  currentAccount: Types.Account | null;
  loginStatus: LoginStatus;
  logoutStatus: RequestStatus;
};

type AppContext = {
  initializationStatus: RequestStatus;
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
        movie: Types.Movie;
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
  },
  account: {
    login(_email) {},
    logout() {},
    currentAccount: null,
    loginStatus: { status: 'IDLE' },
    logoutStatus: { status: 'IDLE' },
  },
  app: {
    initializationStatus: { status: 'IDLE' },
  },
});

export const ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [movies, setMovies] = useState<Types.Movie[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [query, setQuery] = useState<Types.MovieQuery>({ era: null, genre: null });
  const [loginStatus, setLoginStatus] = useState<LoginStatus>({ status: 'IDLE' });
  const [logoutStatus, setLogoutStatus] = useState<RequestStatus>({ status: 'IDLE' });
  const [initializationStatus, setInitializationStatus] = useState<RequestStatus>({
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

  useEffect(() => {
    setInitializationStatus({ status: 'PENDING' });
    Reel.Initializations.index()
      .then(({ csrf_token, current_account }) => {
        setCurrentAccount(current_account);
        setApiConfig({ csrfToken: csrf_token });
        setInitializationStatus({ status: 'FULFILLED' });
      })
      .then(() => {
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

  const isNextDisabled = index === movies.length - 1;
  const isPreviousDisabled = index === 0;

  const movieControls = {
    onNext: () => {
      if (isNextDisabled) return;
      setIndex(index + 1);
    },
    onPrevious: () => {
      if (isPreviousDisabled) return;
      setIndex(index - 1);
    },
    onChangeQuery: setQuery,
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
        movie: movies[index],
      },
      ...movieControls,
    };
  };

  const getAccountContext = () => {
    return {
      login,
      loginStatus,
      currentAccount,
      logout,
      logoutStatus,
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

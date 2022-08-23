import { FC, useState, PropsWithChildren } from 'react';

import * as Utils from 'lib/utils';
import * as Theater from 'lib/theater';
import * as Types from 'lib/types';
import * as TextUi from 'lib/ui/text';
export const Text = { ...TextUi };

export const Page: FC<PropsWithChildren<{ globals: Types.Globals }>> = ({ children, globals }) => {
  return (
    <div className="flex h-screen">
      <aside className="w-[320px] pt-8 px-4 border-r border-mud">
        <QueryForm globals={globals} />
      </aside>
      <main className="flex-1">{children}</main>
      <AccountSide />
    </div>
  );
};

const QueryForm: FC<{ globals: Types.Globals }> = ({ globals }) => {
  const theaterContext = Theater.useContext();

  const [era, setEra] = useState<Types.EraId | null>(null);
  const [genre, setGenre] = useState<null | string>(null);

  return (
    <div>
      <div className="mb-6 text-center">
        <BouncingText text="MIDNIGHT THEATER" />
      </div>
      <div className="mb-10">
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            theaterContext.movies.onChangeQuery({ era, genre });
          }}
        >
          <div className="space-x-2 flex">
            <div className="w-7/12">
              <label htmlFor="genre" className="block pb-1">
                <Text.Eyebrow>Genre</Text.Eyebrow>
              </label>
              <select
                id="genre"
                name="genre"
                className="p-2 bg-midnight text-gold border border-solid border-gold shadow-input w-full hover:bg-gold hover:text-midnight transition-colors cursor-pointer"
                onChange={(event) => {
                  if (event.target.value === 'null') {
                    setGenre(null);
                    return;
                  }
                  setGenre(event.target.value);
                }}
              >
                <option value="null">Any</option>
                {globals.genres.map((genre) => {
                  return (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="w-5/12">
              <label htmlFor="era" className="block pb-1">
                <Text.Eyebrow>Era</Text.Eyebrow>
              </label>
              <select
                id="era"
                name="era"
                className="p-2 bg-midnight text-gold border border-solid border-gold hover:bg-gold hover:text-midnight transition-colors shadow-input w-full cursor-pointer"
                onChange={(event) => {
                  if (event.target.value === 'null') {
                    setEra(null);
                    return;
                  }

                  // @ts-ignore
                  if (Types.ERAS.includes(event.target.value)) {
                    setEra(event.target.value as typeof Types.ERAS[number]);
                  }
                }}
              >
                <option value="null">Any</option>
                {Types.ERAS.map((era) => {
                  return (
                    <option key={era} value={era}>
                      {era}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="p-2 bg-midnight text-gold border border-solid border-gold hover:bg-gold hover:text-midnight transition-colors shadow-input w-full"
          >
            ⋆ Discover
          </button>
        </form>
      </div>

      <div className="flex space-x-2">
        <button
          type="button"
          className="flex-1 w-full px-4 py-2 bg-midnight text-gold border border-solid border-gold hover:bg-gold hover:text-midnight transition-colors shadow-input"
          onClick={theaterContext.movies.onPrevious}
          disabled={theaterContext.movies.isPreviousDisabled}
        >
          ← Previous
        </button>
        <button
          type="button"
          className="flex-1 w-full px-4 py-2 bg-midnight text-gold border border-solid border-gold hover:bg-gold hover:text-midnight transition-colors shadow-input"
          onClick={theaterContext.movies.onNext}
          disabled={theaterContext.movies.isNextDisabled}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

const AccountIcon = () => (
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', height: '100%', width: '100%', fill: 'currentcolor' }}
    aria-hidden="true"
    role="presentation"
    focusable="false"
  >
    <path d="m16 .7c-8.437 0-15.3 6.863-15.3 15.3s6.863 15.3 15.3 15.3 15.3-6.863 15.3-15.3-6.863-15.3-15.3-15.3zm0 28c-4.021 0-7.605-1.884-9.933-4.81a12.425 12.425 0 0 1 6.451-4.4 6.507 6.507 0 0 1 -3.018-5.49c0-3.584 2.916-6.5 6.5-6.5s6.5 2.916 6.5 6.5a6.513 6.513 0 0 1 -3.019 5.491 12.42 12.42 0 0 1 6.452 4.4c-2.328 2.925-5.912 4.809-9.933 4.809z"></path>
  </svg>
);

const AccountSide = () => {
  const theaterContext = Theater.useContext();

  const [email, setEmail] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getContent = () => {
    if (!isOpen) return null;

    if (theaterContext.account.currentAccount !== null) {
      return (
        <div>
          <Text.Body>Logged in as: {theaterContext.account.currentAccount.email}</Text.Body>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              theaterContext.account.logout();
            }}
          >
            <button
              type="submit"
              className="p-2 bg-midnight text-gold border border-solid border-gold hover:bg-gold hover:text-midnight transition-colors shadow-input w-full"
              disabled={theaterContext.account.logoutStatus.status === 'PENDING'}
            >
              Logout
            </button>
          </form>
        </div>
      );
    }

    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          theaterContext.account.login(email);
        }}
      >
        <label htmlFor="email" hidden>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter email"
          className="text-center p-1 border border-gold border-solid bg-midnight text-gold w-full placeholder:text-gold"
          required
          disabled={
            theaterContext.account.loginStatus.status === 'FULFILLED' ||
            theaterContext.account.loginStatus.status === 'PENDING'
          }
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
        {(theaterContext.account.loginStatus.status === 'IDLE' ||
          theaterContext.account.loginStatus.status === 'PENDING') && (
          <button
            type="submit"
            className="p-1 bg-gold text-midnight w-full"
            disabled={theaterContext.account.loginStatus.status === 'PENDING'}
          >
            Sign In / Sign Up
          </button>
        )}

        {theaterContext.account.loginStatus.status === 'FULFILLED' && (
          <div className="text-center p-1 bg-gold text-midnight w-full">
            Check your email for a login link
          </div>
        )}
      </form>
    );
  };

  return (
    <aside
      className={Utils.cx([
        'pt-4 px-4 border-l border-mud transition-all',
        {
          'w-[320px]': isOpen,
          'w-[64px]': !isOpen,
        },
      ])}
    >
      <div className="flex justify-end mb-4">
        <button className="w-[30px]" onClick={() => setIsOpen((isOpen) => !isOpen)}>
          <div className="text-gold hover:opacity-50 transition-opacity">
            <AccountIcon />
          </div>
        </button>
      </div>
      {getContent()}
    </aside>
  );
};

export const BouncingText: FC<{ text: string }> = ({ text }) => {
  const characters = text.split('');
  const amountOfSpaces = characters.reduce((numSpaces, character) => {
    if (character === ' ') return numSpaces + 1;
    return numSpaces;
  }, 0);

  return (
    <div className="bouncing-text shadow-text">
      {characters.map((letter, i) => {
        const animationDelay = `${i * 100 - amountOfSpaces * 100}ms`;

        return (
          <mark
            key={`${letter}${i}`}
            className={Utils.cx({
              'ml-0.5': i !== 0,
              'w-1': letter === ' ',
            })}
            style={{ animationDelay }}
          >
            {letter}
          </mark>
        );
      })}
    </div>
  );
};

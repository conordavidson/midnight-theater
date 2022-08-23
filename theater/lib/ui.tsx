import { FC, useState, PropsWithChildren } from 'react';

import * as Utils from 'lib/utils';
import * as Theater from 'lib/theater';
import * as Types from 'lib/types';
import * as TextUi from 'lib/ui/text';
export const Text = { ...TextUi };

export const Page: FC<PropsWithChildren<{ globals: Types.Globals }>> = ({ children, globals }) => {
  return (
    <div className="flex h-screen">
      <aside className="w-[320px] pt-4 pl-4 mr-8">
        <div className="mb-12">
          <AccountForm />
        </div>
        <QueryForm globals={globals} />
      </aside>
      <main>{children}</main>
    </div>
  );
};

const QueryForm: FC<{ globals: Types.Globals }> = ({ globals }) => {
  const theaterContext = Theater.useContext();

  const [era, setEra] = useState<Types.EraId | null>(null);
  const [genre, setGenre] = useState<null | string>(null);

  return (
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
            className="p-2 bg-midnight text-gold border border-solid border-gold shadow-input w-full"
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
            className="p-2 bg-midnight text-gold border border-solid border-gold shadow-input w-full"
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
        className="p-2 bg-midnight text-gold border border-solid border-gold shadow-input w-full"
      >
        ⋆ Discover
      </button>
    </form>
  );
};

const AccountForm = () => {
  const theaterContext = Theater.useContext();

  const [email, setEmail] = useState<string>('');

  if (theaterContext.account.currentAccount !== null) {
    return (
      <div>
        <p>Logged in as: {theaterContext.account.currentAccount.email}</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            theaterContext.account.logout();
          }}
        >
          <button
            type="submit"
            className="p-1 bg-black text-white w-full"
            disabled={theaterContext.account.logoutStatus.status === 'PENDING'}
          >
            Logout
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
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
    </div>
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

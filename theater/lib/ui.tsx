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
        <AccountSide />
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
};

const AccountSide = () => {
  const theaterContext = Theater.useContext();

  const [email, setEmail] = useState<string>('');

  const getContent = () => {
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
        className="shadow-input"
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
    <div>
      <div className="mb-6 text-center">
        <BouncingText text="MIDNIGHT THEATER" />
      </div>
      {getContent()}
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

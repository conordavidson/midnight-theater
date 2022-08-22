import { FC, PropsWithChildren } from 'react';

import * as Utils from 'lib/utils';
import * as Theater from 'lib/theater';

export const Page: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <aside className="w-[300px] pt-2 pl-2 mr-8">
        <AccountForm />
      </aside>
      <main>{children}</main>
    </div>
  );
};

const AccountForm = () => {
  const theaterContext = Theater.useContext();

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
          if ('elements' in event.target) {
            // @ts-ignore
            const { email } = event.target.elements;
            theaterContext.account.login(email.value);
          }
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
          className="text-center p-1 border border-black border-solid w-full"
          required
          disabled={
            theaterContext.account.loginStatus.status === 'FULFILLED' ||
            theaterContext.account.loginStatus.status === 'PENDING'
          }
        />
        {(theaterContext.account.loginStatus.status === 'IDLE' ||
          theaterContext.account.loginStatus.status === 'PENDING') && (
          <button
            type="submit"
            className="p-1 bg-black text-white w-full"
            disabled={theaterContext.account.loginStatus.status === 'PENDING'}
          >
            Sign In / Sign Up
          </button>
        )}

        {theaterContext.account.loginStatus.status === 'FULFILLED' && (
          <div className="text-center p-1 bg-black text-white w-full">
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

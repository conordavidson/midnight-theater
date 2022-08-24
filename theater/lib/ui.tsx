import { FC, useState, PropsWithChildren, DetailedHTMLProps, ButtonHTMLAttributes } from 'react';

import * as Utils from 'lib/utils';
import * as Theater from 'lib/theater';
import * as Types from 'lib/types';
import * as TextUi from 'lib/ui/text';
export const Text = { ...TextUi };

export const Page: FC<PropsWithChildren<{ globals: Types.Globals }>> = ({ children, globals }) => {
  return (
    <div>
      <Menu globals={globals} />
      <div className="flex relative min-h-[calc(100vh-75px)]">
        <aside className="w-[320px] px-4 fixed">
          <AccountSide />
        </aside>
        <main className="ml-[320px] border-l border-mud flex-1">{children}</main>
      </div>
    </div>
  );
};

type MenuSelectProps<TOption> = {
  id: string;
  name: string;
  label: string;
  options: Array<{ label: string; value: TOption }>;
  onChange: (option: TOption) => void;
};

const MenuSelect = <TOption,>(props: PropsWithChildren<MenuSelectProps<TOption>>) => {
  return (
    <div className="h-full relative group">
      <label htmlFor={props.id} className="block absolute top-3 left-4">
        <Text.Eyebrow className="group-hover:text-midnight transition-colors">
          {props.label}
        </Text.Eyebrow>
      </label>
      <select
        id={props.id}
        name={props.name}
        className="h-full pt-7 pb-3 pl-3 pr-3 text-xl bg-midnight text-gold w-full group-hover:bg-gold group-hover:text-midnight transition-colors cursor-pointer"
        onChange={(event) => {
          if (event.target.value === 'null') {
            // @ts-ignore
            props.onChange(null);
            return;
          }
          // @ts-ignore
          props.onChange(event.target.value);
        }}
      >
        {props.options.map((option) => {
          return (
            // @ts-ignore
            <option key={option.value} value={option.value || 'null'}>
              {option.label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const Button: FC<PropsWithChildren<ButtonProps>> = ({ children, ...otherProps }) => {
  return (
    <button
      {...otherProps}
      className={Utils.cx([
        'px-4 py-2 bg-midnight text-gold border border-solid border-mud hover:bg-gold hover:border-mud hover:text-midnight transition-colors',
        otherProps.className,
      ])}
    >
      {children}
    </button>
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

const Menu: FC<{ globals: Types.Globals }> = ({ globals }) => {
  const theaterContext = Theater.useContext();

  const [era, setEra] = useState<Types.EraId | null>(null);
  const [genre, setGenre] = useState<null | string>(null);

  const onSubmitQuery = () => {
    theaterContext.movies.onChangeQuery({ era, genre });
  };

  const currentGenre = globals.genres.find((gen) => gen.id === genre);

  /*
  useEffect(() => {
    theaterContext.movies.onChangeQuery({ era, genre });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [era, genre]);
  */

  return (
    <div className="flex border-b border-solid border-mud sticky top-0 bg-midnight z-10">
      <div className="flex-shrink-0 px-6 flex items-center">
        <BouncingText text="MIDNIGHT THEATER" />
      </div>
      <div className="flex-1 flex justify-center items-center">
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmitQuery();
          }}
        >
          <div className="flex">
            <div className="flex-1 min-w-[190px] border-l border-solid border-mud">
              <MenuSelect
                id="era"
                name="era"
                label="Era"
                onChange={setEra}
                options={[
                  {
                    label: 'Any',
                    value: null,
                  },
                  ...Types.ERAS.map((era) => ({
                    label: era,
                    value: era,
                  })),
                ]}
              />
            </div>
            <div className="flex-1 min-w-[190px] border-x border-solid border-mud">
              <MenuSelect
                id="genre"
                name="genre"
                label="Genre"
                onChange={setGenre}
                options={[
                  {
                    label: 'Any',
                    value: null,
                  },
                  ...globals.genres.map((genre) => ({
                    label: genre.name,
                    value: genre.id,
                  })),
                ]}
              />
            </div>

            <div className="px-4 py-4">
              <Button type="submit">Search</Button>
            </div>
          </div>
        </form>
      </div>
      <div className="flex items-center pr-4">
        <div>
          <Button
            type="button"
            onClick={theaterContext.movies.onPrevious}
            disabled={theaterContext.movies.isPreviousDisabled}
          >
            ← Previous
          </Button>
          <Button
            type="button"
            className="border-l-0"
            onClick={theaterContext.movies.onNext}
            disabled={theaterContext.movies.isNextDisabled}
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
};

const AccountSide = () => {
  const theaterContext = Theater.useContext();

  const [email, setEmail] = useState<string>('');

  const getContent = () => {
    if (theaterContext.account.currentAccount !== null) {
      return (
        <div className="text-center">
          <Text.Eyebrow>Logged in as</Text.Eyebrow>
          <Text.Paragraph>{theaterContext.account.currentAccount.email}</Text.Paragraph>
          <form
            className="mt-3"
            onSubmit={(event) => {
              event.preventDefault();
              theaterContext.account.logout();
            }}
          >
            <Button
              type="submit"
              className="w-full"
              disabled={theaterContext.account.logoutStatus.status === 'PENDING'}
            >
              Logout
            </Button>
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
          className="text-center p-1 border border-mud border-solid bg-midnight text-gold w-full placeholder:text-gold placeholder:opacity-40"
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
            className={Utils.cx([
              'p-1 border-x border-b border-mud border-solid bg-midnight text-gold w-full hover:bg-gold hover:text-midnight transition-colors cursor-pointer',
              {
                'bg-gold text-midnight': !!email,
              },
            ])}
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
    <div className="pt-6">
      <div className="flex justify-center mb-3">
        <div className="w-[32px] text-gold">
          <AccountIcon />
        </div>
      </div>
      <div>{getContent()}</div>
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

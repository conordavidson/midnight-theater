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
      <label htmlFor={props.id} className="block absolute top-2 left-4">
        <Text.Eyebrow className="group-hover:text-midnight transition-colors">
          {props.label}
        </Text.Eyebrow>
      </label>
      <select
        id={props.id}
        name={props.name}
        className="h-full pt-7 pb-3 pl-3 pr-3 text-xl font-light bg-midnight text-gold w-full group-hover:bg-gold group-hover:text-midnight transition-colors cursor-pointer"
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
        'px-4 py-2 bg-midnight font-light text-gold border border-solid border-mud hover:bg-gold hover:border-mud hover:text-midnight transition-colors',
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

const NextIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 119 138"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 137.449L93 68.7247L4.73015e-06 0L0 137.449ZM119 0H99V137H119V0Z"
      fill="currentColor"
    />
  </svg>
);

const PreviousIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 119 138"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M119 1.52588e-05L26 68.7247L119 137.449L119 1.52588e-05ZM0 137.449L20 137.449L20 0.449332L1.19769e-05 0.44933L0 137.449Z"
      fill="currentColor"
    />
  </svg>
);

const FilmReelIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 711 586"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M546 273C546 423.774 423.774 546 273 546C122.226 546 0 423.774 0 273C0 122.226 122.226 0 273 0C423.774 0 546 122.226 546 273ZM345 104C345 143.765 312.765 176 273 176C233.235 176 201 143.765 201 104C201 64.2355 233.235 32 273 32C312.765 32 345 64.2355 345 104ZM421 261C460.765 261 493 228.765 493 189C493 149.235 460.765 117 421 117C381.235 117 349 149.235 349 189C349 228.765 381.235 261 421 261ZM493 361C493 400.765 460.765 433 421 433C381.235 433 349 400.765 349 361C349 321.235 381.235 289 421 289C460.765 289 493 321.235 493 361ZM273 519C312.765 519 345 486.765 345 447C345 407.235 312.765 375 273 375C233.235 375 201 407.235 201 447C201 486.765 233.235 519 273 519ZM196 361C196 400.765 163.765 433 124 433C84.2355 433 52 400.765 52 361C52 321.235 84.2355 289 124 289C163.765 289 196 321.235 196 361ZM273 300C286.807 300 298 288.807 298 275C298 261.193 286.807 250 273 250C259.193 250 248 261.193 248 275C248 288.807 259.193 300 273 300ZM196 189C196 228.765 163.765 261 124 261C84.2355 261 52 228.765 52 189C52 149.235 84.2355 117 124 117C163.765 117 196 149.235 196 189ZM547.263 488.177C595.422 456.724 640.84 427.061 710.5 422.5V527.5C628.423 510.764 566.109 532.188 503.844 553.596C430.317 578.876 356.857 604.132 251 566.5C405.827 580.549 479.276 532.579 547.263 488.177Z"
      fill="currentColor"
    />
  </svg>
);

const SaveIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 240 210"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M120 209.488L115.776 205.968C24.96 132.048 0.320007 106 0.320007 63.76C0.320007 28.56 28.48 0.399994 63.68 0.399994C92.544 0.399994 108.736 16.592 120 29.264C131.264 16.592 147.456 0.399994 176.32 0.399994C211.52 0.399994 239.68 28.56 239.68 63.76C239.68 106 215.04 132.048 124.224 205.968L120 209.488Z"
      fill="currentColor"
    />
  </svg>
);

const Menu: FC<{ globals: Types.Globals }> = ({ globals }) => {
  const theaterContext = Theater.useContext();

  const [era, setEra] = useState<Types.EraId | null>(null);
  const [genre, setGenre] = useState<null | string>(null);

  const onSubmitQuery = () => {
    theaterContext.movies.onChangeQuery({ era, genre });
  };

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
            <div className="flex-1 min-w-[190px] border-l border-solid border-mud">
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
            <Button className="border-y-0 px-6" type="submit">
              <div className="flex items-center">
                <Text.Paragraph className="text-current">Search</Text.Paragraph>
                <div className="ml-1.5 h-[14px]">
                  <FilmReelIcon />
                </div>
              </div>
            </Button>
          </div>
        </form>
      </div>
      <div className="flex pr-5">
        <Button
          type="button"
          aria-label="Previous"
          className="w-20 border-y-0"
          onClick={theaterContext.movies.onPrevious}
          disabled={theaterContext.movies.isPreviousDisabled}
        >
          <div className="h-[14px]">
            <PreviousIcon />
          </div>
        </Button>
        <Button className="w-[76px] border-0">
          <div className="h-[13px]">
            <SaveIcon />
          </div>
        </Button>
        <Button
          type="button"
          aria-label="Next"
          className="w-20 border-y-0"
          onClick={theaterContext.movies.onNext}
          disabled={theaterContext.movies.isNextDisabled}
        >
          <div className="h-[14px]">
            <NextIcon />
          </div>
        </Button>
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

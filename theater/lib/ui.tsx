import { FC, PropsWithChildren, DetailedHTMLProps, ButtonHTMLAttributes } from 'react';

import Link from 'next/link';

import * as Utils from 'lib/utils';
import * as Types from 'lib/types';
import * as Theater from 'lib/theater';
import * as TextUi from 'lib/ui/text';
import * as IconsUi from 'lib/ui/icons';
import * as LoadersUi from 'lib/ui/loaders';

export const Text = TextUi;
export const Icons = IconsUi;
export const Loaders = LoadersUi;

export const Container: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="px-4">
      <GutterlessContainer>{children}</GutterlessContainer>
    </div>
  );
};

export const GutterlessContainer: FC<PropsWithChildren> = ({ children }) => {
  return <div className="max-w-[1000px] mx-auto">{children}</div>;
};

export const Page: FC<PropsWithChildren> = ({ children }) => {
  const theaterContext = Theater.useContext();

  const renderAccountLinks = () => {
    if (theaterContext.app.initializationStatus.status !== 'FULFILLED') return null;

    if (theaterContext.account.currentAccount === null)
      return (
        <Link href="/login">
          <a>
            <TextUi.Eyebrow>Sign in / Sign Up</TextUi.Eyebrow>
          </a>
        </Link>
      );

    return (
      <div className="flex items-center space-x-6">
        <Link href="/favorites">
          <a>
            <div className="flex items-center">
              <div className="mr-1.5">
                <TextUi.Eyebrow>Favorites</TextUi.Eyebrow>
              </div>
              <div className="bg-gold rounded-full w-[20px] h-[20px] flex items-center justify-center">
                <TextUi.Eyebrow className="!text-midnight">
                  {theaterContext.account.savedMovieIds.size}
                </TextUi.Eyebrow>
              </div>
            </div>
          </a>
        </Link>
        <button onClick={theaterContext.account.logout}>
          <TextUi.Eyebrow>Logout</TextUi.Eyebrow>
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="pt-4 pb-6">
        <Container>
          <div className="flex justify-between items-center">
            <Link href="/">
              <a>
                <BouncingText text="MIDNIGHT THEATER" />
              </a>
            </Link>
            {renderAccountLinks()}
          </div>
        </Container>
      </div>
      <main>{children}</main>
    </div>
  );
};

type MenuSelectProps<TOption> = {
  id: string;
  name: string;
  label: string;
  options: Array<{ label: string; value: TOption }>;
  onChange: (option: TOption) => void;
  value: TOption;
};

export const MenuSelect = <TOption,>(props: PropsWithChildren<MenuSelectProps<TOption>>) => {
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
        // @ts-ignore
        value={props.value}
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
        'px-4 py-2 bg-midnight font-light text-gold border border-solid border-mud transition-colors',
        otherProps.className,
        {
          'hover:bg-gold hover:text-midnight': !otherProps.disabled,
        },
      ])}
    >
      {children}
    </button>
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

import type { NextPage, InferGetStaticPropsType } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import * as Theater from 'lib/theater';
import * as Ui from 'lib/ui';
import * as Utils from 'lib/utils';

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ globals }) => {
  const theaterContext = Theater.useContext();

  const [email, setEmail] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    if (
      theaterContext.app.initializationStatus.status === 'FULFILLED' &&
      theaterContext.account.currentAccount !== null
    ) {
      router.replace('/');
    }
  }, [
    router,
    theaterContext.app.initializationStatus.status,
    theaterContext.account.currentAccount,
  ]);

  if (theaterContext.account.currentAccount !== null) return null;

  return (
    <Ui.Container>
      <div className="pt-6 max-w-[400px] mx-auto">
        <div className="flex justify-center mb-4">
          <div className="w-[38px] text-gold">
            <Ui.Icons.Account />
          </div>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (theaterContext.account.currentAccount) return;
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
            className="text-center px-2 py-4 mb-3 border border-mud border-solid bg-midnight text-gold w-full placeholder:text-gold "
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
                'px-2 py-4 border-x border-b w-full border-mud border-solid bg-gold transition-colors cursor-pointer',
              ])}
              disabled={theaterContext.account.loginStatus.status === 'PENDING'}
            >
              Sign In / Sign Up
            </button>
          )}

          {theaterContext.account.loginStatus.status === 'FULFILLED' && (
            <div className="text-center px-2 py-4 bg-gold text-midnight w-full">
              Check your email for a login link
            </div>
          )}
        </form>
      </div>
    </Ui.Container>
  );
};

export const getStaticProps = async () => {
  const globals = await Theater.Globals.get();

  return {
    props: {
      globals,
    },
  };
};

export default Home;

import type { NextPage, InferGetStaticPropsType } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import * as Theater from 'lib/theater';
import * as Reel from 'lib/reel';
import * as Ui from 'lib/ui';
import * as Types from 'lib/types';

const Favorites: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ globals }) => {
  const router = useRouter();
  const theaterContext = Theater.useContext();

  const [saves, setSaves] = useState<Types.RequestStatus<Types.Save[]>>({ status: 'IDLE' });

  useEffect(() => {
    if (
      theaterContext.app.initializationStatus.status === 'FULFILLED' &&
      theaterContext.account.currentAccount === null
    ) {
      router.replace('/');
    }
  }, [
    router,
    theaterContext.app.initializationStatus.status,
    theaterContext.account.currentAccount,
  ]);

  const getSaves = () => {
    Reel.Saves.index()
      .then(({ saves }) => {
        setSaves({
          status: 'FULFILLED',
          data: saves,
        });
      })
      .catch(() => {
        setSaves({ status: 'REJECTED' });
      });
  };

  useEffect(() => {
    setSaves({ status: 'PENDING' });
    getSaves();
  }, []);

  if (theaterContext.account.currentAccount === null) return null;

  return (
    <div className="pb-16">
      <Ui.Container>
        {saves.status === 'IDLE' ||
          (saves.status === 'PENDING' && (
            <div className="text-center pt-12">
              <Ui.Loaders.Ring />
            </div>
          ))}
        {saves.status === 'FULFILLED' && (
          <div className="columns-3 gap-4">
            {saves.data.map((save, i) => {
              return (
                <div key={save.id} className="inline-block mb-4 bg-gold rounded-sm fade-in">
                  <div className="pt-5 pb-7 px-4" key={save.id}>
                    <div className="flex mb-3 items-start justify-between">
                      <div>
                        <Ui.Text.Body className="!text-midnight">
                          {new Date(save.movie.release_date).getFullYear()}
                        </Ui.Text.Body>
                        <Ui.Text.Heading className="!text-midnight">
                          {save.movie.title}
                        </Ui.Text.Heading>
                      </div>
                      <button
                        type="button"
                        className="w-[22px] hover:opacity-50 transition-opacity !text-midnight"
                        onClick={() => {
                          if (theaterContext.account.onUnsaveMovie) {
                            theaterContext.account.onUnsaveMovie(save.movie_id).then(getSaves);
                          }
                        }}
                        aria-label="Remove from Favorites"
                      >
                        <Ui.Icons.X />
                      </button>
                    </div>
                    <Ui.Text.Body className="!text-midnight">{save.movie.overview}</Ui.Text.Body>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Ui.Container>
    </div>
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

export default Favorites;

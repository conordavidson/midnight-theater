import type { NextPage, InferGetStaticPropsType } from 'next';
import { useState } from 'react';

import * as Theater from 'lib/theater';
import * as Ui from 'lib/ui';
import * as Types from 'lib/types';
import * as Utils from 'lib/utils';

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ globals }) => {
  const theaterContext = Theater.useContext();

  const era = theaterContext.movies.query.era;
  const genre = theaterContext.movies.query.genre;

  const onChangeEra = (newEra: Types.EraId | null) => {
    theaterContext.movies.onChangeQuery({ era: newEra, genre });
  };

  const onChangeGenre = (newGenre: null | string) => {
    theaterContext.movies.onChangeQuery({ era, genre: newGenre });
  };

  return (
    <div>
      <Ui.Container>
        <div className="flex justify-between pb-3">
          <form className="border border-solid border-mud">
            <div className="flex">
              <div className="flex-1 min-w-[180px] border-r border-solid border-mud">
                <Ui.MenuSelect
                  id="era"
                  name="era"
                  label="Era"
                  onChange={onChangeEra}
                  value={era}
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
              <div className="flex-1 min-w-[220px]">
                <Ui.MenuSelect
                  id="genre"
                  name="genre"
                  label="Genre"
                  onChange={onChangeGenre}
                  value={genre}
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
            </div>
          </form>

          <div className="flex border border-solid border-mud">
            <Ui.Button
              type="button"
              aria-label="Previous"
              className="w-20 border-r border-y-0 border-l-0"
              onClick={theaterContext.movies.onPrevious}
              disabled={theaterContext.movies.isPreviousDisabled}
            >
              <div className="h-[14px]">
                <Ui.Icons.Previous />
              </div>
            </Ui.Button>
            <Ui.Button
              type="button"
              aria-label="Next"
              className="w-20 border-0"
              onClick={theaterContext.movies.onNext}
              disabled={theaterContext.movies.isNextDisabled}
            >
              <div className="h-[14px]">
                <Ui.Icons.Next />
              </div>
            </Ui.Button>
          </div>
        </div>
      </Ui.Container>
      <div className="pb-12">
        {theaterContext.movies.currentMovie.status === 'PENDING' ? (
          <p>loading...</p>
        ) : (
          <div>
            <Ui.GutterlessContainer>
              <div className="relative aspect-video">
                {theaterContext.movies.currentMovie.movie.video.site === 'YouTube' && (
                  <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={`https://www.youtube.com/embed/${theaterContext.movies.currentMovie.movie.video.key}`}
                    title={`${theaterContext.movies.currentMovie.movie.title}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
                {theaterContext.movies.currentMovie.movie.video.site === 'Vimeo' && (
                  <iframe
                    src={`https://player.vimeo.com/video/${theaterContext.movies.currentMovie.movie.video.key}?h=9c739dc6d7&color=ffffff&title=0&byline=0&portrait=0&badge=0`}
                    title={`${theaterContext.movies.currentMovie.movie.title}`}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </Ui.GutterlessContainer>
            <Ui.Container>
              <div className="pt-6 flex  justify-between">
                <div>
                  <Ui.Text.Body>
                    {new Date(
                      theaterContext.movies.currentMovie.movie.release_date
                    ).getUTCFullYear()}
                  </Ui.Text.Body>
                  <Ui.Text.Heading as="h2">{`${theaterContext.movies.currentMovie.movie.title}`}</Ui.Text.Heading>
                </div>
                <Ui.Button
                  title={
                    theaterContext.account.currentAccount === null
                      ? 'Sign In or Sign Up to Favorite Movies'
                      : theaterContext.movies.currentMovie.movie.is_saved
                      ? 'Remove Movie From Favorites'
                      : 'Add Movie to Favorites'
                  }
                  className={Utils.cx([
                    {
                      '!bg-midnight !text-gold':
                        theaterContext.account.unsaveMovieStatus.status === 'PENDING',
                      '!bg-gold !text-midnight':
                        theaterContext.movies.currentMovie.movie.is_saved ||
                        theaterContext.account.saveMovieStatus.status === 'PENDING',
                    },
                  ])}
                  disabled={theaterContext.account.currentAccount === null}
                  onClick={() => {
                    const currentAccount = theaterContext.account.currentAccount;
                    const currentMovie = theaterContext.movies.currentMovie;
                    if (currentAccount && currentMovie.status === 'FULFILLED') {
                      if (currentMovie.movie.is_saved)
                        return theaterContext.account.onUnsaveMovie(currentMovie.movie.id);
                      theaterContext.account.onSaveMovie(currentMovie.movie.id);
                    }
                  }}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 w-[18px] mr-2">
                      <Ui.Icons.Save />
                    </div>
                    Favorite
                  </div>
                </Ui.Button>
              </div>

              <Ui.Text.Body className="mt-6 max-w-[800px]">
                {theaterContext.movies.currentMovie.movie.overview}
              </Ui.Text.Body>
            </Ui.Container>
          </div>
        )}
      </div>
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

export default Home;

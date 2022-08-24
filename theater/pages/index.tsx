import type { NextPage, InferGetStaticPropsType } from 'next';
import { FC, PropsWithChildren, useEffect, useState } from 'react';

import * as Theater from 'lib/theater';
import * as Types from 'lib/types';
import * as Ui from 'lib/ui';

type MenuSelectProps<TOption> = {
  id: string;
  name: string;
  label: string;
  options: Array<{ label: string; value: TOption }>;
  onChange: (option: TOption) => void;
};

const MenuSelect = <TOption,>(props: PropsWithChildren<MenuSelectProps<TOption>>) => {
  return (
    <div className="relative group">
      <label htmlFor={props.id} className="block absolute top-2 left-4">
        <Ui.Text.Eyebrow className="group-hover:text-midnight transition-colors">
          {props.label}
        </Ui.Text.Eyebrow>
      </label>
      <select
        id={props.id}
        name={props.name}
        className="pt-7 pb-3 pl-3 pr-3 text-xl bg-midnight text-gold w-full group-hover:bg-gold group-hover:text-midnight transition-colors cursor-pointer"
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

const QueryMenu: FC<{ globals: Types.Globals }> = ({ globals }) => {
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
    <div className="border-b border-solid border-mud">
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmitQuery();
        }}
      >
        <div className="flex">
          <div className="flex-1 border-r border-solid border-mud">
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
          <div className="flex-1 border-r border-solid border-mud">
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
          <button
            type="submit"
            className="flex-1 p-2 bg-midnight text-gold hover:bg-gold hover:text-midnight transition-colors"
          >
            ⋆ Discover
          </button>
        </div>
      </form>
    </div>
  );
};

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ globals }) => {
  const theaterContext = Theater.useContext();

  return (
    <Ui.Page globals={globals}>
      <QueryMenu globals={globals} />
      <div className="max-w-screen-lg px-4 mt-6">
        {theaterContext.movies.currentMovie.status === 'PENDING' ? (
          <p>loading...</p>
        ) : (
          <div>
            <div className="flex justify-between mb-6">
              <div className="pr-6">
                <Ui.Text.Body>
                  {new Date(theaterContext.movies.currentMovie.movie.release_date).getUTCFullYear()}
                </Ui.Text.Body>
                <Ui.Text.Heading as="h2">{`${theaterContext.movies.currentMovie.movie.title}`}</Ui.Text.Heading>
              </div>
              <div className="pt-2 flex-shrink-0 flex items-start space-x-6">
                <div className="shadow-input">
                  <button
                    type="button"
                    className="px-4 py-2 bg-midnight text-gold border border-solid border-gold hover:bg-gold hover:text-midnight transition-colors"
                    onClick={theaterContext.movies.onPrevious}
                    disabled={theaterContext.movies.isPreviousDisabled}
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-midnight text-gold border-t border-r border-b border-solid border-gold hover:bg-gold hover:text-midnight transition-colors"
                    onClick={theaterContext.movies.onNext}
                    disabled={theaterContext.movies.isNextDisabled}
                  >
                    Next →
                  </button>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 shadow-input bg-midnight text-gold border border-solid border-gold hover:bg-gold hover:text-midnight transition-colors"
                >
                  Save ♡
                </button>
              </div>
            </div>
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
            <Ui.Text.Body className="mt-6">
              {theaterContext.movies.currentMovie.movie.overview}
            </Ui.Text.Body>
          </div>
        )}
      </div>
    </Ui.Page>
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

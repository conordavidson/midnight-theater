import type { NextPage, InferGetStaticPropsType } from 'next';

import * as Theater from 'lib/theater';
import * as Types from 'lib/types';
import * as Ui from 'lib/ui';

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ globals }) => {
  const theaterContext = Theater.useContext();

  return (
    <Ui.Page>
      <div className="max-w-screen-lg px-4">
        <div className="py-8">
          <Ui.BouncingText text="MIDNIGHT THEATER" />
        </div>
        <div className="flex space-x-6">
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              if ('elements' in event.target) {
                // @ts-ignore
                const { era, genre } = event.target.elements;
                theaterContext.movies.onChangeQuery({ era: era.value, genre: genre.value });
              }
            }}
          >
            <div className="space-x-2">
              <select id="genre" name="genre">
                {globals.genres.map((genre) => {
                  return (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  );
                })}
              </select>
              <select id="era" name="era">
                {Types.ERAS.map((era) => {
                  return (
                    <option key={era} value={era}>
                      {era}
                    </option>
                  );
                })}
              </select>
              <button type="submit">🎥 Discover</button>
            </div>
          </form>
          <div className="space-x-2">
            <button
              type="button"
              onClick={theaterContext.movies.onPrevious}
              disabled={theaterContext.movies.isPreviousDisabled}
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={theaterContext.movies.onNext}
              disabled={theaterContext.movies.isNextDisabled}
            >
              Next →
            </button>
          </div>
        </div>

        {theaterContext.movies.currentMovie.status === 'PENDING' ? (
          <p>loading...</p>
        ) : (
          <div className="mt-8">
            <h2 className="font-bold text-2xl mb-6">{`${theaterContext.movies.currentMovie.movie.title} (${theaterContext.movies.currentMovie.movie.release_date})`}</h2>
            {theaterContext.movies.currentMovie.movie.video.site === 'YouTube' && (
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${theaterContext.movies.currentMovie.movie.video.key}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
            <p className="mt-8">{theaterContext.movies.currentMovie.movie.overview}</p>
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

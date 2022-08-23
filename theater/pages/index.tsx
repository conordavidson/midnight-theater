import type { NextPage, InferGetStaticPropsType } from 'next';

import * as Theater from 'lib/theater';
import * as Ui from 'lib/ui';

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ globals }) => {
  const theaterContext = Theater.useContext();

  return (
    <Ui.Page globals={globals}>
      <div className="max-w-screen-lg px-4 pt-8">
        {theaterContext.movies.currentMovie.status === 'PENDING' ? (
          <p>loading...</p>
        ) : (
          <div>
            <div className="flex justify-between mb-6">
              <div>
                <Ui.Text.Body>
                  {new Date(theaterContext.movies.currentMovie.movie.release_date).getUTCFullYear()}
                </Ui.Text.Body>
                <Ui.Text.Heading as="h2">{`${theaterContext.movies.currentMovie.movie.title}`}</Ui.Text.Heading>
              </div>
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-midnight text-gold border border-solid border-gold hover:bg-gold hover:text-midnight transition-colors shadow-input"
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

import type { NextPage, InferGetStaticPropsType } from 'next';

import * as Theater from 'lib/theater';
import * as Ui from 'lib/ui';

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ globals }) => {
  const theaterContext = Theater.useContext();

  return (
    <Ui.Page globals={globals}>
      <div className="max-w-screen-lg px-4">
        <div className="py-8 mb-4">
          <Ui.BouncingText text="MIDNIGHT THEATER" />
        </div>
        <div className="flex space-x-6 justify-between">
          <div className="space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-midnight text-gold border border-solid border-gold hover:bg-gold hover:text-midnight transition-colors shadow-input"
              onClick={theaterContext.movies.onPrevious}
              disabled={theaterContext.movies.isPreviousDisabled}
            >
              ← Previous
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-midnight text-gold border border-solid border-gold hover:bg-gold hover:text-midnight transition-colors shadow-input"
              onClick={theaterContext.movies.onNext}
              disabled={theaterContext.movies.isNextDisabled}
            >
              Next →
            </button>
          </div>
          <button type="button" className="px-4 py-2 bg-gold text-midnight shadow-input">
            Save ♡
          </button>
        </div>

        {theaterContext.movies.currentMovie.status === 'PENDING' ? (
          <p>loading...</p>
        ) : (
          <div className="mt-8">
            <Ui.Text.Body>
              {new Date(theaterContext.movies.currentMovie.movie.release_date).getUTCFullYear()}
            </Ui.Text.Body>
            <Ui.Text.Heading
              as="h2"
              className="mb-6 max-w-lg"
            >{`${theaterContext.movies.currentMovie.movie.title}`}</Ui.Text.Heading>
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
            <Ui.Text.Paragraph className="mt-8 max-w-lg">
              {theaterContext.movies.currentMovie.movie.overview}
            </Ui.Text.Paragraph>
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

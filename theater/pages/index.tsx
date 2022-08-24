import type { NextPage, InferGetStaticPropsType } from 'next';
import { FC, PropsWithChildren, useEffect, useState } from 'react';

import * as Theater from 'lib/theater';
import * as Ui from 'lib/ui';

const Container: FC<PropsWithChildren> = ({ children }) => {
  return <div className="px-4">{children}</div>;
};

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ globals }) => {
  const theaterContext = Theater.useContext();

  return (
    <Ui.Page globals={globals}>
      <div className="pb-12">
        {theaterContext.movies.currentMovie.status === 'PENDING' ? (
          <p>loading...</p>
        ) : (
          <div>
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
            <Container>
              <div className="pt-6 flex justify-between mb-6">
                <div className="pr-6">
                  <Ui.Text.Body>
                    {new Date(
                      theaterContext.movies.currentMovie.movie.release_date
                    ).getUTCFullYear()}
                  </Ui.Text.Body>
                  <Ui.Text.Heading as="h2">{`${theaterContext.movies.currentMovie.movie.title}`}</Ui.Text.Heading>
                </div>
                <div className="pt-2 flex-shrink-0 flex items-start space-x-6">
                  <Ui.Button type="button">Save ♡</Ui.Button>
                </div>
              </div>
              <Ui.Text.Body className="mt-6 max-w-[800px]">
                {theaterContext.movies.currentMovie.movie.overview}
              </Ui.Text.Body>
            </Container>
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

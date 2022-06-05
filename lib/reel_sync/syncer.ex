defmodule ReelSync.Syncer do
  @moduledoc """
  This module is responsible for syncing data from
  our reel_sync.db to the reel.db. The Reel DB is more
  slimmed down - only includes movies with trailers and
  one trailer video per movie. This cuts down our DB
  size significantly, allowing us to host it for free.

  It's the difference between a few GBs to ~80mbs.
  """
  require Ecto.Query

  # credo:disable-for-lines:160 Credo.Check.Refactor.CyclomaticComplexity
  # credo:disable-for-lines:160 Credo.Check.Refactor.Nesting
  def run do
    ReelSync.Schemas.Genre
    |> ReelSync.Repo.all()
    |> Enum.each(fn %{
                      id: id,
                      tmdb_id: tmdb_id,
                      name: name
                    } ->
      case Reel.Repo.get(Reel.Schemas.Genre, id) do
        nil ->
          %Reel.Schemas.Genre{
            id: id,
            tmdb_id: tmdb_id,
            name: name
          }
          |> Reel.Repo.insert!()

        genre ->
          genre
          |> Ecto.Changeset.change(%{name: name, tmdb_id: tmdb_id})
          |> Reel.Repo.update!()
      end
    end)

    stream =
      ReelSync.Schemas.Movie
      |> ReelSync.Repo.stream()

    ReelSync.Repo.transaction(
      fn ->
        stream
        |> Enum.map(fn movie ->
          %ReelSync.Schemas.Movie{
            id: id,
            tmdb_id: tmdb_id,
            title: title,
            overview: overview,
            popularity: popularity,
            release_date: release_date,
            videos: videos,
            genres: genres
          } = ReelSync.Repo.preload(movie, [:videos, :genres])

          videos
          |> Enum.filter(fn video -> video.type == "Trailer" end)
          |> Enum.sort(fn a, b ->
            cond do
              a.official == true && b.official == false ->
                true

              a.official == false && b.official == true ->
                false

              Date.compare(a.published_at, b.published_at) == :gt ->
                true

              Date.compare(a.published_at, b.published_at) == :lt ->
                false

              true ->
                true
            end
          end)
          |> Enum.at(0)
          |> case do
            nil ->
              :ok

            %ReelSync.Schemas.Video{
              id: video_id,
              tmdb_id: video_tmdb_id,
              name: video_name,
              key: video_key,
              site: video_site,
              size: video_size,
              type: video_type,
              official: video_official,
              published_at: video_published_at
            } ->
              video =
                case Reel.Repo.get(Reel.Schemas.Video, video_id) do
                  nil ->
                    %Reel.Schemas.Video{
                      id: video_id,
                      tmdb_id: video_tmdb_id,
                      name: video_name,
                      key: video_key,
                      site: video_site,
                      size: video_size,
                      type: video_type,
                      official: video_official,
                      published_at: video_published_at
                    }
                    |> Reel.Repo.insert!()

                  %Reel.Schemas.Video{} = video ->
                    video
                    |> Ecto.Changeset.change(%{
                      tmdb_id: video_tmdb_id,
                      name: video_name,
                      key: video_key,
                      site: video_site,
                      size: video_size,
                      type: video_type,
                      official: video_official,
                      published_at: video_published_at
                    })
                    |> Reel.Repo.update!()
                end

              movie =
                case Reel.Repo.get(Reel.Schemas.Movie, id) do
                  nil ->
                    %Reel.Schemas.Movie{
                      id: id,
                      tmdb_id: tmdb_id,
                      title: title,
                      overview: overview,
                      popularity: popularity,
                      release_date: release_date,
                      video_id: video.id
                    }
                    |> Reel.Repo.insert!()

                  movie ->
                    movie
                    |> Ecto.Changeset.change(%{
                      tmdb_id: tmdb_id,
                      title: title,
                      overview: overview,
                      popularity: popularity,
                      release_date: release_date,
                      video_id: video.id
                    })
                    |> Reel.Repo.update!()
                end

              Enum.map(genres, fn %{id: genre_id} ->
                %Reel.Schemas.MovieGenre{
                  movie_id: movie.id,
                  genre_id: genre_id
                }
                |> Reel.Repo.insert!()
              end)
          end
        end)
      end,
      timeout: :infinity
    )
  end
end

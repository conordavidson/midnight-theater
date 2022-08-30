defmodule ReelWeb.Serializer do
  @moduledoc """
  Serializes structs to JSON.
  """
  def genre(%Reel.Schemas.Genre{
        id: id,
        tmdb_id: tmdb_id,
        name: name,
        inserted_at: inserted_at,
        updated_at: updated_at
      }) do
    %{
      id: id,
      tmdb_id: tmdb_id,
      name: name,
      inserted_at: inserted_at,
      updated_at: updated_at
    }
  end

  def movie(%Reel.Schemas.Movie{
        id: id,
        title: title,
        tmdb_id: tmdb_id,
        imdb_id: imdb_id,
        overview: overview,
        popularity: popularity,
        release_date: release_date,
        inserted_at: inserted_at,
        updated_at: updated_at,
        video: video,
        genres: genres,
        saves: saves
      }) do
    %{
      id: id,
      title: title,
      tmdb_id: tmdb_id,
      imdb_id: imdb_id,
      overview: overview,
      popularity: popularity,
      release_date: release_date,
      inserted_at: inserted_at,
      updated_at: updated_at,
      video: video(video),
      genres: Enum.map(genres, &genre/1),
      save:
        case saves do
          nil ->
            nil

          [save] ->
            %{
              id: save.id,
              movie_id: save.movie_id
            }

          _ ->
            nil
        end
    }
  end

  def video(%Reel.Schemas.Video{
        id: id,
        name: name,
        tmdb_id: tmdb_id,
        key: key,
        site: site,
        size: size,
        type: type,
        official: official,
        published_at: published_at,
        inserted_at: inserted_at,
        updated_at: updated_at
      }) do
    %{
      id: id,
      name: name,
      tmdb_id: tmdb_id,
      key: key,
      site: site,
      size: size,
      type: type,
      official: official,
      published_at: published_at,
      inserted_at: inserted_at,
      updated_at: updated_at
    }
  end

  def account(%Reel.Schemas.Account{id: id, email: email, saves: saves}) do
    %{
      id: id,
      email: email,
      saves: Enum.map(saves, &save/1)
    }
  end

  def save(%Reel.Schemas.Save{id: id, movie_id: movie_id, movie: mov}) do
    %{
      id: id,
      movie_id: movie_id,
      movie: movie(mov)
    }
  end
end

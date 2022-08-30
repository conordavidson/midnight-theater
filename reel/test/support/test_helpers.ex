defmodule Reel.TestHelpers do
  def genre_attrs do
    %{
      tmdb_id: Enum.random(1..9_999_999),
      name: Faker.Lorem.word()
    }
  end

  def video_attrs do
    {:ok, datetime, _} = DateTime.from_iso8601("1960-01-01T00:00:00.000Z")

    %{
      tmdb_id: Enum.random(1..9_999_999) |> Integer.to_string(),
      name: Faker.Lorem.words(3) |> Enum.join(" "),
      key: Enum.random(1..99_999) |> Integer.to_string(),
      site: Enum.random(["vimeo", "youtube"]),
      size: Enum.random(1..99_999),
      type: "Trailer",
      official: true,
      published_at:
        Faker.DateTime.between(datetime, DateTime.utc_now())
        |> DateTime.truncate(:second)
    }
  end

  def movie_attrs do
    %{
      tmdb_id: Enum.random(1..9_999_999),
      imdb_id: Enum.random(1..9_999_999) |> Integer.to_string(),
      overview: Faker.Lorem.paragraph(1..3),
      popularity: (:rand.uniform() * 10) |> Float.round(1),
      release_date: Faker.Date.between(Date.from_iso8601!("1960-01-01"), Date.utc_today()),
      title: Faker.Lorem.words(3) |> Enum.join(" ")
    }
  end

  def setup_movie(extra_movie_attrs \\ %{}) do
    genres =
      Enum.map(1..10, fn _ ->
        Reel.Schemas.Genre
        |> struct(genre_attrs())
        |> Reel.Repo.insert!()
      end)

    video =
      Reel.Schemas.Video
      |> struct(video_attrs())
      |> Reel.Repo.insert!()

    with_video_attrs =
      movie_attrs()
      |> Map.put(:video_id, video.id)
      |> Map.merge(extra_movie_attrs)

    movie =
      Reel.Schemas.Movie
      |> struct(with_video_attrs)
      |> Reel.Repo.insert!()

    selected_genres = Enum.take_random(genres, 2)

    selected_genres
    |> Enum.each(fn genre ->
      %Reel.Schemas.MovieGenre{
        movie_id: movie.id,
        genre_id: genre.id
      }
      |> Reel.Repo.insert!()
    end)

    movie
  end

  def create_account do
    %Reel.Schemas.Account{
      email: Faker.Internet.email(),
      confirmation_token: Ecto.UUID.generate(),
      confirmation_token_inserted_at: DateTime.utc_now() |> DateTime.truncate(:second)
    }
    |> Reel.Repo.insert!()
  end

  def auth_conn(conn, account) do
    {:ok, token} = Reel.Accounts.create_login_token(account.confirmation_token)
    Plug.Conn.put_session(conn, :login_token_id, token.id)
  end
end

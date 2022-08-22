defmodule ReelWeb.MoviesControllerTest do
  use ReelWeb.ConnCase

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

  describe "index movies" do
    test "works without filters", %{conn: conn} do
      Enum.each(1..10, fn _ -> setup_movie() end)

      movies =
        conn
        |> get(Routes.movies_path(conn, :index))
        |> json_response(200)
        |> Map.get("movies")

      assert length(movies) == 10
    end

    test "works with genre filter", %{conn: conn} do
      movies = Enum.map(1..10, fn _ -> setup_movie() end)
      movies = movies |> Reel.Repo.preload(:genres)

      two_genres =
        movies |> Enum.take_random(2) |> Enum.map(fn movie -> Enum.random(movie.genres) end)

      genre_ids = two_genres |> Enum.map(fn genre -> genre.id end)

      movies =
        conn
        |> get(Routes.movies_path(conn, :index, %{genre_ids: Enum.join(genre_ids, ",")}))
        |> json_response(200)
        |> Map.get("movies")

      assert length(movies) > 0

      assert Enum.all?(movies, fn movie ->
               Enum.any?(movie["genres"], fn genre ->
                 genre["id"] in genre_ids
               end)
             end)

      movies =
        conn
        |> get(Routes.movies_path(conn, :index, %{genre_ids: Ecto.UUID.generate()}))
        |> json_response(200)
        |> Map.get("movies")

      assert Enum.empty?(movies)
    end

    test "works with era filter", %{conn: conn} do
      Enum.map(1..3, fn _ ->
        setup_movie(%{
          release_date: Faker.Date.between(Date.from_iso8601!("2000-01-01"), Date.utc_today())
        })
      end)

      Enum.map(1..5, fn _ ->
        setup_movie(%{
          release_date:
            Faker.Date.between(
              Date.from_iso8601!("1960-01-01"),
              Date.from_iso8601!("1999-12-31")
            )
        })
      end)

      release_date_min = "2000-01-01"
      release_date_max = Date.utc_today() |> Date.to_iso8601()

      movies =
        conn
        |> get(
          Routes.movies_path(conn, :index, %{
            release_date_min: release_date_min,
            release_date_max: release_date_max
          })
        )
        |> json_response(200)
        |> Map.get("movies")

      assert length(movies) == 3
    end

    test "works with release_date_min filter", %{conn: conn} do
      Enum.map(1..3, fn _ ->
        setup_movie(%{
          release_date: Faker.Date.between(Date.from_iso8601!("2000-01-01"), Date.utc_today())
        })
      end)

      Enum.map(1..5, fn _ ->
        setup_movie(%{
          release_date:
            Faker.Date.between(
              Date.from_iso8601!("1960-01-01"),
              Date.from_iso8601!("1999-12-31")
            )
        })
      end)

      release_date_min = "2000-01-01"

      movies =
        conn
        |> get(
          Routes.movies_path(conn, :index, %{
            release_date_min: release_date_min
          })
        )
        |> json_response(200)
        |> Map.get("movies")

      assert length(movies) == 3
    end

    test "works with release_date_max filter", %{conn: conn} do
      Enum.map(1..3, fn _ ->
        setup_movie(%{
          release_date: Faker.Date.between(Date.from_iso8601!("2000-01-01"), Date.utc_today())
        })
      end)

      Enum.map(1..5, fn _ ->
        setup_movie(%{
          release_date:
            Faker.Date.between(
              Date.from_iso8601!("1960-01-01"),
              Date.from_iso8601!("1999-12-31")
            )
        })
      end)

      release_date_max = "2000-01-01"

      movies =
        conn
        |> get(
          Routes.movies_path(conn, :index, %{
            release_date_max: release_date_max
          })
        )
        |> json_response(200)
        |> Map.get("movies")

      assert length(movies) == 5
    end
  end
end

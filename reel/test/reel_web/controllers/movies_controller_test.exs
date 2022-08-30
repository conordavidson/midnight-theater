defmodule ReelWeb.MoviesControllerTest do
  use ReelWeb.ConnCase

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

    test "joins saves for authenticated requests", %{conn: conn} do
      movies = Enum.map(1..10, fn _ -> setup_movie() end)

      account = create_account()

      %{id: movie1_id} = Enum.at(movies, 0)
      %{id: movie2_id} = Enum.at(movies, 1)

      %{id: save1_id} =
        %Reel.Schemas.Save{account: account, movie_id: movie1_id} |> Reel.Repo.insert!()

      %{id: save2_id} =
        %Reel.Schemas.Save{account: account, movie_id: movie2_id} |> Reel.Repo.insert!()

      json =
        conn
        |> auth_conn(account)
        |> get(Routes.movies_path(conn, :index))
        |> json_response(200)
        |> Map.get("movies")

      assert length(json) == 10

      unsaved_movies = json |> Enum.filter(fn movie -> movie["save"] == nil end)
      assert length(unsaved_movies) == 8

      movie1_json = json |> Enum.find(fn movie -> movie["id"] == movie1_id end)
      movie2_json = json |> Enum.find(fn movie -> movie["id"] == movie2_id end)

      assert %{"save" => %{"id" => ^save1_id, "movie_id" => ^movie1_id}} = movie1_json
      assert %{"save" => %{"id" => ^save2_id, "movie_id" => ^movie2_id}} = movie2_json
    end
  end
end

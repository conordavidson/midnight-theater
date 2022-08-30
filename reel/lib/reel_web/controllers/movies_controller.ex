defmodule ReelWeb.MoviesController do
  use ReelWeb, :controller

  import Ecto.Query

  def index(conn, params) do
    current_account = ReelWeb.Authenticator.current_account(conn)

    # We pluck IDs first. This reduces query time
    # with order_by(RANDOM()).
    movies_subquery =
      Reel.Schemas.Movie
      |> release_date_min_filter(params)
      |> release_date_max_filter(params)
      |> genre_filter(params)
      |> order_by([movies], fragment("RANDOM()"))
      |> limit(10)
      |> select([:id])

    movies =
      Reel.Schemas.Movie
      |> where([movies], movies.id in subquery(movies_subquery))
      |> join_saves(current_account)
      |> preload([:genres, :video])
      |> Reel.Repo.all()
      |> Enum.map(&ReelWeb.Serializer.movie/1)

    json(conn, %{movies: movies})
  end

  defp release_date_min_filter(query, %{"release_date_min" => min}) do
    case Date.from_iso8601(min) do
      {:ok, parsed_min} ->
        query
        |> where([movies], movies.release_date >= ^parsed_min)

      _ ->
        query
    end
  end

  defp release_date_min_filter(query, _params), do: query

  defp release_date_max_filter(query, %{"release_date_max" => max}) do
    case Date.from_iso8601(max) do
      {:ok, parsed_max} ->
        query
        |> where([movies], movies.release_date <= ^parsed_max)

      _ ->
        query
    end
  end

  defp release_date_max_filter(query, _params), do: query

  defp genre_filter(query, %{"genre_ids" => genre_ids}) do
    genre_ids_list = String.split(genre_ids, ",")

    query
    |> join(:left, [movies], genres in assoc(movies, :genres))
    |> where([_, genres], genres.id in ^genre_ids_list)
  end

  defp genre_filter(query, _params), do: query

  defp join_saves(query, nil) do
    query
  end

  defp join_saves(query, %Reel.Schemas.Account{id: account_id}) do
    query
    |> join(:left, [movies], saves in Reel.Schemas.Save,
      on: saves.movie_id == movies.id and saves.account_id == ^account_id
    )
    |> preload([_movies, saves], saves: saves)
  end
end

defmodule ReelWeb.MoviesController do
  use ReelWeb, :controller

  import Ecto.Query

  def index(conn, params) do
    movies =
      Reel.Schemas.Movie
      |> join(:inner, [movies], genres in assoc(movies, :genres))
      |> join(:inner, [movies, _], video in assoc(movies, :video))
      |> release_date_min_filter(params)
      |> release_date_max_filter(params)
      |> genre_filter(params)
      |> order_by(fragment("RANDOM()"))
      |> distinct(true)
      |> preload([:genres, :video])
      |> limit(10)
      |> Reel.Repo.all()
      |> Enum.map(&ReelWeb.Serializer.movie/1)

    json(conn, %{movies: movies})
  end

  defp release_date_min_filter(query, %{"release_date_min" => min}) do
    case Date.from_iso8601(min) do
      {:ok, parsed_min} ->
        query
        |> where(
          [movies],
          fragment(
            "CAST(strftime('%s', ?) AS integer) >= CAST(strftime('%s', ?) AS integer)",
            movies.release_date,
            ^parsed_min
          )
        )

      _ ->
        query
    end
  end

  defp release_date_min_filter(query, _params), do: query

  defp release_date_max_filter(query, %{"release_date_max" => max}) do
    case Date.from_iso8601(max) do
      {:ok, parsed_max} ->
        query
        |> where(
          [movies],
          fragment(
            "CAST(strftime('%s', ?) AS integer) <= CAST(strftime('%s', ?) AS integer)",
            movies.release_date,
            ^parsed_max
          )
        )

      _ ->
        query
    end
  end

  defp release_date_max_filter(query, _params), do: query

  defp genre_filter(query, %{"genre_ids" => genre_ids}) do
    genre_ids_list = String.split(genre_ids, ",")
    where(query, [_, genres], genres.id in ^genre_ids_list)
  end

  defp genre_filter(query, _params), do: query
end

defmodule ReelWeb.MoviesController do
  use ReelWeb, :controller

  import Ecto.Query

  def index(conn, params) do
    movies =
      Reel.Schemas.Movie
      |> join(:inner, [movies], genres in assoc(movies, :genres))
      |> era_filter(params)
      |> genre_filter(params)
      |> order_by(fragment("RANDOM()"))
      |> limit(1)
      |> Reel.Repo.all()

    json(conn, %{movies: movies})
  end

  defp era_filter(query, %{"release_date_min" => min, "release_date_max" => max}) do
    case [Date.from_iso8601(min), Date.from_iso8601(max)] do
      [{:ok, parsed_min}, {:ok, parsed_max}] ->
        query
        |> where([movies, _], movies.release_date >= ^parsed_min)
        |> where([movies, _], movies.release_date <= ^parsed_max)

      _ ->
        query
    end
  end

  defp era_filter(query, _params), do: query

  defp genre_filter(query, %{"genre_ids" => genre_ids}) do
    genre_ids_list = String.split(genre_ids, ",")
    where(query, [_, genres], genres.id in ^genre_ids_list)
  end

  defp genre_filter(query, _params), do: query
end

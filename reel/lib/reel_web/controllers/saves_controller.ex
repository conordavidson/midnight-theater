defmodule ReelWeb.SavesController do
  @moduledoc """
  This endpoint allows users to save a movie by ID.
  """

  use ReelWeb, :controller

  import ReelWeb.Authenticator
  import Reel.Repo

  alias Reel.Schemas.Movie, as: Movie

  plug(ReelWeb.Authorizer)

  def create(conn, %{"movie_id" => movie_id}) do
    account = current_account(conn)

    case get(Movie, movie_id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Movie not found"})

      movie ->
        Reel.Saves.save_movie!(account, movie)

        saves =
          Reel.Saves.for_account(account)
          |> Enum.map(&ReelWeb.Serializer.save/1)

        json(conn, %{saves: saves})
    end
  end

  def create(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{})
  end
end

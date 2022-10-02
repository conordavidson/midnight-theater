defmodule ReelWeb.SavesController do
  @moduledoc """
  This endpoint allows users to save a movie by ID.
  """

  use ReelWeb, :controller

  import ReelWeb.Authenticator
  import Reel.Repo

  alias Reel.Schemas.Movie, as: Movie

  plug(ReelWeb.Authorizer)

  def index(conn, _params) do
    saves =
      conn
      |> current_account()
      |> Reel.Saves.for_account()
      |> Enum.map(&ReelWeb.Serializer.save/1)

    json(conn, %{saves: saves})
  end

  def create(conn, %{"movie_id" => movie_id}) do
    account = current_account(conn)

    case get(Movie, movie_id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Movie not found"})

      movie ->
        Reel.Saves.save_movie!(account, movie)

        json(conn, %{saved_movie_ids: Reel.Saves.movie_ids_for_account(account)})
    end
  end

  def create(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{})
  end
end

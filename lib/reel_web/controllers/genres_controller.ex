defmodule ReelWeb.GenresController do
  use ReelWeb, :controller

  def index(conn, _params) do
    genres =
      Reel.Schemas.Genre
      |> Reel.Repo.all()
      |> Enum.map(&ReelWeb.Serializer.genre/1)

    json(conn, %{genres: genres})
  end
end

defmodule ReelWeb.GenresController do
  use ReelWeb, :controller

  def index(conn, _params) do
    genres =
      Reel.Schemas.Genre
      |> Reel.Repo.all()
      |> Enum.map(fn %Reel.Schemas.Genre{
                       id: id,
                       tmdb_id: tmdb_id,
                       name: name,
                       inserted_at: inserted_at,
                       updated_at: updated_at
                     } ->
        %{
          id: id,
          tmdb_id: tmdb_id,
          name: name,
          inserted_at: inserted_at,
          updated_at: updated_at
        }
      end)

    json(conn, %{genres: genres})
  end
end

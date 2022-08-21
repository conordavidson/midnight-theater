defmodule ReelWeb.GenresControllerTest do
  use ReelWeb.ConnCase

  def setup do
    [
      %Reel.Schemas.Genre{tmdb_id: 1, name: "Comedy"},
      %Reel.Schemas.Genre{tmdb_id: 2, name: "Horror"}
    ]
    |> Enum.map(&Reel.Repo.insert!/1)
  end

  describe "index genres" do
    test "lists all genres", %{conn: conn} do
      setup()

      genres =
        conn
        |> get(Routes.genres_path(conn, :index))
        |> json_response(200)
        |> Map.get("genres")

      assert [
               %{"tmdb_id" => 1, "name" => "Comedy"},
               %{"tmdb_id" => 2, "name" => "Horror"}
             ] = genres
    end
  end
end

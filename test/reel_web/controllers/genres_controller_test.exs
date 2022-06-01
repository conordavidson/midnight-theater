defmodule ReelWeb.GenresControllerTest do
  use ReelWeb.ConnCase

  def setup do
    %Reel.Schemas.Genre{tmdb_id: 1, name: "Comedy"} |> Reel.Repo.insert!()
    %Reel.Schemas.Genre{tmdb_id: 2, name: "Horror"} |> Reel.Repo.insert!()
  end

  describe "index genres" do
    test "lists all genres", %{conn: conn} do
      setup()

      conn = get(conn, Routes.genres_path(conn, :index))

      genres = json_response(conn, 200)["genres"]

      assert [
               %{"tmdb_id" => 1, "name" => "Comedy"},
               %{"tmdb_id" => 2, "name" => "Horror"}
             ] = genres
    end
  end
end

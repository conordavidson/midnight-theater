defmodule ReelWeb.SavesControllerTest do
  use ReelWeb.ConnCase

  describe "create save" do
    test "saves movie and returns all saves", %{conn: conn} do
      account = create_account()
      movie = setup_movie()
      movie_id = movie.id
      conn = auth_conn(conn, account)

      json =
        conn
        |> post(Routes.saves_path(conn, :create, %{movie_id: movie_id}))
        |> json_response(200)

      assert length(json["saves"]) == 1
      assert %{"movie" => %{"id" => ^movie_id}} = json["saves"] |> Enum.at(0)
    end

    test "no-ops if already movie already saved", %{conn: conn} do
      account = create_account()
      movie1 = setup_movie()
      movie2 = setup_movie()
      movie1_id = movie1.id
      movie2_id = movie2.id

      %Reel.Schemas.Save{account: account, movie: movie1} |> Reel.Repo.insert!()
      %Reel.Schemas.Save{account: account, movie: movie2} |> Reel.Repo.insert!()

      conn = auth_conn(conn, account)

      json =
        conn
        |> post(Routes.saves_path(conn, :create, %{movie_id: movie1_id}))
        |> json_response(200)

      assert length(json["saves"]) == 2
      assert %{"movie" => %{"id" => ^movie1_id}} = json["saves"] |> Enum.at(0)
      assert %{"movie" => %{"id" => ^movie2_id}} = json["saves"] |> Enum.at(1)
    end

    test "requires authentication", %{conn: conn} do
      movie = setup_movie()

      conn
      |> post(Routes.saves_path(conn, :create, %{movie_id: movie.id}))
      |> json_response(403)
    end
  end
end

defmodule ReelWeb.InitializationsControllerTest do
  use ReelWeb.ConnCase

  describe "index" do
    test "gets current account and csrf_token", %{conn: conn} do
      account =
        %Reel.Schemas.Account{
          email: Faker.Internet.email(),
          confirmation_token: Ecto.UUID.generate(),
          confirmation_token_inserted_at: DateTime.utc_now() |> DateTime.truncate(:second)
        }
        |> Reel.Repo.insert!()

      conn =
        conn
        |> get(Routes.logins_path(conn, :show, account.confirmation_token))

      json =
        conn
        |> get(Routes.initializations_path(conn, :index))
        |> json_response(200)

      assert is_binary(json["csrf_token"])
      assert json["current_account"]["id"] == account.id
      assert json["current_account"]["email"] == account.email
      assert json["current_account"]["saved_movie_ids"] == []
    end

    test "preloads saves", %{conn: conn} do
      account =
        %Reel.Schemas.Account{
          email: Faker.Internet.email(),
          confirmation_token: Ecto.UUID.generate(),
          confirmation_token_inserted_at: DateTime.utc_now() |> DateTime.truncate(:second)
        }
        |> Reel.Repo.insert!()

      movie1 = setup_movie()
      movie2 = setup_movie()
      movie3 = setup_movie()
      movie1_id = movie1.id
      movie2_id = movie2.id

      %Reel.Schemas.Save{account: account, movie: movie1} |> Reel.Repo.insert!()
      %Reel.Schemas.Save{account: account, movie: movie2} |> Reel.Repo.insert!()

      %Reel.Schemas.Save{
        account: account,
        movie: movie3,
        deleted_at: DateTime.utc_now() |> DateTime.truncate(:second)
      }
      |> Reel.Repo.insert!()

      conn =
        conn
        |> get(Routes.logins_path(conn, :show, account.confirmation_token))

      json =
        conn
        |> get(Routes.initializations_path(conn, :index))
        |> json_response(200)

      assert length(json["current_account"]["saved_movie_ids"]) == 2
      assert movie1_id == json["current_account"]["saved_movie_ids"] |> Enum.at(0)
      assert movie2_id == json["current_account"]["saved_movie_ids"] |> Enum.at(1)
    end

    test "returns nil for current account", %{conn: conn} do
      json =
        conn
        |> get(Routes.initializations_path(conn, :index))
        |> json_response(200)

      assert is_binary(json["csrf_token"])
      assert json["current_account"] == nil
    end
  end
end

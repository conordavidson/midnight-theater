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

      conn =
        conn
        |> get(Routes.initializations_path(conn, :index))
        |> json_response(200)

      assert is_binary(conn["csrf_token"])
      assert conn["current_account"]["id"] == account.id
      assert conn["current_account"]["email"] == account.email
    end

    test "returns nil for current account", %{conn: conn} do
      conn =
        conn
        |> get(Routes.initializations_path(conn, :index))
        |> json_response(200)

      assert is_binary(conn["csrf_token"])
      assert conn["current_account"] == nil
    end
  end
end

defmodule ReelWeb.GenresControllerTest do
  use ReelWeb.ConnCase

  import Swoosh.TestAssertions

  describe "create login" do
    test "creates new account", %{conn: conn} do
      email = "test@gmail.com"

      email_res =
        conn
        |> post(Routes.logins_path(conn, :create, %{email: email}))
        |> json_response(201)
        |> Map.get("email")

      assert email == email_res

      account = Reel.Repo.get_by!(Reel.Schemas.Account, %{email: email})

      assert account.confirmation_token != nil
      assert account.confirmation_token_inserted_at != nil

      account
      |> ReelWeb.Emails.welcome_email()
      |> assert_email_sent()
    end

    test "updates existing account", %{conn: conn} do
      email = "test2@gmail.com"

      account =
        %Reel.Schemas.Account{email: email}
        |> Reel.Repo.insert!()

      email_res =
        conn
        |> post(Routes.logins_path(conn, :create, %{email: account.email}))
        |> json_response(201)
        |> Map.get("email")

      assert email == email_res

      updated_account = Reel.Repo.get!(Reel.Schemas.Account, account.id)

      assert updated_account.confirmation_token != nil
      assert updated_account.confirmation_token_inserted_at != nil

      updated_account
      |> ReelWeb.Emails.login_email()
      |> assert_email_sent()
    end
  end
end

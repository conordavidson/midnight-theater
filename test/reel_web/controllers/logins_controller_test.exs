defmodule ReelWeb.LoginsControllerTest do
  use ReelWeb.ConnCase

  import Swoosh.TestAssertions

  describe "show login" do
    test "creates token and redirects", %{conn: conn} do
      ok_redirect = "test.com/ok"
      err_redirect = "test.com/err"

      account =
        %Reel.Schemas.Account{
          email: Faker.Internet.email(),
          confirmation_token: Ecto.UUID.generate(),
          confirmation_token_inserted_at: DateTime.utc_now() |> DateTime.truncate(:second)
        }
        |> Reel.Repo.insert!()

      conn =
        conn
        |> get(
          Routes.logins_path(conn, :show, account.confirmation_token, %{
            ok_to: ok_redirect,
            error_to: err_redirect
          })
        )

      assert redirected_to(conn) =~ ok_redirect

      account =
        account
        |> Reel.Repo.reload!()
        |> Reel.Repo.preload(:tokens)

      assert [token = %Reel.Schemas.Token{revoked_at: nil}] = account.tokens

      assert %Reel.Schemas.Account{
               confirmation_token: nil,
               confirmation_token_inserted_at: nil
             } = account

      assert Plug.Conn.get_session(conn, :login_token_id) == token.id

      account_id = account.id
      conn_with_account = ReelWeb.Authenticator.call(conn, [])

      assert %{current_account: %Reel.Schemas.Account{id: ^account_id}} =
               conn_with_account.assigns
    end

    test "redirects to error_to if token doesn't exist", %{conn: conn} do
      ok_redirect = "test.com/ok"
      err_redirect = "test.com/err"

      account =
        %Reel.Schemas.Account{
          email: Faker.Internet.email(),
          confirmation_token: Ecto.UUID.generate(),
          confirmation_token_inserted_at: nil
        }
        |> Reel.Repo.insert!()

      conn =
        conn
        |> get(
          Routes.logins_path(conn, :show, Ecto.UUID.generate(), %{
            ok_to: ok_redirect,
            error_to: err_redirect
          })
        )

      assert redirected_to(conn) =~ err_redirect

      tokens =
        account
        |> Reel.Repo.reload!()
        |> Reel.Repo.preload(:tokens)
        |> Map.get(:tokens)

      assert Enum.empty?(tokens)
    end

    test "redirects to error_to if token is nil", %{conn: conn} do
      ok_redirect = "test.com/ok"
      err_redirect = "test.com/err"

      account =
        %Reel.Schemas.Account{
          email: Faker.Internet.email(),
          confirmation_token: nil,
          confirmation_token_inserted_at: nil
        }
        |> Reel.Repo.insert!()

      conn =
        conn
        |> get(
          Routes.logins_path(conn, :show, Ecto.UUID.generate(), %{
            ok_to: ok_redirect,
            error_to: err_redirect
          })
        )

      assert redirected_to(conn) =~ err_redirect

      tokens =
        account
        |> Reel.Repo.reload!()
        |> Reel.Repo.preload(:tokens)
        |> Map.get(:tokens)

      assert Enum.empty?(tokens)
    end

    test "redirects to error_to if token is expired", %{conn: conn} do
      ok_redirect = "test.com/ok"
      err_redirect = "test.com/err"

      inserted_at =
        DateTime.utc_now()
        |> DateTime.add((Reel.Accounts.token_ttl_seconds() + 1) * -1, :second)

      account =
        %Reel.Schemas.Account{
          email: Faker.Internet.email(),
          confirmation_token: Ecto.UUID.generate(),
          confirmation_token_inserted_at: inserted_at |> DateTime.truncate(:second)
        }
        |> Reel.Repo.insert!()

      conn =
        conn
        |> get(
          Routes.logins_path(conn, :show, account.confirmation_token, %{
            ok_to: ok_redirect,
            error_to: err_redirect
          })
        )

      assert redirected_to(conn) =~ err_redirect

      tokens =
        account
        |> Reel.Repo.reload!()
        |> Reel.Repo.preload(:tokens)
        |> Map.get(:tokens)

      assert Enum.empty?(tokens)
    end
  end

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

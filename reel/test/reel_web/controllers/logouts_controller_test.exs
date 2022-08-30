defmodule ReelWeb.LogoutsControllerTest do
  use ReelWeb.ConnCase

  describe "logout" do
    test "revokes token and clears session", %{conn: conn} do
      account = create_account()
      {:ok, token} = Reel.Accounts.create_login_token(account.confirmation_token)

      conn =
        conn
        |> put_session(:login_token_id, token.id)
        |> post(Routes.logouts_path(conn, :create))

      assert get_session(conn, :login_token_id) == nil

      tokens =
        account
        |> Reel.Repo.reload!()
        |> Reel.Repo.preload(:tokens)
        |> Map.get(:tokens)

      assert [%Reel.Schemas.Token{revoked_at: revoked_at}] = tokens
      assert revoked_at != nil
    end

    test "no-ops with no login token", %{conn: conn} do
      conn =
        conn
        |> put_session(:login_token_id, Ecto.UUID.generate())
        |> post(Routes.logouts_path(conn, :create))

      assert get_session(conn, :login_token_id) == nil
    end
  end
end

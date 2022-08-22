defmodule ReelWeb.LoginsController do
  use ReelWeb, :controller

  def create(conn, %{"email" => email}) do
    email = Reel.Accounts.trigger_login!(email)

    conn
    |> put_status(:created)
    |> json(%{email: email})
  end

  def create(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{})
  end

  def show(conn, %{"confirmation_token" => confirmation_token}) do
    case Reel.Accounts.create_login_token(confirmation_token) do
      {:ok, token} ->
        conn
        |> put_session(:login_token_id, token.id)
        |> redirect(external: Application.fetch_env!(:reel, :login_redirect_ok_url))

      {:error, _} ->
        redirect(conn, external: Application.fetch_env!(:reel, :login_redirect_err_url))
    end
  end

  def show(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{})
  end
end

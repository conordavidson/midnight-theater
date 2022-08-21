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

  def show(conn, %{
        "confirmation_token" => confirmation_token,
        "ok_to" => ok_to,
        "error_to" => error_to
      }) do
    case Reel.Accounts.create_login_token(confirmation_token) do
      {:ok, token} ->
        conn
        |> put_session(:login_token_id, token.id)
        |> redirect(external: ok_to)

      {:error, _} ->
        redirect(conn, external: error_to)
    end
  end

  def show(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{})
  end
end

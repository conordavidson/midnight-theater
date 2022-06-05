defmodule ReelWeb.LogoutsController do
  use ReelWeb, :controller

  def create(conn, _params) do
    conn
    |> get_session(:login_token_id)
    |> Reel.Accounts.logout!()

    conn
    |> put_session(:login_token_id, nil)
    |> put_status(:created)
    |> json(%{})
  end
end

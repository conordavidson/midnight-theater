defmodule ReelWeb.Authorizer do
  @moduledoc """
  This ensures that there is a current account on the conn.
  If there isn't, it returns an error.

  ReelWeb.Authenticator must be run before this.
  """

  import Plug.Conn
  import Phoenix.Controller

  def init(default), do: default

  def call(conn = %{assigns: %{current_account: %Reel.Schemas.Account{}}}, _opts) do
    conn
  end

  def call(conn, _opts) do
    conn
    |> put_status(:forbidden)
    |> json(%{})
    |> halt()
  end
end

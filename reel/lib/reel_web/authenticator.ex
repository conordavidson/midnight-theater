defmodule ReelWeb.Authenticator do
  @moduledoc """
  This assigns account info to the conn if a token is found
  on the session.
  """

  import Plug.Conn

  def init(default), do: default

  def call(conn, _opts) do
    get_session(conn, :login_token_id)
    |> case do
      login_token_id when is_binary(login_token_id) ->
        Reel.Accounts.account_for_token_id(login_token_id)

      nil ->
        nil
    end
    |> case do
      account = %Reel.Schemas.Account{} ->
        assign(conn, :current_account, account)

      nil ->
        conn
    end
  end
end

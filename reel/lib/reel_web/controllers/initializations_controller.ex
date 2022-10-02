defmodule ReelWeb.InitializationsController do
  @moduledoc """
  This endpoint exists to obtain a CSRF token and the
  current account, if one is logged in.

  The client will make a request here before making
  other requests, and we'll return a CSRF token.
  """

  use ReelWeb, :controller

  import Ecto.Query

  alias Reel.Schemas.Save, as: Save

  def index(conn, _params) do
    current_account =
      case conn.assigns[:current_account] do
        nil ->
          nil

        account ->
          account
          |> Reel.Repo.preload(saves: from(s in Save, where: is_nil(s.deleted_at)))
          |> ReelWeb.Serializer.account()
      end

    json(conn, %{
      csrf_token: get_csrf_token(),
      current_account: current_account
    })
  end
end

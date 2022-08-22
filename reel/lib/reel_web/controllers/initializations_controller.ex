defmodule ReelWeb.InitializationsController do
  @moduledoc """
  This endpoint exists to obtain a CSRF token.

  The client will make a request here before making
  other requests, and we'll return a CSRF token.
  """

  use ReelWeb, :controller

  def index(conn, _params) do
    json(conn, %{csrf_token: get_csrf_token()})
  end
end

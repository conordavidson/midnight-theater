defmodule Reel.Schemas.Token do
  @moduledoc """
  This is a login token. We store these in a user's
  session under the login_token_id key.

  If revoked_at != nil, then the token is no longer
  active.
  """
  use Reel.Schema

  schema "tokens" do
    field :revoked_at, :utc_datetime

    belongs_to :account, Reel.Schemas.Account

    timestamps()
  end
end

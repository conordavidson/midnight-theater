defmodule Reel.Schemas.Token do
  use Reel.Schema

  schema "tokens" do
    field :revoked_at, :utc_datetime

    belongs_to :account, Reel.Schemas.Account

    timestamps()
  end
end

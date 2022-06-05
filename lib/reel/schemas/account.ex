defmodule Reel.Schemas.Account do
  use Reel.Schema

  schema "accounts" do
    field :email, :string
    field :confirmation_token, :string
    field :confirmation_token_inserted_at, :utc_datetime

    timestamps()
  end
end

defmodule Reel.Schemas.Account do
  @moduledoc """
  This represents a user account. We set the
  confirmation_token and confirmation_token_inserted_at
  columns when a user triggers a login. They'll claim the
  confirmation_token and turn it into a Token by clicking
  a link in their email.
  """
  use Reel.Schema

  schema "accounts" do
    field :email, :string
    field :confirmation_token, :string
    field :confirmation_token_inserted_at, :utc_datetime

    has_many :tokens, Reel.Schemas.Token
    has_many :saves, Reel.Schemas.Save

    timestamps()
  end
end

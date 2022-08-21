defmodule Reel.Schemas.Save do
  @moduledoc """
  Represents a user saving a movie.
  """

  use Reel.Schema

  schema "saves" do
    belongs_to :account, Reel.Schemas.Account
    belongs_to :movie, Reel.Schemas.Movie

    timestamps()
  end
end

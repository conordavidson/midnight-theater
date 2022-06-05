defmodule Reel.Schemas.Genre do
  @moduledoc false

  use Reel.Schema

  schema "genres" do
    field :tmdb_id, :integer
    field :name, :string

    many_to_many :movies, Reel.Schemas.Movie, join_through: Reel.Schemas.MovieGenre

    timestamps()
  end
end

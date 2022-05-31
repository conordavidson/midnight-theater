defmodule ReelSync.Schemas.Genre do
  use Reel.Schema

  schema "genres" do
    field :tmdb_id, :integer
    field :name, :string

    many_to_many :movies, ReelSync.Schemas.Movie, join_through: ReelSync.Schemas.MovieGenre

    timestamps()
  end
end

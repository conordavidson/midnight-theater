defmodule ReelSync.Schemas.MovieGenre do
  use Reel.Schema

  schema "movies_genres" do
    belongs_to :movie, ReelSync.Schemas.Movie
    belongs_to :genre, ReelSync.Schemas.Genre

    timestamps()
  end
end

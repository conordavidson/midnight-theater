defmodule Reel.Schemas.MovieGenre do
  use Reel.Schema

  schema "movies_genres" do
    belongs_to :movie, Reel.Schemas.Movie
    belongs_to :genre, Reel.Schemas.Genre

    timestamps()
  end
end

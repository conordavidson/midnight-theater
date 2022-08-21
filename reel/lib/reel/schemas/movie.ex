defmodule Reel.Schemas.Movie do
  @moduledoc false

  use Reel.Schema

  schema "movies" do
    field :tmdb_id, :integer
    field :imdb_id, :string
    field :overview, :string
    field :popularity, :float
    field :release_date, :date
    field :title, :string

    belongs_to :video, Reel.Schemas.Video
    many_to_many :genres, Reel.Schemas.Genre, join_through: Reel.Schemas.MovieGenre

    timestamps()
  end
end

defmodule ReelSync.Schemas.Movie do
  @moduledoc false

  use Reel.Schema

  schema "movies" do
    field :tmdb_id, :integer
    field :imdb_id, :string
    field :title, :string
    field :overview, :string
    field :popularity, :float
    field :release_date, :date

    field :data, :map

    has_many :videos, ReelSync.Schemas.Video
    many_to_many :genres, ReelSync.Schemas.Genre, join_through: ReelSync.Schemas.MovieGenre

    timestamps()
  end
end

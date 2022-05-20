defmodule Reel.Schemas.Movie do
  use Reel.Schema

  schema "movies" do
    field :tmdb_id, :integer
    field :imdb_id, :string
    field :overview, :string
    field :popularity, :float
    field :release_date, :date
    field :title, :string
    field :data, :map

    has_many :videos, Reel.Schemas.Video

    timestamps()
  end
end

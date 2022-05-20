defmodule Reel.Schemas.Video do
  use Reel.Schema

  schema "videos" do
    field :tmdb_id, :string
    field :name, :string
    field :key, :string
    field :site, :string
    field :size, :integer
    field :type, :string
    field :official, :boolean
    field :published_at, :utc_datetime
    field :data, :map

    belongs_to :movie, Reel.Schemas.Movie

    timestamps()
  end
end

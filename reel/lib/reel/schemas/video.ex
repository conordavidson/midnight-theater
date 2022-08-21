defmodule Reel.Schemas.Video do
  @moduledoc false

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

    has_one :movie, Reel.Schemas.Movie

    timestamps()
  end
end

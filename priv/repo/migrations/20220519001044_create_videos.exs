defmodule Reel.Repo.Migrations.CreateVideos do
  use Ecto.Migration

  def change do
    create table(:videos) do
      add :tmdb_id, :string, null: false
      add :name, :string, null: false
      add :key, :string, null: false
      add :site, :string, null: false
      add :size, :integer, null: false
      add :type, :string, null: false
      add :official, :boolean, null: false
      add :published_at, :utc_datetime, null: false

      timestamps()
    end

    create unique_index(:videos, [:tmdb_id])
  end
end

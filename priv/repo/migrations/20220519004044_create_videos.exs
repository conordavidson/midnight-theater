defmodule Reel.Repo.Migrations.CreateVideos do
  use Ecto.Migration

  def change do
    create table(:videos, primary_key: false) do
      add :id, :uuid, primary_key: true, null: false
      add :tmdb_id, :string, null: false
      add :name, :string, null: false
      add :key, :string, null: false
      add :site, :string, null: false
      add :size, :integer, null: false
      add :type, :string, null: false
      add :official, :boolean, null: false
      add :published_at, :utc_datetime, null: false
      add :data, :json, null: false
      add :movie_id, references(:movies)
      timestamps()
    end

    create unique_index(:videos, [:tmdb_id])
  end
end

defmodule Reel.Repo.Migrations.CreateMovies do
  use Ecto.Migration

  def change do
    create table(:movies, primary_key: false) do
      add :id, :uuid, primary_key: true, null: false
      add :tmdb_id, :integer, null: false
      add :imdb_id, :string
      add :overview, :text
      add :popularity, :float, null: false
      add :release_date, :date
      add :title, :string, null: false
      add :data, :json, null: false
      timestamps()
    end

    create unique_index(:movies, [:tmdb_id])
  end
end

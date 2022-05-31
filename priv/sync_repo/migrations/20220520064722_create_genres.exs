defmodule ReelSync.Repo.Migrations.CreateGenres do
  use Ecto.Migration

  def change do
    create table(:genres) do
      add :tmdb_id, :integer, null: false
      add :name, :string, null: false
      timestamps()
    end

    create unique_index(:genres, [:tmdb_id])

    create table(:movies_genres) do
      add :movie_id, references(:movies)
      add :genre_id, references(:genres)
      timestamps()
    end

    create unique_index(:movies_genres, [:movie_id, :genre_id])
  end
end

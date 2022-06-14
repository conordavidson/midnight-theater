defmodule Reel.Repo.Migrations.AddReleaseDateIndexToMovies do
  use Ecto.Migration

  def change do
    create index(:movies, [:release_date])
  end
end

defmodule Reel.Repo.Migrations.CreateSaves do
  use Ecto.Migration

  def up do
    create table(:saves) do
      add(:movie_id, references(:movies))
      add(:account_id, references(:accounts))
      add(:deleted_at, :utc_datetime)
      timestamps()
    end

    execute(
      "CREATE UNIQUE INDEX IF NOT EXISTS unique_saves ON saves (movie_id, account_id, coalesce(deleted_at, '1970-01-01'));"
    )
  end

  def down do
    drop(table(:saves))
  end
end

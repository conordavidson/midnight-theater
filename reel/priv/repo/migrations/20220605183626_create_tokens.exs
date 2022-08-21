defmodule Reel.Repo.Migrations.CreateTokens do
  use Ecto.Migration

  def change do
    create table(:tokens) do
      add :revoked_at, :utc_datetime
      add :account_id, references(:accounts)
      timestamps()
    end
  end
end

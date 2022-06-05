defmodule Reel.Repo.Migrations.CreateAccounts do
  use Ecto.Migration

  def change do
    create table(:accounts) do
      add :email, :string, null: false
      add :confirmation_token, :string
      add :confirmation_token_inserted_at, :utc_datetime
      timestamps()
    end
  end
end

defmodule Reel.Repo.Migrations.CreateImports do
  use Ecto.Migration

  def change do
    create table(:imports, primary_key: false) do
      add :id, :uuid, primary_key: true, null: false
      add :current_page, :integer, null: false
      add :total_pages, :integer, null: false
      timestamps()
    end
  end
end

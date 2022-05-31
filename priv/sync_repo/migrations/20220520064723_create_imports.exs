defmodule ReelSync.Repo.Migrations.CreateImports do
  use Ecto.Migration

  def change do
    create table(:imports) do
      add :current_page, :integer, null: false
      add :total_pages, :integer, null: false
      timestamps()
    end
  end
end

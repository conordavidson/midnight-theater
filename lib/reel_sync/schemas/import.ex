defmodule ReelSync.Schemas.Import do
  use Reel.Schema

  schema "imports" do
    field :current_page, :integer
    field :total_pages, :integer

    timestamps()
  end
end

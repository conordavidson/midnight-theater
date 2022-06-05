defmodule ReelSync.Schemas.Import do
  @moduledoc false

  use Reel.Schema

  schema "imports" do
    field :current_page, :integer
    field :total_pages, :integer

    timestamps()
  end
end

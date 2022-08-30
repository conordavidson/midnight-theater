defmodule Reel.Saves do
  import Ecto.Changeset
  import Reel.Repo
  import Ecto.Query

  alias Reel.Schemas.Save, as: Save
  alias Reel.Schemas.Account, as: Account

  def save_movie!(account, movie) do
    case get_by(Save, movie_id: movie.id, account_id: account.id) do
      save = %Save{} ->
        save

      nil ->
        %Save{}
        |> change(movie: movie, account: account)
        |> unique_constraint([:movie_id, :account_id], name: :unique_saves)
        |> insert!()
    end
  end

  def unsave_movie!(account, movie) do
    case get_by(Save, movie_id: movie.id, account_id: account.id) do
      nil ->
        :ok

      save = %Save{} ->
        save
        |> change(deleted_at: DateTime.utc_now() |> DateTime.truncate(:second))
        |> update!()
    end
  end

  def for_account(%Account{id: account_id}) do
    Save
    |> where(account_id: ^account_id)
    |> where([save], is_nil(save.deleted_at))
    |> Ecto.Query.preload(movie: [:video, :genres])
    |> Reel.Repo.all()
  end
end

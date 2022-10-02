defmodule Reel.Saves do
  @moduledoc """
  Functions around saving movies.
  """

  import Ecto.Changeset
  import Reel.Repo
  import Ecto.Query

  alias Reel.Schemas.Save, as: Save
  alias Reel.Schemas.Account, as: Account

  defp get_save(account, movie) do
    account_id = account.id
    movie_id = movie.id

    Save
    |> where(account_id: ^account_id)
    |> where(movie_id: ^movie_id)
    |> where([save], is_nil(save.deleted_at))
    |> one()
  end

  def save_movie!(account, movie) do
    case get_save(account, movie) do
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
    case get_save(account, movie) do
      save = %Save{} ->
        save
        |> change(deleted_at: DateTime.utc_now() |> DateTime.truncate(:second))
        |> update!()

      nil ->
        :ok
    end
  end

  defp saves_for_account_query(account_id) do
    Save
    |> where(account_id: ^account_id)
    |> where([save], is_nil(save.deleted_at))
  end

  def movie_ids_for_account(%Account{id: account_id}) do
    account_id
    |> saves_for_account_query()
    |> Reel.Repo.all()
    |> Enum.map(fn save -> save.movie_id end)
  end

  def for_account(%Account{id: account_id}) do
    account_id
    |> saves_for_account_query()
    |> Ecto.Query.preload(movie: [:video, :genres])
    |> Reel.Repo.all()
  end
end

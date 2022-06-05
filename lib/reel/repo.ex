defmodule Reel.Repo do
  use Ecto.Repo,
    otp_app: :reel,
    adapter: Ecto.Adapters.SQLite3

  def transact(func, opts \\ []) do
    transaction(
      fn repo ->
        Function.info(func, :arity)
        |> case do
          {:arity, 0} -> func.()
          {:arity, 1} -> func.(repo)
        end
        |> case do
          {:ok, result} -> result
          {:error, reason} -> repo.rollback(reason)
        end
      end,
      opts
    )
  end
end

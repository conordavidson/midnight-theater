defmodule Reel.Accounts do
  @moduledoc """
  This module houses account logic.
  """
  import Ecto.Query

  def account_for_token_id(login_token_id) do
    Reel.Schemas.Token
    |> preload(:account)
    |> where([token], token.id == ^login_token_id)
    |> where([token], is_nil(token.revoked_at))
    |> Reel.Repo.one()
    |> case do
      %Reel.Schemas.Token{account: account} ->
        account

      nil ->
        nil
    end
  end

  def trigger_login!(email) do
    Reel.Schemas.Account
    |> Reel.Repo.get_by(email: email)
    |> case do
      # If an account exists for this email, we'll update
      # the confirmation token and send a new login email.
      account = %Reel.Schemas.Account{} ->
        updated_account =
          account
          |> Ecto.Changeset.change(create_token_attrs())
          |> Reel.Repo.update!()

        send_login_email!(updated_account)

        email

      # If no account exists for this email, we'll create one
      # and send the welcome email.
      nil ->
        new_account =
          %Reel.Schemas.Account{}
          |> Ecto.Changeset.change(email: email)
          |> Ecto.Changeset.change(create_token_attrs())
          |> Reel.Repo.insert!()

        send_welcome_email!(new_account)

        email
    end
  end

  def create_login_token(confirmation_token) do
    Reel.Schemas.Account
    |> where([account], account.confirmation_token == ^confirmation_token)
    |> Reel.Repo.one()
    |> case do
      account = %Reel.Schemas.Account{} ->
        if confirmation_token_expired?(account) do
          {:error, :expired}
        else
          Reel.Repo.transact(fn repo ->
            %Reel.Schemas.Token{account_id: account.id}
            |> repo.insert()
            |> case do
              {:ok, token} ->
                account
                |> Ecto.Changeset.change(%{
                  confirmation_token: nil,
                  confirmation_token_inserted_at: nil
                })
                |> repo.update()
                |> case do
                  {:ok, _account} ->
                    {:ok, token}

                  {:error, reason} ->
                    {:error, reason}
                end

              {:error, reason} ->
                {:error, reason}
            end
          end)
        end

      nil ->
        {:error, :token_not_found}
    end
  end

  def logout!(login_token_id) when is_binary(login_token_id) do
    case Reel.Repo.get(Reel.Schemas.Token, login_token_id) do
      token = %Reel.Schemas.Token{revoked_at: nil} ->
        token
        |> Ecto.Changeset.change(%{
          revoked_at: DateTime.utc_now() |> DateTime.truncate(:second)
        })
        |> Reel.Repo.update!()

      _ ->
        :ok
    end
  end

  def logout!(_), do: :ok

  defp create_token_attrs do
    %{
      confirmation_token: Ecto.UUID.generate(),
      confirmation_token_inserted_at: DateTime.utc_now() |> DateTime.truncate(:second)
    }
  end

  defp send_login_email!(account) do
    account
    |> ReelWeb.Emails.login_email()
    |> Reel.Mailer.deliver!()
  end

  defp send_welcome_email!(account) do
    account
    |> ReelWeb.Emails.welcome_email()
    |> Reel.Mailer.deliver!()
  end

  # One day
  @token_ttl_seconds 86_400

  # Exposed for testing
  def token_ttl_seconds, do: @token_ttl_seconds

  defp confirmation_token_expired?(%Reel.Schemas.Account{confirmation_token: nil}) do
    true
  end

  defp confirmation_token_expired?(%Reel.Schemas.Account{
         confirmation_token_inserted_at: inserted_at
       }) do
    inserted_at
    |> DateTime.add(@token_ttl_seconds, :second)
    |> DateTime.compare(DateTime.utc_now())
    |> case do
      :lt ->
        true

      _ ->
        false
    end
  end
end

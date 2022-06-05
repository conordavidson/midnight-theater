defmodule ReelWeb.LoginsController do
  use ReelWeb, :controller

  def create(conn, %{"email" => email}) do
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

      # If no account exists for this email, we'll create one
      # and send the welcome email.
      nil ->
        new_account =
          %Reel.Schemas.Account{}
          |> Ecto.Changeset.change(email: email)
          |> Ecto.Changeset.change(create_token_attrs())
          |> Reel.Repo.insert!()

        send_welcome_email!(new_account)
    end

    conn
    |> put_status(:created)
    |> json(%{email: email})
  end

  def create(conn) do
    conn
    |> put_status(:bad_request)
    |> json(%{})
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

  defp create_token_attrs do
    %{
      confirmation_token: Ecto.UUID.generate(),
      confirmation_token_inserted_at: DateTime.utc_now() |> DateTime.truncate(:second)
    }
  end
end

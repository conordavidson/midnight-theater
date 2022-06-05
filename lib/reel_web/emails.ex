defmodule ReelWeb.Emails do
  import Swoosh.Email

  def login_email(account = %Reel.Schemas.Account{}) do
    new()
    |> to(account.email)
    |> from({"Midnight Theater", "hello@midnight.theater"})
    |> subject("Login to Midnight Theater")
    |> html_body(
      "<h1>Hello again!</h1><br/><a href='#{login_path(account)}'>Login to Midnight Theater here</a>"
    )
    |> text_body("Hello again! Login to Midnight Theater here: #{login_path(account)}")
  end

  def welcome_email(account = %Reel.Schemas.Account{}) do
    new()
    |> to(account.email)
    |> from({"Midnight Theater", "hello@midnight.theater"})
    |> subject("Welcome to Midnight Theater")
    |> html_body(
      "<h1>Welcome to Midnight Theater!</h1><br/><a href='#{login_path(account)}'>Login to Midnight Theater here</a>"
    )
    |> text_body(
      "Welcome to Midnight Theater!. Login to Midnight Theater here: #{login_path(account)}"
    )
  end

  def login_path(%Reel.Schemas.Account{confirmation_token: confirmation_token}) do
    ReelWeb.Router.Helpers.logins_url(ReelWeb.Endpoint, :show, confirmation_token)
  end
end

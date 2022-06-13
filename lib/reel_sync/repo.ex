defmodule ReelSync.Repo do
  use Ecto.Repo,
    otp_app: :reel,
    adapter: Ecto.Adapters.Postgres
end

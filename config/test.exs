import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :reel, Reel.Repo,
  database: Path.expand("../data/reel_test.db", Path.dirname(__ENV__.file)),
  pool_size: 5,
  pool: Ecto.Adapters.SQL.Sandbox,
  show_sensitive_data_on_connection_error: true,
  migration_primary_key: [name: :id, type: :uuid],
  migration_foreign_key: [column: :id, type: :uuid],
  priv: "priv/repo"

config :reel, ReelSync.Repo,
  database: Path.expand("../data/reel_sync_test.db", Path.dirname(__ENV__.file)),
  pool_size: 5,
  pool: Ecto.Adapters.SQL.Sandbox,
  show_sensitive_data_on_connection_error: true,
  migration_primary_key: [name: :id, type: :uuid],
  migration_foreign_key: [column: :id, type: :uuid],
  priv: "priv/sync_repo"

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :reel, ReelWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "ufUt3u6hYewiAbC0J68wKPKtgMBjvcb1FY142UgW5nkapHBub8RygCzHLQs5JYuX",
  server: false

# In test we don't send emails.
config :reel, Reel.Mailer, adapter: Swoosh.Adapters.Test

# Print only warnings and errors during test
config :logger, level: :warn

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

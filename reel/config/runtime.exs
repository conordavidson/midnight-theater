import Config

# config/runtime.exs is executed for all environments, including
# during releases. It is executed after compilation and before the
# system starts, so it is typically used to load production configuration
# and secrets from environment variables or elsewhere. Do not define
# any compile-time configuration in here, as it won't be applied.
# The block below contains prod specific runtime configuration.
if System.get_env("PHX_SERVER") && System.get_env("RELEASE_NAME") do
  config :reel, ReelWeb.Endpoint, server: true
end

config :reel, :tmdb,
  api_key:
    System.get_env("TMDB_API_KEY") ||
      raise("""
      TMDB_API_KEY not found
      """)

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing
      """

  config :reel, Reel.Repo,
    url: database_url,
    database: "reel",
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "5"),
    migration_primary_key: [name: :id, type: :uuid],
    migration_foreign_key: [column: :id, type: :uuid],
    priv: "priv/repo",
    ssl: false,
    socket_options: [:inet6]

  # The secret key base is used to sign/encrypt cookies and other secrets.
  # A default value is used in config/dev.exs and config/test.exs but you
  # want to use a different value for prod and you most likely don't want
  # to check this value into version control, so we use an environment
  # variable instead.
  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  host = System.get_env("PHX_HOST") || "example.com"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :reel, ReelWeb.Endpoint,
    url: [host: host, port: 443],
    http: [
      # Enable IPv6 and bind on all interfaces.
      # Set it to  {0, 0, 0, 0, 0, 0, 0, 1} for local network only access.
      # See the documentation on https://hexdocs.pm/plug_cowboy/Plug.Cowboy.html
      # for details about using IPv6 vs IPv4 and loopback vs public addresses.
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base,
    force_ssl: [hsts: true]

  # ## Using releases
  #
  # If you are doing OTP releases, you need to instruct Phoenix
  # to start each relevant endpoint:
  #
  #     config :reel, ReelWeb.Endpoint, server: true
  #
  # Then you can assemble a release by calling `mix release`.
  # See `mix help release` for more information.

  aws_ses_region =
    System.get_env("AWS_SES_REGION") ||
      raise """
      environment variable AWS_SES_REGION is missing
      """

  aws_ses_access_key =
    System.get_env("AWS_SES_ACCESS_KEY") ||
      raise """
      environment variable AWS_SES_ACCESS_KEY is missing
      """

  aws_ses_secret =
    System.get_env("AWS_SES_SECRET") ||
      raise """
      environment variable AWS_SES_SECRET is missing
      """

  config :reel, Reel.Mailer,
    adapter: Swoosh.Adapters.AmazonSES,
    region: aws_ses_region,
    access_key: aws_ses_access_key,
    secret: aws_ses_secret

  #
  # For this example you need include a HTTP client required by Swoosh API client.
  # Swoosh supports Hackney and Finch out of the box:
  #
  #     config :swoosh, :api_client, Swoosh.ApiClient.Hackney
  #
  # See https://hexdocs.pm/swoosh/Swoosh.html#module-installation for details.
end

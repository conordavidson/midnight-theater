defmodule Reel.Sync do
  import Ecto.Query

  def run do
    get_latest_import()
    |> get_movies()
  end

  def get_movies(import_record) do
    page =
      case import_record do
        %Reel.Schemas.Import{current_page: current_page} -> current_page + 1
        nil -> 1
      end

    movies =
      %{"page" => current_page, "total_pages" => total_pages} =
      Reel.Sync.Tmdb.Movies.index(%{page: page})
      |> parse_body!()

    process_movies!(movies)

    import_record =
      case import_record do
        %Reel.Schemas.Import{} ->
          import_record
          |> Ecto.Changeset.change(%{current_page: current_page, total_pages: total_pages})
          |> Reel.Repo.update!()

        nil ->
          %Reel.Schemas.Import{current_page: current_page, total_pages: total_pages}
          |> Reel.Repo.insert!()
      end

    if current_page < total_pages do
      get_movies(import_record)
    else
      :ok
    end
  end

  def get_latest_import() do
    Reel.Schemas.Import
    |> where([imp], imp.current_page < imp.total_pages)
    |> order_by(desc: :inserted_at)
    |> limit(1)
    |> Reel.Repo.one()
  end

  def process_movies!(%{"results" => movies}) when is_list(movies) do
    Enum.map(movies, &process_movie_summary/1)
  end

  def process_movies!(e) do
    IO.puts(inspect(e))
    raise "No results key in Movies.index response"
  end

  def process_movie_summary(%{"id" => id}) do
    Reel.Sync.Tmdb.Movies.get(id)
    |> parse_body!()
    |> handle_movie_response()
  end

  def handle_movie_response(movie = %{"videos" => %{"results" => videos}}) when is_list(videos) do
    movie_record = persist_movie!(movie)
    Enum.map(videos, fn video -> persist_video!(movie_record, video) end)
  end

  def handle_movie_response(e) do
    IO.puts(inspect(e))
    raise "No videos key in Movies.get response"
  end

  def persist_movie!(movie = %{"id" => tmdb_id}) do
    params =
      movie
      |> Map.delete("id")
      |> Map.put("tmdb_id", tmdb_id)
      |> Map.put("data", movie)

    Reel.Schemas.Movie
    |> Reel.Repo.get_by(tmdb_id: tmdb_id)
    |> case do
      nil ->
        %Reel.Schemas.Movie{}
        |> movie_changeset(params)
        |> Reel.Repo.insert!()

      movie ->
        movie
        |> movie_changeset(params)
        |> Reel.Repo.update!()
    end
  end

  def persist_video!(%Reel.Schemas.Movie{id: movie_id}, video = %{"id" => tmdb_id}) do
    params =
      video
      |> Map.delete("id")
      |> Map.put("tmdb_id", tmdb_id)
      |> Map.put("movie_id", movie_id)
      |> Map.put("data", video)

    Reel.Schemas.Video
    |> Reel.Repo.get_by(tmdb_id: tmdb_id)
    |> case do
      nil ->
        %Reel.Schemas.Video{}
        |> video_changeset(params)
        |> Reel.Repo.insert!()

      video ->
        video
        |> video_changeset(params)
        |> Reel.Repo.update!()
    end
  end

  def movie_changeset(movie, params) do
    Ecto.Changeset.cast(movie, params, [
      :tmdb_id,
      :imdb_id,
      :overview,
      :popularity,
      :release_date,
      :title,
      :data
    ])
  end

  def video_changeset(video, params) do
    Ecto.Changeset.cast(video, params, [
      :tmdb_id,
      :name,
      :key,
      :site,
      :size,
      :type,
      :official,
      :published_at,
      :data,
      :movie_id
    ])
  end

  def parse_body!({:ok, %HTTPoison.Response{body: body}}) do
    Jason.decode!(body)
  end

  def parse_body!(e) do
    IO.puts(e)
    raise "Error parsing body"
  end

  defmodule Tmdb do
    def base_url do
      "https://api.themoviedb.org/3"
    end

    def api_key do
      Application.fetch_env!(:reel, :tmdb)[:api_key]
    end

    defmodule Movies do
      def get(movie_id) do
        HTTPoison.get(
          "#{Tmdb.base_url()}/movie/#{movie_id}?api_key=#{Tmdb.api_key()}&append_to_response=videos,images"
        )
      end

      def index(%{page: page}) do
        HTTPoison.get(
          "#{Tmdb.base_url()}/discover/movie?api_key=#{Tmdb.api_key()}&include_adult=false&include_video=false&page=#{page}"
        )
      end
    end
  end
end

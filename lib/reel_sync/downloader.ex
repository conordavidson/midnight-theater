defmodule ReelSync.Downloader do
  import Ecto.Query

  def run do
    {:ok, file} = File.read("./data/movie_ids_05_19_2022.json")

    movies =
      file
      |> String.split("\n", trim: true)
      |> Enum.map(&Jason.decode!/1)
      |> Enum.filter(fn %{"video" => video} -> video == false end)
      |> Enum.sort_by(fn %{"id" => id} -> id end)

    latest_import = get_latest_import()

    download(latest_import, movies)
  end

  def download(import_record, movies) do
    beginning_page =
      case import_record do
        %ReelSync.Schemas.Import{current_page: current_page} -> current_page + 1
        nil -> 1
      end

    end_page = beginning_page + 100

    movie_chunk = Enum.slice(movies, beginning_page..end_page)

    tasks =
      movie_chunk
      |> Enum.map(fn %{"id" => id} ->
        Task.async(fn ->
          ReelSync.Downloader.Tmdb.Movies.get(id)
          |> parse_body!()
        end)
      end)

    Task.await_many(tasks)
    |> Enum.map(fn
      movie = %{"id" => _id} ->
        handle_movie_response!(movie)

      %{
        "status_code" => 34,
        "status_message" => "The resource you requested could not be found."
      } ->
        :ok
    end)

    import_record =
      case import_record do
        %ReelSync.Schemas.Import{} ->
          import_record
          |> Ecto.Changeset.change(%{current_page: end_page, total_pages: length(movies)})
          |> ReelSync.Repo.update!()

        nil ->
          %ReelSync.Schemas.Import{current_page: end_page, total_pages: length(movies)}
          |> ReelSync.Repo.insert!()
      end

    if end_page < length(movies) do
      download(import_record, movies)
    else
      :ok
    end
  end

  def get_latest_import() do
    ReelSync.Schemas.Import
    |> where([imp], imp.current_page < imp.total_pages)
    |> order_by(desc: :inserted_at)
    |> limit(1)
    |> ReelSync.Repo.one()
  end

  def handle_movie_response!(movie = %{"videos" => %{"results" => videos}})
      when is_list(videos) do
    movie_record = persist_movie!(movie)
    Enum.map(videos, fn video -> persist_video!(movie_record, video) end)
  end

  def handle_movie_response(e) do
    IO.puts(inspect(e))
    raise "No videos key in Movies.get response"
  end

  def persist_movie!(movie = %{"id" => tmdb_id, "genres" => genres}) do
    genres =
      Enum.map(genres, fn %{"name" => name, "id" => tmdb_id} ->
        ReelSync.Schemas.Genre
        |> ReelSync.Repo.get_by(tmdb_id: tmdb_id)
        |> case do
          genre = %ReelSync.Schemas.Genre{} ->
            genre

          nil ->
            %ReelSync.Schemas.Genre{}
            |> genre_changeset(%{"tmdb_id" => tmdb_id, "name" => name})
            |> ReelSync.Repo.insert!()
        end
      end)
      # There was a case in the dataset where the genre was not unique in the set:
      # ID: 467af6dc-bb80-41ae-a392-41b91817cf39
      |> Enum.uniq_by(fn %{id: id} -> id end)

    params =
      movie
      |> Map.delete("id")
      |> Map.put("tmdb_id", tmdb_id)
      |> Map.put("data", movie)

    ReelSync.Schemas.Movie
    |> ReelSync.Repo.get_by(tmdb_id: tmdb_id)
    |> ReelSync.Repo.preload(:genres)
    |> case do
      nil ->
        %ReelSync.Schemas.Movie{}
        |> movie_changeset(params, genres)
        |> ReelSync.Repo.insert!()

      movie ->
        movie
        |> movie_changeset(params, genres)
        |> ReelSync.Repo.update!()
    end
  end

  def persist_video!(%ReelSync.Schemas.Movie{id: movie_id}, video = %{"id" => tmdb_id}) do
    params =
      video
      |> Map.delete("id")
      |> Map.put("tmdb_id", tmdb_id)
      |> Map.put("movie_id", movie_id)
      |> Map.put("data", video)

    ReelSync.Schemas.Video
    |> ReelSync.Repo.get_by(tmdb_id: tmdb_id)
    |> case do
      nil ->
        %ReelSync.Schemas.Video{}
        |> video_changeset(params)
        |> ReelSync.Repo.insert!()

      video ->
        video
        |> video_changeset(params)
        |> ReelSync.Repo.update!()
    end
  end

  def movie_changeset(movie, params, genres) do
    Ecto.Changeset.cast(movie, params, [
      :tmdb_id,
      :imdb_id,
      :overview,
      :popularity,
      :release_date,
      :title,
      :data
    ])
    |> Ecto.Changeset.put_assoc(:genres, genres)
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

  def genre_changeset(genre, params) do
    Ecto.Changeset.cast(genre, params, [
      :tmdb_id,
      :name
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

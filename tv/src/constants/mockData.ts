export interface MediaItem {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  type: 'movie' | 'tv';
  genres?: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: {
    id: number;
    name: string;
    episode_count: number;
    season_number: number;
    poster_path: string | null;
  }[];
  trailer_key?: string | null;
  cast?: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }[];
  director?: string;
  similar?: MediaItem[];
  reviews?: {
    author: string;
    content: string;
    rating?: number;
    created_at: string;
  }[];
}

export const trendingMovies: MediaItem[] = [
  {
    id: 157336,
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
    release_date: "2014-11-05",
    vote_average: 8.4,
    type: 'movie'
  },
  {
    id: 27205,
    title: "Inception",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
    poster_path: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/s3TBrRGB1invgHHzsgaFS1B31ls.jpg",
    release_date: "2010-07-15",
    vote_average: 8.3,
    type: 'movie'
  },
  {
    id: 155,
    title: "The Dark Knight",
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5vn0yKzLdvcO33j.jpg",
    release_date: "2008-07-14",
    vote_average: 8.5,
    type: 'movie'
  },
  {
    id: 299534,
    title: "Avengers: Endgame",
    overview: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
    poster_path: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    release_date: "2019-04-24",
    vote_average: 8.3,
    type: 'movie'
  },
  {
    id: 603,
    title: "The Matrix",
    overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
    poster_path: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/ncEsesgOJDNrTUED89hYbA117jy.jpg",
    release_date: "1999-03-30",
    vote_average: 8.2,
    type: 'movie'
  },
  {
    id: 118340,
    title: "Guardians of the Galaxy",
    overview: "Light years from Earth, 26 years after being abducted, Peter Quill finds himself the prime target of a manhunt after discovering an orb wanted by Ronan the Accuser.",
    poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/bHarw8xrmQeqf3t8HpuMY7zoK4x.jpg",
    release_date: "2014-07-30",
    vote_average: 7.9,
    type: 'movie'
  }
];

export const newReleases: MediaItem[] = [
  {
    id: 693134,
    title: "Dune: Part Two",
    overview: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vtec042ptef8O.jpg",
    release_date: "2024-02-27",
    vote_average: 8.3,
    type: 'movie'
  },
  {
    id: 324857,
    title: "Spider-Man: Into the Spider-Verse",
    overview: "Miles Morales is juggling his life between being a high school student and being a spider-man. When Wilson \"Kingpin\" Fisk uses a super collider, others from across the Spider-Verse are transported to this dimension.",
    poster_path: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/eNI7PtK6DEYgZmHWP9gQNuff8pv.jpg",
    release_date: "2018-12-06",
    vote_average: 8.4,
    type: 'movie'
  },
  {
    id: 550,
    title: "Fight Club",
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground \"fight clubs\" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.",
    poster_path: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/hZkgoQYus5vesReqk4TpIt0Q2B5.jpg",
    release_date: "1999-10-15",
    vote_average: 8.4,
    type: 'movie'
  },
  {
    id: 76341,
    title: "Mad Max: Fury Road",
    overview: "An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken, and most everyone is crazed fighting for the necessities of life.",
    poster_path: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/x2RsT8qN4vX6RzBf2aH596Jz4L8.jpg",
    release_date: "2015-05-13",
    vote_average: 7.6,
    type: 'movie'
  },
  {
    id: 122,
    title: "The Lord of the Rings: The Return of the King",
    overview: "Aragorn is revealed as the heir to the ancient kings as he, and the rest of the fellowship, join forces to defend Minas Tirith from Sauron's growing army.",
    poster_path: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg",
    release_date: "2003-12-01",
    vote_average: 8.5,
    type: 'movie'
  },
  {
    id: 286217,
    title: "The Martian",
    overview: "During a manned mission to Mars, Astronaut Mark Watney is presumed dead after a fierce storm and left behind by his crew. But Watney has survived and finds himself stranded and alone on the hostile planet.",
    poster_path: "https://image.tmdb.org/t/p/w500/5BHuvQ6p9kfc091Z8RiFNhCwL4b.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/mNBI1P103mI8L6x0m0vD615L2mG.jpg",
    release_date: "2015-09-30",
    vote_average: 7.7,
    type: 'movie'
  }
];

export const mockTVShows: MediaItem[] = [
  {
    id: 76479,
    title: "The Boys",
    overview: "A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.",
    poster_path: "https://image.tmdb.org/t/p/w500/stKG4Shj68F7n5nBvuxN27y9xA0.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/nTvM0mh3chg7v2v26R0P07SF4qF.jpg",
    release_date: "2019-07-25",
    vote_average: 8.5,
    type: 'tv',
    number_of_seasons: 4,
    seasons: [
      { id: 1, name: "Season 1", episode_count: 8, season_number: 1, poster_path: null },
      { id: 2, name: "Season 2", episode_count: 8, season_number: 2, poster_path: null },
      { id: 3, name: "Season 3", episode_count: 8, season_number: 3, poster_path: null },
      { id: 4, name: "Season 4", episode_count: 8, season_number: 4, poster_path: null }
    ]
  },
  {
    id: 66732,
    title: "Stranger Things",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    poster_path: "https://image.tmdb.org/t/p/w500/x2LSRm25n5nC1y6xIFUF5I70chX.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/56v2Kj27h6n2uqgxwTEzwsu3mZ8.jpg",
    release_date: "2016-07-15",
    vote_average: 8.6,
    type: 'tv',
    number_of_seasons: 4,
    seasons: [
      { id: 1, name: "Season 1", episode_count: 8, season_number: 1, poster_path: null },
      { id: 2, name: "Season 2", episode_count: 9, season_number: 2, poster_path: null },
      { id: 3, name: "Season 3", episode_count: 8, season_number: 3, poster_path: null },
      { id: 4, name: "Season 4", episode_count: 9, season_number: 4, poster_path: null }
    ]
  },
  {
    id: 93405,
    title: "Squid Game",
    overview: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits — with deadly high stakes.",
    poster_path: "https://image.tmdb.org/t/p/w500/dDlEmu3EZ0G79vI67hugV0oQWCV.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/1R646QUS2z2785i5iFhr4suCg27.jpg",
    release_date: "2021-09-17",
    vote_average: 8.3,
    type: 'tv',
    number_of_seasons: 2,
    seasons: [
      { id: 1, name: "Season 1", episode_count: 9, season_number: 1, poster_path: null },
      { id: 2, name: "Season 2", episode_count: 6, season_number: 2, poster_path: null }
    ]
  }
];

export const getMovieById = (id: number): MediaItem | undefined => {
  return [...trendingMovies, ...newReleases].find(movie => movie.id === id);
};

export const getTVShowById = (id: number): MediaItem | undefined => {
  return mockTVShows.find(show => show.id === id);
};

export const top10Movies = [...trendingMovies, ...newReleases].slice(0, 10);
export const lumoraOriginals = [...mockTVShows, ...newReleases];
export const topRatedMovies = [...trendingMovies].sort((a, b) => b.vote_average - a.vote_average);
export const comedyMovies = [...newReleases, ...trendingMovies].slice(2, 8);

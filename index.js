const { Octokit } = require("@octokit/rest");
const fetch = require("node-fetch");
const fs = require("fs");

const {
  GIST_ID: gistId,
  GITHUB_TOKEN: githubToken,
  SPOTIFY_CLIENT_SECRET: spotifyClientSecret,
  SPOTIFY_CLIENT_ID: spotifyClientId
} = process.env;

let spotifyCode = process.env.SPOTIFY_CODE;

const API_BASE = "https://api.spotify.com/v1";
const AUTH_CACHE_FILE = "spotify-auth.json";

const octokit = new Octokit({
  auth: `token ${githubToken}`
});

async function main() {
  const spotifyData = await getSpotifyData();
  await updateGist(spotifyData);
}

/**
 * Updates cached spotify authentication tokens when necessary (1 hr expiriy)
 */
async function getSpotifyToken() {
  // default env vars go in here (temp cache)
  let cache = {};
  let formData = {
    grant_type: "authorization_code",
    code: spotifyCode,
    redirect_uri: "http://localhost/"
  };

  // try to read cache from disk if already exists
  try {
    const jsonStr = fs.readFileSync(AUTH_CACHE_FILE);
    const c = JSON.parse(jsonStr);
    Object.keys(c).forEach(key => {
      cache[key] = c[key];
    });
  } catch (error) {
    console.log(error);
  }

  if (cache.spotifyRefreshToken) {
    console.debug(`ref: ${cache.spotifyRefreshToken.substring(0, 6)}`);
    formData = {
      grant_type: "refresh_token",
      refresh_token: cache.spotifyRefreshToken
    };
  }

  // get new tokens
  const data = await fetch("https://accounts.spotify.com/api/token", {
    method: "post",
    body: encodeFormData(formData),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        new Buffer.from(spotifyClientId + ":" + spotifyClientSecret).toString(
          "base64"
        )
    }
  })
    .then(data => data.json())
    .catch(error => console.debug(error));
  console.debug(data);
  cache.spotifyAccessToken = data.access_token;
  if (data.refresh_token) {
    cache.spotifyRefreshToken = data.refresh_token;
    console.debug(`ref: ${cache.spotifyRefreshToken.substring(0, 6)}`);
  }
  console.debug(`acc: ${cache.spotifyAccessToken.substring(0, 6)}`);

  // save to disk
  fs.writeFileSync(AUTH_CACHE_FILE, JSON.stringify(cache));

  return cache.spotifyAccessToken;
}

const encodeFormData = data => {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
};

/**
 * Fetches your data from the spotify API
 */
async function getSpotifyData() {
  // recent 20 played data (add other endpoints for more info as needed)
  const recentlyPlayedData = await fetch(
    `${API_BASE}/me/player/recently-played?limit=20`,
    {
      method: "get",
      headers: {
        Authorization: "Bearer " + (await getSpotifyToken())
      }
    }
  )
    .then(data => data.json())
    .catch(error => console.debug(error));

  return recentlyPlayedData;
}

async function updateGist(data) {
  let gist;
  let songs = [];
  let lines = "";

  try {
    gist = await octokit.gists.get({ gist_id: gistId });
  } catch (error) {
    console.error(`Unable to get gist\n${error}`);
    throw error;
  }

  data.items.forEach(item =>
    songs.push(`${item.track.name} - ${item.track.artists[0].name}`)
  );

  console.debug(songs);

  const songListenCount = songs.reduce((prev, curr) => {
    prev[curr] = (prev[curr] || 0) + 1;
    return prev;
  }, {});

  const songList = Object.keys(songListenCount);
  const songOnRepeat = Object.keys(songListenCount).reduce((a, b) =>
    songListenCount[a] > songListenCount[b] ? a : b
  );

  lines += `🎧 On Repeat Recently: ${
    songListenCount[songOnRepeat] > 2 ? songOnRepeat : "Nothing..."
  }\n\n`;
  lines += songList.join("\n");

  try {
    const filename = Object.keys(gist.data.files)[0];
    await octokit.gists.update({
      gist_id: gistId,
      files: {
        [filename]: {
          filename: `🎼 Kan's Spotify Activity`,
          content: lines
        }
      }
    });
  } catch (error) {
    console.error(`Unable to update gist\n${error}`);
    throw error;
  }
}

(async () => {
  await main();
})();

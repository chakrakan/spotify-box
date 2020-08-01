<p align="center">
  <a href="https://github.com/chakrakan/spotify-box"><img src="https://github.com/chakrakan/spotify-box/blob/master/demo/demo.PNG" width="400" alt="Spotify Box Demo" /></a>
  <h3 align="center">spotify-box</h3>
  <p align="center">🎵 Update a gist to contain your recently played songs on Spotify</p>
</p>

[![Spotify Box](https://circleci.com/gh/chakrakan/spotify-box.svg?style=svg)](https://github.com/chakrakan/spotify-box)

## Setup

### Prep Work

1. You need to [create your own application](https://developer.spotify.com/dashboard/login) on Spotify to manage integrations
2. Edit settings for your app on Spotify dev dashboard, specifically, add a dummy `redirect_uri`. For my integration I've used `http://localhost/` you can use any other uri as per your choice.

> Note: if you use a different uri, then please make sure you update this [line](https://github.com/chakrakan/spotify-box/blob/9e433bcd627d02962821d9d3e36b82e53d34a4b3/index.js#L35) with yours.

3. Take note of your Spotify app's `client id` and `client secret`
4. [Create a new public](https://gist.github.com/) GitHub Gist
5. [Create a token](https://github.com/settings/tokens/new) with the `gist` scope and copy it
6. Generate an authentication code for your spotify account for using your newly created application by constructing this URL using your apps `client id` and your set `redirect uri` (make sure it's [url encoded](https://www.urlencoder.org/)) as values for the respective query params:

```sh
https://accounts.spotify.com/authorize?client_id=<YOUR-CLIENT-ID-HERE>&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%2F&scope=user-top-read%20user-read-recently-played
```

7. Copy the generated code after the `code` query from the resulting response url query result which should look like this: `http://localhost/?code=<COPY-EVERYTHING-HERE>`

### Project Setup

1. Fork this repo
2. Modify this [line](https://github.com/chakrakan/spotify-box/blob/6500aa6008b125ac982dc3726e9cfa7d278a1c88/index.js#L151) to your name or anything you want to title the gist as
3. Log into CircleCI with your GitHub (https://circleci.com/vcs-authorize/)
4. Click on "Add Projects" on the sidebar
5. Set up a project with the newly created fork
6. Go to Project Settings > Environment Variables
7. Add the following environment variables:

- GIST_ID: The ID portion from your gist url `https://gist.github.com/<github username>/`**`6d5f84419863089a167387da62dd7081`**.
- GITHUB_TOKEN: The GitHub token generated above.
- SPOTIFY_CLIENT_ID: Your Spotify application client id
- SPOTIFY_CLIENT_SECRET: Your Spotify application client secret
- SPOTIFY_CODE: The code generated for you when you visited the constructed URL above in the last step of the prep work section

### Previous Work

This repo is inspired by [matchai's waka-box](https://github.com/matchai/waka-box) and [john's strava-box](https://github.com/JohnPhamous/strava-box)

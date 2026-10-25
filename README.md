# OldSkool.fm

80s, 90s and 2000s Bollywood classics, nonstop. Free, no login, **no ads**.
Audio-only player. Songs stream straight from the [Internet Archive](https://archive.org)
(archive.org), a free non-profit library. No YouTube, no API key, no ads.

## Put it online with GitHub Pages

1. Create a new **public** repo on GitHub named `Oldskool.fm`.
2. Upload every file from this zip (`index.html`, `README.md`, `.nojekyll`) to the repo's main branch.
3. In the repo, go to **Settings → Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, pick **main** and **/ (root)**, then click **Save**.
4. Wait about a minute. Your link will be:
   `https://<your-github-username>.github.io/Oldskool.fm/`

Share that link to test. It works on phones and computers.

## How the playlists work

Each playlist is a live search on the Internet Archive. When someone opens a playlist,
the site:

1. searches archive.org for Bollywood audio that matches the playlist (for example
   *romantic + 90s + Kumar Sanu*), most downloaded first,
2. opens the top albums it finds and collects their MP3 songs,
3. mixes songs from different albums, cleans up names (drops "[Songs.PK]", track
   numbers and so on) and keeps up to 150 songs.

Each visitor's browser remembers the song list for 3 days, so it loads instantly after the first visit.
Because the search runs live, a playlist recovers on its own if an upload is removed from archive.org.

## Change or add a playlist

Open `index.html` and find `const STATIONS` near the top of the script. Each line is one playlist:

```js
{ key:"rom", group:"Moods", name:"Romantic", sub:"Pyaar, ishq, mohabbat", mark:"♡", art:"#FF4F8B",
  q:`${HINDI} AND (romantic OR "love songs" OR love)`, alt:`romantic AND (hindi OR bollywood)` },
```

- `group` is the heading it sits under in the menu (Start here, Eras, Moods, Singers, Composers).
- `q` is what gets searched. Use `AND` / `OR` and put phrases in quotes, e.g. `"jagjit singh"`.
  `${HINDI}` is shorthand for *bollywood OR hindi film OR hindi songs…*.
- `alt` is an optional looser search, used only when `q` finds fewer than 30 songs.
- Singers use a shortcut: `...singer("kishore kumar")` fills in both searches for you.
- To try a search first, paste it on https://archive.org/search (choose **Audio**) and see what comes up.

### Pin your favourite albums (optional)

If you find an album on archive.org you love, add its ID with `items` and it always plays first:

1. Open the album page, for example `https://archive.org/details/your-album-id`
2. The ID is the part after `/details/`: `your-album-id`
3. Add it to a station:
   ```js
   { key:"rom", ..., items:["your-album-id"], q:`...` },
   ```

You can use `items` without `q` to make a fully hand-picked playlist.

## Good to know

- Search in the header finds songs from the playlists already loaded, plus albums anywhere
  on the Internet Archive. Tap an album to play all of it.
- Liked songs and volume are saved in each visitor's own browser.
- If a song won't load, the player skips to the next one.
- Song quality and naming depend on whoever uploaded them to archive.org, so some names can look messy.
- Many Bollywood uploads on archive.org are posted by fans, not by the music labels.
  The Archive takes uploads down when rights holders ask, so songs come and go over time.

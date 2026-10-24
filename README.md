# OldSkool.fm

80s, 90s and 2000s Bollywood classics, nonstop. Free, no login.
Audio-only player. Songs stream from public YouTube playlists of Hindi classics.

## Put it online with GitHub Pages

1. Create a new **public** repo on GitHub named `Oldskool.fm`.
2. Upload every file from this zip (`index.html`, `README.md`, `.nojekyll`) to the repo's main branch.
3. In the repo, go to **Settings → Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, pick **main** and **/ (root)**, then click **Save**.
4. Wait about a minute. Your link will be:
   `https://<your-github-username>.github.io/Oldskool.fm/`

Share that link to test. It works on phones and computers.

## Change the stations

Open `index.html` and find `const STATIONS` near the top of the script.
Each station is one YouTube or YouTube Music playlist. To swap one:

1. Open the playlist on YouTube Music and copy its link, for example
   `https://music.youtube.com/playlist?list=PLMRKdK25AuPVjHl9Kdb-gkBy0Cm7Zi2xo`
2. Copy the part after `list=` and paste it as that station's `list` value.
3. Change `name` and `sub` to match, then commit. The site updates in about a minute.

Only public playlists work. If a playlist is deleted or made private, its station shows
"This playlist couldn't load" until you replace it.

## Most played songs first (optional, free)

Add a free YouTube Data API key and every playlist is sorted by YouTube views,
so the biggest classics play first.

1. Go to https://console.cloud.google.com and create a project (any name).
2. Open **APIs & Services → Library**, search **YouTube Data API v3**, click **Enable**.
3. Open **APIs & Services → Credentials → Create credentials → API key**. Copy the key.
4. Click the key → **Application restrictions → Websites** → add
   `https://ekantshukla.github.io/*` → **Save**. This stops anyone else from using your key.
5. In `index.html`, find `const YT_API_KEY = "";` and paste your key between the quotes. Commit.

The free quota is far more than this site needs, and the sorted list is cached in each
visitor's browser for 3 days.

## Good to know

- Music only plays on a real website (GitHub Pages, Netlify and so on). Opening `index.html`
  straight from your computer may not play, because YouTube needs a proper web address.
- If a song's owner blocks it from playing on other sites, the player skips to the next one.
- Liked songs are saved in each visitor's own browser.
- Ads come from YouTube. Visitors signed in to YouTube Premium in the same browser usually
  hear no ads; everyone else may hear one now and then.

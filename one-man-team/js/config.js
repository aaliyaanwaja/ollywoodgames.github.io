/* Release settings. Kept apart from the game code so the owner can change them without touching it.
   statsUrl   where the two anonymous statistics messages go (retention plan, proposal 1; privacy.html). EMPTY: nothing is
              collected, queued or sent until an endpoint exists. When one is set, the app's store build also needs the
              INTERNET permission back (app/app.config.js) and the Play Data safety answers in app/README.md switched over.
   site       the public web build. Share links point here (?daily=N opens that day's move in a browser) and later Daily
              Moves are fetched from site + 'daily/YYYY-MM.json'. GitHub Pages must be switched on for the repository
              (Settings, Pages, branch main, folder /) before either works. */
window.OMT_SETTINGS = {
  statsUrl: '',
  site: 'https://aaliyaanwaja.github.io/ollywoodgames.github.io/one-man-team/'
};

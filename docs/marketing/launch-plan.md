# One-Man Team: launch plan

Written 21 November 2026 for one developer with very little money. Benchmarks are attributed to their sources; thresholds marked "proposed" are my judgment, not anyone's published standard.

## What I could and could not verify

- Retention and session benchmarks below come from secondary write-ups of industry reports (GameAnalytics via GameDev Reports, Mistplay via Segwise, AppAgent). I did not read the original reports. They pool thousands of games and are not specific to football or to a 20-level game.
- I found no published benchmark for level-by-level completion. The funnel thresholds are proposed.
- Cost-per-install ranges come from one consultancy's 2026 guide and are for casual and puzzle games on Android in general.
- I could not read Play Store pages or query Play search, so nothing here depends on competitors' current listings.
- Subreddit and forum rules change; read each community's self-promotion rule on the day of posting.

## The plan in one paragraph

Put measurement into the build, run a closed test with real football people, release in three English-speaking, football-first, Android-heavy countries, and let the web version and the replay clip do the acquisition. Decide after about 300 to 500 installs whether the game holds people past the first session. If it does, add levels and go wider. If it does not, the fix is onboarding or content, not marketing.

## Before anything else: three things the build needs

1. **Measurement.** The current build collects nothing (the privacy page says so). Without events there is no day-1, no day-7 and no level funnel, and the soft launch cannot answer its own question. Add a minimal analytics layer that records: first open, level start, round fail (with reason: lost ball, offside, bump, clock), level complete (with retries, stars, time), replay watched, replay shared, session start and end. Update the privacy page and the Play Data safety form in the same release.
2. **A way to share the replay.** See "Using the replay" below. This is the only acquisition channel that costs nothing and is specific to this game.
3. **A decision on packaging.** The game is a plain web app. How it is wrapped for Play decides which analytics, advert and billing options are available (see monetisation-options.md). Settle it before the closed test so testers are on the real thing.

## Phase 1: closed test (two weeks)

**Purpose:** find the places where a new player does not understand the rewind, and the levels where people stop.

- **Is the 14-day rule in force for this account?** Google requires personal developer accounts created after 13 November 2023 to run a closed test with at least 12 testers opted in continuously for 14 days before applying for production access, and says review of that application usually takes seven days or less (Google Play Console Help, read 21 Nov 2026). Check the account's creation date. If the rule applies, the fortnight below is compulsory and the calendar cannot be compressed; if it does not, run the test anyway.
- **Recruit 20 to 25 testers so that 12 are still opted in on day 14.** Best sources, in order: people who already play five-a-side or watch football with the developer; a short post in one football-tactics community and one Android-games community asking for testers (not installs); existing players of the studio's earlier games, if there is any way to reach them.
- **Give each tester a job.** Play to the end or until stuck, then answer three questions: where did you first feel lost, which level did you give up on, would you show the replay to anyone.
- **Watch five people play in person or on a recorded call without helping.** The first ninety seconds of each session is the most valuable evidence in the whole plan.
- **Exit criteria (proposed):** at least 8 in 10 testers finish level 1 without being told what to do; at least half reach level 10; no crash or stuck state reported twice.

## Phase 2: soft launch

### Countries

**South Africa, Nigeria and Kenya first. Ireland added in week four if the first numbers hold.**

Reasoning:

- **Football is the most followed sport and English is a working language** in the three African markets, and Ireland follows English football closely (my judgment; I did not look for audience data). The listing, the copy voice and the level names need no translation, and the audience recognises a third-man run.
- **Android and Google Play are the default.** A report by SpielFabrique and Xsolla, covered by PocketGamer.biz in February 2026, describes Google Play as the main mobile distribution platform across Africa and mobile as roughly 60 per cent of a games market of about $2.29 billion in 2025.
- **South Africa is home.** The developer can test on local devices and networks, reach people in person, post in local football communities with a local voice, and answer reviews in the same time zone.
- **Retention reads transfer.** A June 2026 soft-launch guide from Game Growth Advisor argues that retention, session length, crash rate and onboarding completion are largely independent of market, so a cheaper market can validate them, while spending behaviour is not. This plan asks only the retention question at this stage.
- **They are not the place to test payments.** The same African industry report says about 90 per cent of people on the continent lack a credit card or app-store credit. Do not judge any purchase from these three markets.
- **Ireland is the small tier-one check.** English-speaking, football-literate, small enough that a weak launch does little harm. It is my choice rather than a sourced recommendation: the PocketGamer.biz preview of a January 2026 soft-launch panel reports one speaker favouring English-speaking countries for early feedback and another advising against Canada and Australia, and the consultancy guide prices Canada and Australia at $1.00 to $2.50 an install for casual Android games, which this budget cannot support.
- **Not the Philippines or Indonesia.** They are the usual cheap test markets for ad-funded games (the same panel preview recommends them for testing advert tolerance), but football is not the first sport there and the game's whole pitch assumes football literacy.

Release with Play Console's country targeting set to these countries only. Keep the web version available everywhere; it is the demo.

### Budget and what it can prove

The same consultancy guide says a readable day-1 figure (about 30 per cent, within three points, at 95 per cent confidence) needs roughly 900 installs per test, and prices a professional two-market soft launch in the tens of thousands of dollars. That is not this plan. With a spend in the region of the studio's earlier R1,000 campaign, at the guide's $0.20 to $0.60 range for low-cost markets, expect paid installs in the low hundreds at best, plus whatever arrives free.

What a few hundred installs can show (my arithmetic, normal approximation):

| Cohort size | Day-1 of 30% is known to within about | Day-7 of 5% is known to within about |
| --- | --- | --- |
| 150 | 7 points | 3.5 points |
| 300 | 5 points | 2.5 points |
| 500 | 4 points | 2 points |

So the soft launch can tell "broken" from "promising" and cannot tell 28 per cent from 32 per cent. Decide accordingly, and do not buy installs at all until the organic channels below have been tried for a week.

### Metrics that decide go or no-go

| Metric | Published reference points | Proposed reading for this game |
| --- | --- | --- |
| **Day-1 retention** | GameAnalytics' 2026 benchmarks, as summarised by GameDev Reports (June 2026; 16,262 mobile games): top quarter of games just above 30%, top tenth about 40%. Mistplay's puzzle figure, quoted by Segwise: 31.85%. AppAgent's working ranges for commercially marketed games: 25 to 30% average, 35 to 40% good. | **Go** at 35% or more. **Iterate** between 25 and 35%: fix onboarding and retest. **Stop and rethink** below 25%. |
| **Day-7 retention** | GameAnalytics via the same summary: median just under 4%, top quarter 6 to 7%, top tenth 11 to 12%. Mistplay puzzle figure via Segwise: 12.18%. AppAgent ranges: 10 to 15% average. | **Go** at 8% or more. **Iterate** between 4 and 8%. **No-go as it stands** below 4%. With about 20 levels, a low day-7 most likely means people finished, so read it beside the funnel. |
| **Level funnel** | None found. | Of people who start level 1: at least 85% complete it, at least 60% complete level 5, at least 30% complete the last level. Any single level that loses more than 15% of the people who start it gets redesigned or moved. Also track the share of failures by reason on each level: a level where most failures are "bump" or "offside" is teaching badly, not testing well. |
| **Session length** | GameAnalytics via the same summary: top quarter of mobile games average about 5.2 minutes a session, top tenth about 8 minutes; no median given. | Median first session of 5 minutes or more is healthy for levels this short. Under 3 minutes means people leave during the tutorial moves. |
| **Replay share rate** | None found. | Share of level completions followed by a share. No threshold; it is the leading indicator for free growth, so watch its direction after each change to the share flow. |
| **Rating and reviews** | None used. | Read every review. A pattern of "too short" is a content problem and good news; a pattern of "confusing" is an onboarding problem and bad news. |

A caution on the benchmarks: the three sources disagree widely (a day-7 median near 4% in one, an "average" of 10 to 15% in another) because they sample different games. GameAnalytics covers everything with at least 1,000 monthly players, most of it unmarketed; Mistplay's figures come from its own rewards audience; AppAgent's ranges describe funded games. A solo title should expect to sit nearer the first set.

**Decision rule.** Go wider if day-1 and the funnel pass and day-7 is in the iterate band or better. A strong day-1 with a weak day-7 and a healthy funnel means "make more levels", which is a go. A weak day-1 means stop marketing and fix the first two minutes.

## Community and content tactics that fit this game

### Using the replay

The finished replay is a ten-second, self-explanatory picture of something clever the player did. Almost no small game has that. Use it in four ways.

1. **A share button on the result card.** It should produce a short portrait video (or, failing that, a still "move card") of the replay with every run drawn, the move name, time and retries in programme styling, and a small web address in the corner. Hand it to the phone's share sheet; do not build a social feature. No real club or player names appear, so nothing in the clip needs anyone's permission.
2. **A replay link, if the engine allows it.** The simulation is deterministic and each player's part is already stored as a recording, so in principle a move can be packed into a web link that opens the browser version, plays that person's exact move, and then offers "your turn" on the same level. This turns every share into a playable challenge with no install. It needs engineering confirmation (link length is the likely limit); if it is more than a few days' work, ship the video first.
3. **"Fewest retries" and "fastest move" as the brag.** The result card already has both numbers. The share text should lead with them: "The cut-back, first go, 7.4 seconds." That gives the next person a target.
4. **The developer's own clips.** One level is one clip. See below.

### Content the developer can make alone

- **One move a day for the first three weeks.** A 10 to 15 second portrait clip: pass into nothing, rewind, run onto it, full replay. Caption is the tactical term and nothing else ("The third-man run, in nine seconds"). Post the same file to YouTube Shorts, TikTok and Instagram Reels. Twenty levels is twenty clips, already made once the capture script exists.
- **Fail clips.** Being flagged offside against your own pass is the game's best joke. One of these for every three goal clips.
- **Describe patterns, not matches.** Football people will recognise the shapes. Do not title clips after real goals, clubs or players, and do not use their footage; it invites takedowns and contradicts the "no licences" position.
- **A "how the rewind works" devlog post**, written once, with three GIFs. This is what gets linked when someone asks "how is this different".

### Where to take it

- **The web version is the pitch.** Every post links to the playable browser build, with a Play badge on its home screen for the launch countries. People will try a link who would never install on a stranger's word.
- **Football-tactics and coaching communities** (subreddits, Facebook groups, tactics accounts): show a clip and ask a football question ("is this a third-man run or just a one-two with a decoy?"). Lead with the football, not the app.
- **Small-game communities** that welcome developers and browser games: r/WebGames, r/AndroidGaming's developer threads, r/playmygame, r/indiegames, the TouchArcade and itch.io communities. One post each, spaced out, each with a different clip.
- **South African football and tech communities**, where "made in Johannesburg by one person" is itself the story. A short note to local tech and gaming writers costs nothing.
- **Two or three specific writers**, not a press list: people who have written about Does Not Commute-style design or about small football games (Pocket Gamer keeps a running list of Android football games, updated September 2026). Send the web link, one GIF and three sentences.
- **Reply to every Play review** in the first month, in the game's voice.

## Four-week calendar

Week 1 starts when the closed-test build is ready. If the 14-day rule applies to the account, production release cannot happen before the end of week 3 at the earliest; the calendar assumes it does apply.

| Week | Build and store | Testing and measurement | Content and community |
| --- | --- | --- | --- |
| **1** | Closed-test build live with analytics events and updated privacy page. Store listing drafted (title, descriptions, eight screenshots, icon, feature graphic). In-store name searches and trademark register checks done; name fixed. | Recruit 20 to 25 testers; confirm at least 12 opted in by day 2. Watch three people play unaided. | Extend the capture script to export clips. Record all level clips. Write the devlog post. Post nothing public yet except the call for testers. |
| **2** | Fix the two worst onboarding problems found. Build the share button (video or still card). Fix the emoji lock and text stars so the build matches the art direction. Record the promo video. | Watch two more people play. Read the funnel from tester events; redesign or reorder any level losing more than 15%. Check exit criteria on day 14. | Start the daily clip on Shorts, TikTok and Reels pointing at the web version. Post the devlog. |
| **3** | Apply for production access on day 15 (allow up to seven days). On approval, release to South Africa, Nigeria and Kenya only. Upload the promo video. | Confirm events arrive from production. Start the cohort table: installs per day, day-1, funnel. | Launch-day posts in South African communities and one football-tactics community. Share button live, so ask testers to post their best move. Daily clip continues. |
| **4** | Patch from first reviews. If week-3 day-1 is in the iterate band or better, add Ireland. Begin the next level pack regardless. | First day-7 reads arrive at the end of the week. Fill in the go or no-go table with cohort sizes and error ranges written beside each number. | One post in each small-game community, spaced two days apart. Email the two or three writers. Only now consider a small paid test, and only if organic installs are too few to read. |

End of week 4: write the decision down in one paragraph, with the numbers, before changing anything.

## What not to spend time on

- **Paid installs at any scale** before day-1 and the funnel pass. A few hundred rand will not buy a statistically clean answer, and a leaky first session wastes all of it.
- **An iOS version** before the Android numbers justify it.
- **Translation.** English in four countries is enough to answer the question. Portuguese and Spanish come after a go decision.
- **Pre-registration, a Discord server, a newsletter or a press kit site.** Each needs an audience the game does not have yet.
- **Paying influencers or review sites, and any service that sells testers, installs or ratings.** The first is poor value at this size; the second risks the developer account.
- **A cinematic trailer.** The 25-second capture in store-assets-plan.md is the trailer.
- **Store-optimisation tools and keyword tuning** before there are four weeks of real search-term data in Play Console.
- **Licences, real names or "inspired by" famous goals.** Not affordable and not needed.
- **Multiplayer, leaderboards with accounts, or a level editor.** All tempting, all months of work, none of them answers whether people come back on day 2.
- **Monetisation tuning during the soft launch.** Get the retention answer first; see monetisation-options.md.
- **Registering a trademark** before a go decision. Do the free register searches now; file later.

## Sources

- App testing requirements for new personal developer accounts, Google Play Console Help, read 21 Nov 2026: https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB
- GameAnalytics: Mobile and PC Game Benchmarks in 2026, GameDev Reports, 4 Jun 2026: https://gamedevreports.substack.com/p/gameanalytics-mobile-and-pc-game
- Mobile Game User Retention 2026: Benchmarks by Genre, Segwise (quoting Mistplay), updated Jul 2026: https://segwise.ai/blog/mobile-gaming-app-user-retention-strategies.md
- Mobile Game Retention Benchmarks: Know Your Numbers, AppAgent, 16 Jun 2026 (modified 9 Nov 2026): https://appagent.com/?p=61637
- Soft launch market selection 2026 guide, Game Growth Advisor, 25 Jun 2026 (updated 13 Nov 2026): https://gamegrowthadvisor.com/blog/2026-06-25-soft-launch-market-selection-2026-guide/
- Soft launch is changing in 2026: How and where should you release your game?, PocketGamer.biz, 6 Jan 2026: https://www.pocketgamer.biz/soft-launch-is-changing-in-2026-how-and-where-should-you-release-your-game
- Mobile leads as Africa's games industry generated $2.29bn in 2025, PocketGamer.biz, 10 Feb 2026: https://www.pocketgamer.biz/mobile-leads-as-africas-games-industry-generated-229bn-in-2025
- Top 25 best football games for Android phones and tablets, Pocket Gamer, updated 17 Sep 2026: https://www.pocketgamer.com/articles/073592/r/
- Add preview assets to showcase your app, Google Play Console Help, read 21 Nov 2026: https://support.google.com/googleplay/android-developer/answer/9866151?hl=en-GB
- README.md, privacy.html, one-man-team/js/game.js and one-man-team/js/sim.js in this repository (deterministic simulation, stored recordings, no analytics at present)

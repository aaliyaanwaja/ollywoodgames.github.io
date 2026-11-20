# One-Man Team: monetisation options

Written 21 November 2026. Monetisation is undecided; this sets out the workable models and one recommendation. The owner decides.

## What I could and could not verify

- Competitor prices are from App Store pages read on 21 Nov 2026 (storefront named each time). Play Store pages could not be read from this environment, and Play prices differ by country.
- I found no public revenue figure for any comparable game.
- The payer-rate and advert-price figures are industry-wide averages from secondary reports. None is specific to football, to puzzle-action games or to a game this small.
- Statements about what each Android packaging route supports are from my own knowledge of the tools and were not re-checked against current documentation today. Confirm them before choosing a route.
- Google's service fee is changing in 2026 and the help page is not simple; see "Google's cut" below and read the page itself.

## Facts that frame the choice

- **The game is short.** About 20 levels of 5 to 15 seconds. Even with retries, a player may finish in one or two sittings. Any model that earns per session or per day has little to work with until there is more content.
- **Few players pay.** Unity's 2024 mobile report, as covered by PocketGamer.biz, put the share of mobile players who make any in-app purchase at 1.83 per cent across games generally.
- **Adverts pay by country.** A 2026 round-up by Playio cites United States rewarded-video rates on Android between roughly $13 and $30 per thousand views depending on the source and period, and Appodeal regional averages for late 2024 of about $5 in Europe and about $2 in Latin America and the Middle East. It gives no figure for South Africa, Nigeria or Kenya; assume the low end.
- **Payment access is limited in the soft-launch markets.** An industry report covered by PocketGamer.biz in February 2026 says about 90 per cent of people in Africa lack a credit card or app-store credit. Purchases will under-perform there for reasons unrelated to the game.
- **The audience has a known grievance.** Pocket Gamer's 2015 review of Score! Hero criticised its energy and retry economy for bending the design; that game's UK App Store page still lists paid "unlimited energy". A football game that visibly does not do this has something to say.
- **Rough scale, so expectations are honest.** At 1,000 installs and the 1.83 per cent payer rate, a $2.99 unlock yields about 18 sales, or roughly $40 to $45 after the store's share. One rewarded advert per player at a $2 to $5 rate yields $2 to $5 per 1,000 players. Neither matters at soft-launch volume. The decision is about reviews, retention and not building the wrong thing, not about revenue yet.

## What the comparables do

| Game | Model | Detail and source |
| --- | --- | --- |
| Does Not Commute | Free, no adverts, one optional one-off purchase | The whole game is playable without paying; the purchase adds checkpoints. $2.99 on the US App Store (read 21 Nov 2026); £1.49 / $1.99 at launch according to Pocket Gamer, April 2015. About 11.9 million Android installs according to AppGoblin. |
| Retro Goal | Free start, one-off "Unlimited Version", plus optional extras | Unlimited Version $1.99 on the US App Store, alongside player and currency purchases. Pocket Gamer's September 2026 list describes the first 10 matches as free; the App Store version notes say career mode has since been made free, with the unlock adding extra modes and settings. |
| Score! Hero | Free with adverts, currency and energy | UK App Store lists currency bundles from £0.99 to £6.99 and 24-hour unlimited energy at £2.99, and notes that it contains advertising. Trusted Reviews describes rewinds paid for with earned currency or by watching a video. |
| Football Playbook | Free with adverts, consumables and a subscription | US App Store lists Life $1.99, Hint $1.99 and a weekly subscription at $3.99. |

Two patterns: the small, well-regarded games sell one thing once; the large and the imitative sell retries.

## Option A: rewarded adverts only, for a hint or a skip

The player chooses to watch an advert to see a hint for the current round (for example the ghost of a working run) or to skip a move they are stuck on. No banners, no adverts between levels.

- **Retention:** neutral to slightly positive. A skip keeps a stuck player in the game; nothing interrupts play. The risk is design drift, where levels get harder to sell hints. Guard against it with the funnel rule in launch-plan.md.
- **Reviews:** low risk. Optional adverts rarely draw complaints; forced ones do.
- **Effort:** medium. The studio has shipped rewarded adverts before. Needs a hint system and a skip rule that do not exist yet.
- **Revenue:** small. With about 20 levels there are few stuck moments per player, and advert rates in the launch markets are low.
- **Must be built:** a native-capable wrapper (see packaging note); advert SDK with consent handling for the UK and EU; hint content for every round of every level (the solver bots in the tools folder already know a working line for each level, which is a head start); skip logic and what a skipped level awards (suggest: unlocks the next move, no stars); "no advert available" and offline fallbacks; updated privacy page, Data safety form and "Contains ads" declaration; advert content filter set to match the rating.

## Option B: free game with a one-off premium unlock

Two ways to cut it:

- **B1, content gate.** The first eight to ten moves are free; one purchase unlocks the rest and all future moves.
- **B2, convenience unlock (the Does Not Commute cut).** Every move is free. The purchase buys comfort: unlimited hints and skips, and perhaps extras such as replay export without a watermark or alternative kits.

- **Retention:** B1 puts a wall in front of most players at the exact point the soft launch needs to measure whether they continue, and in markets where many cannot pay. B2 does not.
- **Reviews:** B1 draws "it's a demo" reviews unless the listing is very clear. B2 is the best-reviewed pattern among the comparables.
- **Effort:** medium. One product, restore-purchase handling, an unlock screen.
- **Revenue:** modest and proportional to installs times a low payer rate; higher per payer than adverts. B2 with nothing else has a weak reason to buy until hints and skips exist, which is why it pairs naturally with Option A.
- **Must be built:** Play Billing integration through whichever wrapper is chosen; a single non-consumable product with local prices per country; purchase restore on reinstall; the unlock screen in programme styling; a "supporter" state in the interface; server-side receipt checking is not necessary at this scale.

## Option C: paid level packs

The launch career stays free. Later packs of 15 to 20 moves, each with a theme (a cup run, a relegation fight, set pieces), are sold at a small price each, or all together.

- **Retention:** positive in principle, because it funds the thing the game most lacks, which is content. It only helps players who finished and wanted more.
- **Reviews:** low risk if the free game feels complete; higher if the first pack appears to be content held back.
- **Effort:** high and continuing. The cost is level design, which is the scarce resource. The repository's level guide and solver bots lower it but do not remove it.
- **Revenue:** the only option here whose income grows with the developer's output rather than with advert rates. Still bounded by the payer rate.
- **Must be built:** everything in Option B, plus a pack catalogue, per-pack entitlement, pack art, and at least one finished pack. Not possible at launch with about 20 levels in total.

## Option D: cosmetics (kits, pitches, programme covers)

Sell alternative kit colours, pitch cloths or programme styles. Level data already supports kit colours.

- **Retention:** neutral.
- **Reviews:** safe.
- **Effort:** low to medium per item, but each kit must stay legible against felt and against the opposition, which the art direction makes a hard rule.
- **Revenue:** weakest. Cosmetics sell on long attachment and being seen by others; a short single-player game offers neither. Kits must also avoid resembling real clubs, which removes the usual reason people buy them.
- **Must be built:** Play Billing, a small shop, a kit picker, legibility checks for each combination.
- Better used as a free reward for stars, or as part of the B2 unlock, than sold separately.

## Considered and not recommended

- **Energy or lives with timers.** It is the model the audience already resents in the nearest big competitor, it would be the first thing reviews mention, and it contradicts the game's best feature, the instant retry.
- **Adverts between levels and banners.** Levels last seconds; an advert every few levels would outweigh the play time, and a banner fights the art direction.
- **A paid download.** Removes the free trial that the whole acquisition plan depends on, and, in my judgment, paid titles are a hard sell on Play in the launch markets.
- **Subscriptions.** There is nothing recurring to subscribe to.

## Trade-offs at a glance

| | Retention | Review risk | Build effort | Fits 20 levels | Works in launch markets |
| --- | --- | --- | --- | --- | --- |
| A. Rewarded hint or skip | Neutral to positive | Low | Medium | Yes | Yes, at low rates |
| B1. Content gate | Negative early | Medium | Medium | Poorly | Poorly |
| B2. Convenience unlock | Neutral | Low | Medium | Yes, with A | Poorly (payments) |
| C. Level packs | Positive later | Low to medium | High, ongoing | No | Poorly (payments) |
| D. Cosmetics | Neutral | Low | Low to medium | Yes | Poorly (payments) |

## Packaging note (affects every option)

The game is a web app with no build step. Two common ways onto Play:

- **A Trusted Web Activity** (the site running full-screen through Chrome). Least work and updates like a website. As far as I know it supports Play Billing through the browser's Digital Goods interface but not the mobile advert SDKs, so it suits Option B and not Option A.
- **A WebView wrapper such as Capacitor.** A real Android project with plugins for adverts, billing and analytics. More work and a proper build pipeline, but every option here is open.

Verify both statements against current documentation before choosing. If Option A is in the plan at all, the choice is effectively made.

## Google's cut

According to Google Play Console Help (read 21 Nov 2026), new fee terms took effect on 30 June 2026 in the EEA, the UK and the US and on 30 September 2026 in Australia and Japan, with a service fee plus a separate 5 per cent billing fee when Google Play Billing is used, and rates that depend on the programme the developer is in and whether the install is new. In all other markets the page still describes 15 per cent on the first $1 million of annual earnings. For planning, assume Google keeps between 15 and 25 per cent of any purchase and read the page for the rate that applies to this account. Advert income is paid by the advert network and is not subject to this fee.

## Recommendation

**Launch the soft launch with no monetisation at all, then add Option A and Option B2 together for the wider release: optional rewarded adverts for a hint or a skip, and one purchase of about $2.99 (priced locally) that gives unlimited hints and skips with no adverts, plus future kits. Plan Option C for when a second career of moves exists.**

Reasons:

1. The soft launch has one question, whether people come back, and the game currently collects no data and shows no adverts. Keeping it that way for four weeks gives the cleanest retention read, the simplest privacy position and nothing for early reviews to complain about. The revenue forgone at a few hundred installs is a few dollars.
2. A plus B2 is the Does Not Commute shape with a free route added for people who cannot or will not pay, which matters in the launch markets. It never blocks play, so it does not turn the listing's promise into a half-truth.
3. Both halves need the same hint and skip system, so the build work is shared, and that system also improves the funnel on its own.
4. The price sits where the two well-reviewed comparables sit ($1.99 to $2.99).
5. Level packs are the only route to meaningful income, but they need a go decision and more levels first.

What would change this recommendation:

- If the owner wants the simplest possible build and is content to earn nothing until the game proves itself: ship B2 alone through a Trusted Web Activity, with hints free and the purchase framed as support.
- If day-7 comes back strong and players are asking for more: bring Option C forward and spend the time on levels, not advert integration.
- If the soft launch is a no-go: build none of it.

The owner should also decide one thing explicitly whatever the model: whether hints exist at all. They help the funnel and they are what both A and B2 sell, but they change the feel of a game whose pleasure is working the move out.

## Sources

- Does not Commute, App Store, read 21 Nov 2026: https://apps.apple.com/app/id971756507
- Does not Commute, AppGoblin, read 21 Nov 2026: https://appgoblin.info/apps/com.mediocre.commute
- Does Not Commute brings traffic chaos and sick puns to Android, Pocket Gamer, 24 Apr 2015: https://www.pocketgamer.com/does-not-commute/does-not-commute-brings-traffic-chaos-and-sick-puns-to-android
- Retro Goal, App Store, read 21 Nov 2026: https://apps.apple.com/app/id1535765855
- Top 25 best football games for Android phones and tablets, Pocket Gamer, updated 17 Sep 2026: https://www.pocketgamer.com/articles/073592/r/
- Score! Hero, App Store (GB), read 21 Nov 2026: https://apps.apple.com/gb/app/score-hero/id847492141
- Score! Hero review, Pocket Gamer, 11 Aug 2015: https://www.pocketgamer.com/score-hero/review/
- Score! Hero review, Trusted Reviews (undated on page): https://www.trustedreviews.com/score-hero-review
- Football Playbook: Puzzle Game, App Store (US), read 21 Nov 2026: https://apps.apple.com/us/app/-/id6758202779
- Less than 2% of mobile gamers make an in-app purchase, PocketGamer.biz, 17 Sep 2024: https://www.pocketgamer.biz/less-than-2-of-mobile-gamers-make-an-in-app-purchase
- Mobile game eCPM benchmarks 2026, Playio blog, read 21 Nov 2026: https://blog.playio.co/mobile-game-ecpm-benchmarks-2026
- Mobile leads as Africa's games industry generated $2.29bn in 2025, PocketGamer.biz, 10 Feb 2026: https://www.pocketgamer.biz/mobile-leads-as-africas-games-industry-generated-229bn-in-2025
- Service fees, Google Play Console Help, read 21 Nov 2026: https://support.google.com/googleplay/android-developer/answer/112622?hl=en-GB
- Content ratings requirements, Google Play Console Help, read 21 Nov 2026: https://support.google.com/googleplay/android-developer/answer/9859655?hl=en
- README.md, privacy.html, tools/ and one-man-team/js/levels in this repository

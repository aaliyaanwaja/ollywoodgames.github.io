# One-Man Team: story bible

The fixture list lives in `one-man-team/js/levels/story.js`, keyed by level position (1 to 20), never by the move's name.
A level's move can change without touching the story. This page is what keeps new fixtures consistent with the old ones.

## Our club
- **Kettlewick Printworks.** Founded by compositors at the town's printing works, which closed years ago. The club outlived it.
  A retired typesetter still prints the programme, which is why the whole game looks like one.
- **Kettlewick** is a small, damp, invented market town somewhere in the middle of England. One High Street, two football clubs.
- **Character:** a Sunday side that turns up. Short of numbers, never short of opinions, kind to referees. The story never
  names a player, a manager or a year: the player is every member of the team, so nobody else gets a name.
- **Kit:** tomato shirts `#E4572E`, paper trim `#F2EAD8` (red ink on paper stock). The same in every fixture, home and away.
- **Ground:** the Rec. A sloping pitch, a tea urn, darned nets.

## The arc
| Season | Levels | Competition | What is at stake |
| --- | --- | --- | --- |
| 1. Bottom of the League | 1-4 | Division Four, matchdays 19-22 | No wins since August and four games left. The bottom club must apply for re-election. A first win, a second, a late point, then bottom against second bottom on the last Sunday. |
| 2. The Promotion Race | 5-12 | Division Four, the following season | The same division with the table the right way up. Two go up. It includes the first derby and ends away to the champions needing a goal in stoppage time. |
| 3. The County Cup | 13-20 | County Cup, as a Division Three club | Round by round: first round, second, a third-round tie rescued late, the replay in the rain, fourth round, quarter-final, the derby again as a semi-final in extra time, and a final won or lost in the 94th minute. |

Each fixture is the one goal that changes the result. `score` is the score before that goal, as "us-them".

## Opponents
| Level | Opponent | One line | Kit (deck, shirt) |
| --- | --- | --- | --- |
| 1 | Pellow's Bakery | Works side. Play in flour colours, bring their own buns. | brown, chalk |
| 2 | Tolbury Dynamo | Named in a fit of ambition in the seventies. Mid-table ever since. | ink, sky |
| 3 | Old Corvians | Old boys of a grammar school that is now flats. | black, pink |
| 4 | Netherwick Albion | The other club at the bottom. Decent people in the same hole. | royal, chalk |
| 5 | Marl Pit Rovers | Village side with a pitch that drains only in theory. | plum, sky |
| 6 | Cobble Street Social | A social club's team. Organised, because the steward is. | ink, lilac |
| 7, 19 | Kettlewick Victoria | The rival from the other end of the High Street. Older, smarter kit, bigger shed. | purple, silver |
| 8 | Crannock Dairies | Works side, early risers, fit for it. | silver, ink |
| 9 | Staunchley Rangers | Never score many. Never concede many either. | royal, pink |
| 10 | Lower Hexby | A hamlet that fields eleven every week by some arithmetic of its own. | brown, sky |
| 11 | Wrenfield Colts | Young, quick, third in the table and after second. | black, lilac |
| 12 | Scarrow Vale | The champions. Won it with a week to spare. | claret, sky |
| 13 | Monk's Hollin | Village side, same division as us. A fair first-round draw. | lilac, ink |
| 14 | Tindle Moor Welfare | Miners' welfare club. The pit has gone; the tackling has not. | brown, chalk |
| 15, 16 | Eastmere Harriers | Two divisions up. Navy at home; the pink change kit for the replay at ours. | ink, silver / pink, ink |
| 17 | Quillham Athletic | A long coach trip. Tidy side, tidy ground. | plum, chalk |
| 18 | Brackenfold United | Had not conceded in the competition before the quarter-final. | black, sky |
| 20 | Thistlewick Town | The county's big club. Cup holders, and expected to be again. | sky, ink |

## Naming rules
- Everything is invented: clubs, towns, competitions. No real club, league, cup, sponsor, player or manager, and nothing
  that is a real one with a letter changed. Web-search every new name before it goes in. If a club of that name exists, pick another.
- Build names from an invented place plus a plain suffix (Rovers, Athletic, Welfare, Colts, Town), or a works or social club.
  No pub teams: every real pub name already has a real Sunday side.
- Competitions stay generic: "Division Four", "County Cup". `match` is a matchday or a round: "Matchday 7", "Quarter-final", "Replay".
- `opp` is 22 characters at most and in practice about 20, because the home ticket also has to fit the minute. `comp` and `match`
  together must fit one ticket line: keep `match` to about 14 characters.

## Tone rules for `line`
- One sentence or two short ones, 60 characters at most. It is a line from the programme notes, written before kick-off or at the urn.
- Dry, British, understated. State a fact and stop. No exclamation marks, no stock phrases, no commentary voice.
- Never mock anyone: not the opposition, not the referee, not our own side. The joke is always the circumstances.
- It must say why this goal matters, or give the day its weather. Preferably both.

## Kit rules
- Ours never changes. Theirs is `[primary, secondary]`: the primary is the base deck and the shirt stripes, the secondary is the shirt and the rim.
- Opponent colours come from the printed palette in `story.js`: ink, black, brown, plum, purple, claret, royal as dark primaries;
  sky, lilac, pink, silver, chalk as light ones. No reds or oranges (ours), no greens (the felt).
- Mustard is for goalkeepers only. On the pitch it is the colour of the live player's ring.
- `gk` must differ from both outfield kits: mustard by default, sky or lilac when variety helps.
- No two consecutive opponents share a primary or a shirt colour. A club that returns keeps its kit, unless the story says it changed.

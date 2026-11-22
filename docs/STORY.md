# One-Man Team: story bible

The fixture list lives in `one-man-team/js/levels/story.js`, keyed by level position (1 to 60), never by the move's name.
It applies safely when fewer than 60 levels exist, and loading it twice changes nothing.
A level's move can change without touching the story. This page is what keeps new fixtures consistent with the old ones.

## Our club
- **Kettlewick Printworks.** Founded by compositors at the town's printing works, which closed years ago. The club outlived it.
  A retired typesetter still prints the programme, which is why the whole game looks like one.
- **Kettlewick** is a small, damp, invented market town somewhere in the middle of England. One High Street, two football clubs.
- **Character:** a Sunday side that turns up. Short of numbers, never short of opinions, kind to referees. The story never
  names a player, a manager or a year: the player is every member of the team, so nobody else gets a name.
- **Kit:** tomato shirts `#E4572E`, paper trim `#F2EAD8` (red ink on paper stock). The same in every fixture, home and away.
- **Ground:** the Rec. A sloping pitch, a tea urn, darned nets. Council land: in season 6 the council gives notice that it wants
  the Rec for houses, and at the start of season 7 it votes six to five to leave it alone. Record gate: 1,104 (fixture 57).
- **The league** has four divisions. Division Four has 12 clubs (22 matchdays), Division Three has 14 (26 matchdays),
  Two and One have 16 (30 matchdays). The Division One champions enter the national Amateur Cup.
- **Supporting cast, never named:** the secretary (checks the table twice), the groundsman, the retired typesetter, the coach driver.

## The arc
| Season | Levels | Competition | What is at stake |
| --- | --- | --- | --- |
| 1. Bottom of the League | 1-4 | Division Four, matchdays 19-22 | No wins since August and four games left. The bottom club must apply for re-election. A first win, a second, a late point, then bottom against second bottom on the last Sunday. |
| 2. The Promotion Race | 5-12 | Division Four, the following season | The same division with the table the right way up. Two go up. It includes the first derby and ends away to the champions needing a goal in stoppage time. |
| 3. The County Cup | 13-20 | County Cup, as a Division Three club | Round by round: first round, second, a third-round tie rescued late, the replay in the rain, fourth round, quarter-final, the derby again as a semi-final in extra time, and a final won or lost in the 94th minute. |
| 4. Chasing Scarrow Vale | 21-28 | Division Three, matchdays 1-26 | One title. Scarrow Vale, the old Division Four champions, lead from August. Four points behind at halfway, level after matchday 24, and on the last day away to them a draw wins the league on goal difference. At 0-1 it is not a draw. |
| 5. The Step Up | 29-36 | Division Two, matchdays 1-29 | The first year a level higher. Grounds with stands, sides that keep the ball, and three go down. A first point, a first win, no win from October to the new year, a meeting of fourth and fifth bottom, and safety with a Sunday to spare. |
| 6. Notice to Quit | 37-44 | Division Two, matchdays 1-30 | The council wants the Rec for houses. A petition on the tea hut, a surveyor on the pitch, a hearing in May. Meanwhile the side is top at Christmas, loses the lead to Marrowby Railway, and meets them on the last day: one goes up, and the council votes on the Monday. |
| 7. Top of the League | 45-52 | Division One, matchdays 1-29 | The Rec stays, by six votes to five. Season one the other way up: top since New Year, so every visitor defends. Thistlewick Town, the old cup final opponents, are the other half of the race. It is settled at their ground, first at second, a point apart, with a game to spare. |
| 8. The Amateur Cup | 53-60 | Amateur Cup, national | Eight rounds from 256 clubs, no replays: a home draw, a five-hour coach trip, a fen, extra time against six-times winners, a record gate at the Rec, a quarter-final, a semi-final on a borrowed league ground, and the final at the national ground, 3-3 in the 119th minute. Fixture 60 is the end of the career. |

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
| 20, 48, 52 | Thistlewick Town | The county's big club. Cup holders in season 3, and the other side of the Division One title race in season 7. | sky, ink |
| 21 | Greaveley Glassworks | Works side. The first visitors to see "County Cup holders" on the gate. | claret, chalk |
| 23 | Nabthorpe Rovers | Awkward, away, and ahead until the 86th minute. | royal, silver |
| 25 | Loomgate Mechanics | A mechanics' institute side. Came to the Rec in a frost. | petrol, pink |
| 27 | Oxbeck St Jude's | Church side. Kick off after the service. | chalk, purple |
| 29, 40 | Cudderston Borough | Our first Division Two opponents. Their ground has a stand. | ink, pink |
| 31 | Pinderfold Athletic | Keep the ball all afternoon. | silver, royal |
| 33, 44 | Marrowby Railway | Railway works side. Beat us in the bad winter of season 5; the title rival on the last day of season 6. | claret, silver |
| 34 | Wetherlow Wanderers | In the same trouble as us in season 5. | sky, purple |
| 35 | Stoopley End | Send everyone forward, always. | brown, lilac |
| 36 | Quernside United | The side we beat to stay up. | slate, chalk |
| 37 | Sallowby Institute | Visitors on the day the notice went up on the gate. | royal, lilac |
| 38 | Rudlock Brickworks | Works side. Signed the petition to a man. | brown, pink |
| 41 | Uffwell Old Boys | Old boys' side. The surveyor watched the second half. | black, chalk |
| 42 | Aldergrave Welfare | Welfare club. Led until stoppage time. | plum, lilac |
| 45 | Mossgrave Casuals | Our first Division One opponents, the week the Rec was saved. | royal, sky |
| 47 | Eldergate Amateurs | Scored early and defended the rest. | plum, pink |
| 49 | Yarlow Bridge | Came for a goalless draw and very nearly took one home. | brown, silver |
| 50 | Wimberfold Olympic | Two visits to our half, two goals. | chalk, royal |
| 51 | Varnley Park | The last side to sit deep at the Rec before the decider. | purple, lilac |
| 53 | Coldrake Welfare | A colliery welfare side from the north. Our first national tie. | black, silver |
| 54 | Saltern Quay Dockers | Dock workers' side, five hours away by coach. | petrol, chalk |
| 55 | Sedgeholme Fen | Fen village. Flat pitch, steady wind. | plum, silver |
| 56 | Old Athelstonians | Old boys' club. Six times winners, none of them lately. | pink, black |
| 57 | Polvessa Mariners | A harbour side from the far south-west. Drew the record gate at the Rec. | ink, chalk |
| 58 | Limeburn Gasworks | Works side from a big city. | purple, sky |
| 59 | Stannerby Steelworks | Works side. The semi-final, on a borrowed league ground. | claret, pink |
| 60 | Winterlea Amateurs | The best-known amateur club in the country. Plain white shirts. The final. | chalk, ink |

Returning clubs keep their kit and their character: Monk's Hollin (22), Tindle Moor Welfare (24), Wrenfield Colts (26, promoted a year
after us), Scarrow Vale (28), Quillham Athletic (30), Brackenfold United (32, 43, still conceding very little), Kettlewick Victoria (39,
who signed the petition and then picked a strong side) and Eastmere Harriers (46, navy, now as equals).

## Naming rules
- Everything is invented: clubs, towns, competitions. No real club, league, cup, sponsor, player or manager, and nothing
  that is a real one with a letter changed. Web-search every new name before it goes in. If a club of that name exists, pick another.
- Build names from an invented place plus a plain suffix (Rovers, Athletic, Welfare, Colts, Town), or a works or social club.
  No pub teams: every real pub name already has a real Sunday side.
- Competitions stay generic: "Division Four" to "Division One", "County Cup", "Amateur Cup". The final is at "the national ground",
  which has no other name. `match` is a matchday or a round: "Matchday 7", "Quarter-final", "Replay".
- `opp` is 22 characters at most and in practice about 20, because the home ticket also has to fit the minute. `comp` and `match`
  together must fit one ticket line: keep `match` to about 14 characters. Season names are 20 characters at most.
- Names checked and dropped for being too close to something real: Hobwell (Holwell), Thackle End (Thackley), Hattersedge
  (Hathersage), Vauxley (Vauxhall), Hartlemere (Hartismere), Sellinghurst (Selhurst), Fenny Drove (Parson Drove), Penhallick (a real hamlet).

## Tone rules for `line`
- One sentence or two short ones, 60 characters at most. It is a line from the programme notes, written before kick-off or at the urn.
- Dry, British, understated. State a fact and stop. No exclamation marks, no stock phrases, no commentary voice.
- Never mock anyone: not the opposition, not the referee, not our own side. The joke is always the circumstances.
- It must say why this goal matters, or give the day its weather. Preferably both.
- The interface does not print `line` yet (the brief shows competition, match, opponent, minute and score). It is written and
  length-checked so that it can be switched on without an edit.

## Scoreline rules
- Every goal is an equaliser or a winner: `score` is level, or we are one behind. Matchdays rise within a season.
- A cup equaliser needs a replay as the next fixture (15 and 16). The Amateur Cup has no replays, so every goal in it is a winner;
  ties level after ninety minutes go to extra time (56 and 60).

## Kit rules
- Ours never changes. Theirs is `[primary, secondary]`: the primary is the base deck and the shirt stripes, the secondary is the shirt and the rim.
- Opponent colours come from the printed palette in `story.js`: ink, black, brown, plum, purple, claret, royal, slate, petrol as
  dark colours; sky, lilac, pink, silver, chalk as light ones. No reds or oranges (ours), no greens (the felt).
- A kit is one dark and one light colour, either way round. Slate and petrol (added for seasons 4-8) are the two closest in tone to
  the felt: pair them with pink or chalk only. Petrol with silver and slate with pink were tried on the pitch and read weakly.
- Claret is never a shirt colour: on a small figure it sits too near our tomato.
- New clubs get a pairing no other club has. The one shared kit is the oldest: Pellow's Bakery and Tindle Moor Welfare, brown and chalk.
- Mustard is for goalkeepers only. On the pitch it is the colour of the live player's ring.
- `gk` must differ from both outfield kits: mustard by default, sky or lilac when variety helps.
- No two consecutive opponents share a primary or a shirt colour, and neighbours should not be near relations either (plum next to
  claret, ink next to black). A club that returns keeps its kit, unless the story says it changed.

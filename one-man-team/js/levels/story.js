/* Story: the fixture list for all 60 moves, keyed by level position (not by the move's name).
   Loaded after the level packs and before sim.js. Sets `season`, `story` and `kit` on OMT_LEVELS[i] when that level exists,
   so packs may be shorter than 60 while work is in progress. See docs/STORY.md for the club, the arc and the naming rules.
   story.score is "us-them" BEFORE the goal; the interface adds one to our side when the move is scored. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);

  const US = 'Kettlewick Printworks';
  const HOME = ['#E4572E', '#F2EAD8'];   // tomato and paper, every fixture

  // The printed palette opponents are drawn from. Theirs: [deck and stripes, shirt and rim].
  // Mustard is kept for goalkeepers only: on the pitch it is the colour of the live player's ring.
  const INK = '#14213D', BLACK = '#26262B', BROWN = '#5E3A24', PLUM = '#6B2D5C', PURPLE = '#4B2E83', CLARET = '#6E1F3A',
    ROYAL = '#2F5DA8', SLATE = '#55616E', PETROL = '#1C6E8C',
    SKY = '#8EC5D6', LILAC = '#B9A5D6', PINK = '#EFA7B8', SILVER = '#B8BEC6', MUSTARD = '#F2B705', CHALK = '#FBF8F0';

  const S1 = 'Bottom of the League', S2 = 'The Promotion Race', S3 = 'The County Cup', S4 = 'Chasing Scarrow Vale',
    S5 = 'The Step Up', S6 = 'Notice to Quit', S7 = 'Top of the League', S8 = 'The Amateur Cup';
  // One short word per season, for the home screen (`seasonWord` on each level; root.OMT_SEASONS lists name and word).
  const WORD = { [S1]: 'Bottom', [S2]: 'Promotion', [S3]: 'Cup', [S4]: 'Title', [S5]: 'Survival', [S6]: 'Eviction', [S7]: 'Leaders', [S8]: 'Glory' };
  root.OMT_SEASONS = [S1, S2, S3, S4, S5, S6, S7, S8].map(name => ({ name, word: WORD[name] }));
  const D4 = 'Division Four', D3 = 'Division Three', D2 = 'Division Two', D1 = 'Division One', CUP = 'County Cup', NAT = 'Amateur Cup';

  //  season, comp, match, opponent, minute, score before the goal, programme line, their kit, their keeper
  const FIXTURES = [
    // Season 1: four games left, no wins, and the bottom club has to ask to be let back in.
    [S1, D4, 'Matchday 19', "Pellow's Bakery", 58, '0-0', 'No wins since August. The tea urn is on regardless.', [BROWN, CHALK], MUSTARD],
    [S1, D4, 'Matchday 20', 'Tolbury Dynamo', 66, '1-1', 'One win is a result. A second would be a run.', [INK, SKY], MUSTARD],
    [S1, D4, 'Matchday 21', 'Old Corvians', 84, '0-1', 'A point today takes it to the last Sunday.', [BLACK, PINK], MUSTARD],
    [S1, D4, 'Matchday 22', 'Netherwick Albion', 88, '1-1', 'Bottom plays second bottom. A draw suits only them.', [ROYAL, CHALK], MUSTARD],

    // Season 2: the same division a year on, and this time the table is the right way up.
    [S2, D4, 'Matchday 1', 'Marl Pit Rovers', 54, '0-0', 'New season, same nets. Marl Pit mark the 9 wherever he goes.', [PLUM, SKY], MUSTARD],
    [S2, D4, 'Matchday 4', 'Cobble Street Social', 77, '0-1', 'Unbeaten in three. Their centre-half steps out to anyone.', [INK, LILAC], MUSTARD],
    [S2, D4, 'Matchday 8', 'Kettlewick Victoria', 83, '1-2', 'The derby. Victoria hold a high line, as they always have.', [PURPLE, SILVER], SKY],
    [S2, D4, 'Matchday 11', 'Crannock Dairies', 69, '2-2', 'Halfway, and third. Their centre-half sticks to the 9.', [SILVER, INK], MUSTARD],
    [S2, D4, 'Matchday 15', 'Staunchley Rangers', 90, '0-0', 'Ninety minutes of nothing. The 9 drops off; they follow.', [ROYAL, PINK], LILAC],
    [S2, D4, 'Matchday 18', 'Lower Hexby', 79, '1-2', 'Lose here and second is a rumour. They press from the front.', [BROWN, SKY], MUSTARD],
    [S2, D4, 'Matchday 21', 'Wrenfield Colts', 87, '2-2', 'Second hosts third. Five touches, and it has to be all five.', [BLACK, LILAC], MUSTARD],
    [S2, D4, 'Matchday 22', 'Scarrow Vale', '90+2', '1-1', 'The champions need nothing. Their keeper sweeps long balls.', [CLARET, SKY], MUSTARD],

    // Season 3: a Division Three club in the County Cup, round by round, to a final nobody budgeted for.
    [S3, CUP, 'First round', "Monk's Hollin", 61, '0-0', 'First cup tie in eleven years. They mark the 9 close.', [LILAC, INK], MUSTARD],
    [S3, CUP, 'Second round', 'Tindle Moor Welfare', 72, '2-2', 'Four goals already. Their centre-half steps out to runners.', [BROWN, CHALK], SKY],
    [S3, CUP, 'Third round', 'Eastmere Harriers', 88, '1-2', 'Two divisions above us. Their centre-half follows the 9.', [INK, SILVER], SKY],
    [S3, CUP, 'Replay', 'Eastmere Harriers', 81, '0-0', 'Wednesday night, heavy rain. Their keeper sweeps it all.', [PINK, INK], MUSTARD],
    [S3, CUP, 'Fourth round', 'Quillham Athletic', 90, '1-1', 'Last sixteen. Quillham press from the front.', [PLUM, CHALK], MUSTARD],
    [S3, CUP, 'Quarter-final', 'Brackenfold United', 85, '0-0', 'Brackenfold have not conceded. Their centre-half steps out.', [BLACK, SKY], MUSTARD],
    [S3, CUP, 'Semi-final', 'Kettlewick Victoria', 114, '2-2', 'The derby, in extra time. Their centre-half follows the 9.', [PURPLE, SILVER], SKY],
    [S3, CUP, 'Final', 'Thistlewick Town', '90+4', '2-2', 'Level since the 71st minute. Five touches to win a cup.', [SKY, INK], MUSTARD],

    // Season 4: Division Three, fourteen clubs, one title. Scarrow Vale lead it from August and have to be caught.
    [S4, D3, 'Matchday 1', 'Greaveley Glassworks', 63, '0-0', 'Cup holders, says the gate. Greaveley slide to the ball.', [CLARET, CHALK], MUSTARD],
    [S4, D3, 'Matchday 5', "Monk's Hollin", 78, '1-1', "Monk's Hollin remember the cup. Their full-back stays wide.", [LILAC, INK], MUSTARD],
    [S4, D3, 'Matchday 9', 'Nabthorpe Rovers', 86, '0-1', 'Scarrow Vale won again. Nabthorpe hold a high line.', [ROYAL, SILVER], MUSTARD],
    [S4, D3, 'Matchday 13', 'Tindle Moor Welfare', 70, '2-2', 'Halfway, four points behind. Tindle Moor press high.', [BROWN, CHALK], SKY],
    [S4, D3, 'Matchday 17', 'Loomgate Mechanics', 82, '0-0', 'Frost on the slope. Their centre-half follows the 9 off.', [PETROL, PINK], MUSTARD],
    [S4, D3, 'Matchday 21', 'Wrenfield Colts', 75, '1-2', 'Wrenfield came up after us. They mark the 9 very tight.', [BLACK, LILAC], MUSTARD],
    [S4, D3, 'Matchday 24', "Oxbeck St Jude's", 88, '1-1', 'Scarrow Vale drew. Oxbeck push up, and a win draws us level.', [CHALK, PURPLE], MUSTARD],
    [S4, D3, 'Matchday 26', 'Scarrow Vale', 87, '0-1', 'Level on points, ahead on goals. All five have to touch it.', [CLARET, SKY], MUSTARD],

    // Season 5: the first year in Division Two. Bigger grounds, less of the ball, and three clubs go down.
    [S5, D2, 'Matchday 1', 'Cudderston Borough', 74, '0-1', 'First day in Division Two. Their full-back stays wide.', [INK, PINK], MUSTARD],
    [S5, D2, 'Matchday 4', 'Quillham Athletic', 67, '1-1', 'One point from three. Quillham squeeze across to the ball.', [PLUM, CHALK], MUSTARD],
    [S5, D2, 'Matchday 8', 'Pinderfold Athletic', 81, '1-2', 'They have had the ball all day. Their full-back goes wide.', [SILVER, ROYAL], MUSTARD],
    [S5, D2, 'Matchday 12', 'Brackenfold United', 59, '0-0', 'Brackenfold give little away. Their keeper sweeps it up.', [BLACK, SKY], MUSTARD],
    [S5, D2, 'Matchday 17', 'Marrowby Railway', 85, '0-1', 'No win since October. Marrowby step up on every ball back.', [CLARET, SILVER], MUSTARD],
    [S5, D2, 'Matchday 22', 'Wetherlow Wanderers', 72, '2-2', 'Fourth bottom at fifth bottom. Their line steps up.', [SKY, PURPLE], MUSTARD],
    [S5, D2, 'Matchday 26', 'Stoopley End', 90, '1-1', 'Stoopley End mark man for man. The 9 can take one away.', [BROWN, LILAC], MUSTARD],
    [S5, D2, 'Matchday 29', 'Quernside United', 83, '1-1', 'A win and we are safe. Quernside hold a high line.', [SLATE, CHALK], MUSTARD],

    // Season 6: top of Division Two by Christmas, while the council decides whether the Rec becomes houses.
    [S6, D2, 'Matchday 1', 'Sallowby Institute', 57, '0-0', 'A notice on the gate. Sallowby crowd the near side.', [ROYAL, LILAC], MUSTARD],
    [S6, D2, 'Matchday 6', 'Rudlock Brickworks', 76, '1-2', 'The petition is on the tea hut. Rudlock press high.', [BROWN, PINK], SKY],
    [S6, D2, 'Matchday 10', 'Kettlewick Victoria', 88, '1-1', 'Victoria signed the petition, then held a high line.', [PURPLE, SILVER], SKY],
    [S6, D2, 'Matchday 15', 'Cudderston Borough', 64, '0-0', 'Top at Christmas. Their centre-half steps out to a runner.', [INK, PINK], MUSTARD],
    [S6, D2, 'Matchday 19', 'Uffwell Old Boys', 79, '2-2', 'The surveyor is back. Their line steps up on a ball back.', [PURPLE, PINK], LILAC],
    [S6, D2, 'Matchday 24', 'Aldergrave Welfare', '90+1', '0-1', 'The hearing is in May. Their marker stays on the 9.', [PLUM, LILAC], MUSTARD],
    [S6, D2, 'Matchday 28', 'Brackenfold United', 71, '0-0', 'Marrowby lead by a point. Brackenfold push on and leave two.', [BLACK, SKY], MUSTARD],
    [S6, D2, 'Matchday 30', 'Marrowby Railway', 84, '1-1', 'One goes up. Win and it is us. One seam in their back four.', [CLARET, SILVER], MUSTARD],

    // Season 7: Division One, and the other end of the table from season one. Everybody defends against the leaders.
    [S7, D1, 'Matchday 1', 'Mossgrave Casuals', 71, '0-0', 'Six votes to five: the Rec stays. Run at their back line.', [ROYAL, SKY], MUSTARD],
    [S7, D1, 'Matchday 5', 'Eastmere Harriers', 80, '1-1', 'Eastmere again, as equals. Their full-back stays wide.', [INK, SILVER], SKY],
    [S7, D1, 'Matchday 9', 'Eldergate Amateurs', 68, '0-1', 'Eldergate scored early and sat deep. Their 9 is marked.', [PLUM, PINK], MUSTARD],
    [S7, D1, 'Matchday 13', 'Thistlewick Town', 85, '1-1', 'Thistlewick are top. Their keeper comes for everything.', [SKY, INK], MUSTARD],
    [S7, D1, 'Matchday 18', 'Yarlow Bridge', 90, '0-0', 'Top since New Year. Yarlow hold a high line and wait.', [BROWN, SILVER], MUSTARD],
    [S7, D1, 'Matchday 22', 'Wimberfold Olympic', 77, '1-2', 'Two visits, two goals for them. Their line steps up.', [CHALK, ROYAL], MUSTARD],
    [S7, D1, 'Matchday 26', 'Varnley Park', 88, '0-0', 'Thistlewick won at noon. Varnley crowd the ball side.', [PURPLE, LILAC], MUSTARD],
    [S7, D1, 'Matchday 29', 'Thistlewick Town', 86, '1-1', 'First at second, a point apart. They step up on a ball back.', [SKY, INK], MUSTARD],

    // Season 8: the league champions go into the national Amateur Cup. Eight rounds, and the last is at the national ground.
    [S8, NAT, 'First round', 'Coldrake Welfare', 62, '0-0', 'A national draw, at home. Coldrake press from the front.', [BLACK, SILVER], MUSTARD],
    [S8, NAT, 'Second round', 'Saltern Quay Dockers', 79, '1-1', 'Five hours by coach. Their centre-half follows the 9 up.', [PETROL, CHALK], MUSTARD],
    [S8, NAT, 'Third round', 'Sedgeholme Fen', 84, '2-2', 'Last 64. Wind off the fen, and their full-back stays wide.', [PLUM, SILVER], MUSTARD],
    [S8, NAT, 'Fourth round', 'Old Athelstonians', 104, '1-1', 'Six times winners. Extra time, and their line still holds.', [PINK, BLACK], MUSTARD],
    [S8, NAT, 'Fifth round', 'Polvessa Mariners', 89, '0-0', 'Record gate at the Rec: 1,104. Their marker is on the 9.', [CHALK, PLUM], MUSTARD],
    [S8, NAT, 'Quarter-final', 'Limeburn Gasworks', 76, '2-2', 'Last eight. Limeburn step out to anyone who runs at them.', [PURPLE, SKY], MUSTARD],
    [S8, NAT, 'Semi-final', 'Stannerby Steelworks', '90+2', '1-1', 'A borrowed league ground. Stannerby throw everyone forward.', [CLARET, PINK], MUSTARD],
    [S8, NAT, 'Final', 'Winterlea Amateurs', 119, '3-3', 'Extra time at the national ground. Five men, one move.', [CLARET, LILAC], MUSTARD]
  ];

  // Built once: a second load reuses the first table, so applying again changes nothing.
  const STORY = root.OMT_STORY || (root.OMT_STORY = FIXTURES.map(f => ({
    season: f[0],
    seasonWord: WORD[f[0]],
    story: { us: US, comp: f[1], match: f[2], opp: f[3], minute: f[4], score: f[5], line: f[6] },
    kit: { us: HOME.slice(), them: f[7].slice(), gk: f[8] }
  })));

  // Apply by position. Safe with fewer than 60 levels, and a level that already carries its entry is left alone.
  try {
    for (let i = 0; i < STORY.length && i < L.length; i++) {
      const lv = L[i]; if (!lv || typeof lv !== 'object' || lv.story === STORY[i].story) continue;
      lv.season = STORY[i].season; lv.seasonWord = STORY[i].seasonWord; lv.story = STORY[i].story; lv.kit = STORY[i].kit;
    }
  } catch (e) { /* never stop the game over programme notes */ }
  if (typeof module !== 'undefined' && module.exports) module.exports = STORY;
})(typeof module !== 'undefined' ? global : window);

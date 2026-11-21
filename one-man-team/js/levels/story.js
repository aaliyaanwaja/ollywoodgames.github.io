/* Story: the fixture list for all 20 moves, keyed by level position (not by the move's name).
   Loaded after the level packs and before sim.js. Sets `season`, `story` and `kit` on OMT_LEVELS[i] when that level exists,
   so packs may be shorter than 20 while work is in progress. See docs/STORY.md for the club, the arc and the naming rules.
   story.score is "us-them" BEFORE the goal; the interface adds one to our side when the move is scored. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);

  const US = 'Kettlewick Printworks';
  const HOME = ['#E4572E', '#F2EAD8'];   // tomato and paper, every fixture

  // The printed palette opponents are drawn from. Theirs: [deck and stripes, shirt and rim].
  // Mustard is kept for goalkeepers only: on the pitch it is the colour of the live player's ring.
  const INK = '#14213D', BLACK = '#26262B', BROWN = '#5E3A24', PLUM = '#6B2D5C', PURPLE = '#4B2E83', CLARET = '#6E1F3A',
    ROYAL = '#2F5DA8', SKY = '#8EC5D6', LILAC = '#B9A5D6', PINK = '#EFA7B8', SILVER = '#B8BEC6', MUSTARD = '#F2B705', CHALK = '#FBF8F0';

  const S1 = 'Bottom of the League', S2 = 'The Promotion Race', S3 = 'The County Cup';
  const D4 = 'Division Four', CUP = 'County Cup';

  //  season, comp, match, opponent, minute, score before the goal, programme line, their kit, their keeper
  const FIXTURES = [
    // Season 1: four games left, no wins, and the bottom club has to ask to be let back in.
    [S1, D4, 'Matchday 19', "Pellow's Bakery", 58, '0-0', 'No wins since August. The tea urn is on regardless.', [BROWN, CHALK], MUSTARD],
    [S1, D4, 'Matchday 20', 'Tolbury Dynamo', 66, '1-1', 'One win is a result. A second would be a run.', [INK, SKY], MUSTARD],
    [S1, D4, 'Matchday 21', 'Old Corvians', 84, '0-1', 'A point today takes it to the last Sunday.', [BLACK, PINK], MUSTARD],
    [S1, D4, 'Matchday 22', 'Netherwick Albion', 88, '1-1', 'Bottom plays second bottom. A draw suits only them.', [ROYAL, CHALK], MUSTARD],

    // Season 2: the same division a year on, and this time the table is the right way up.
    [S2, D4, 'Matchday 1', 'Marl Pit Rovers', 54, '0-0', 'New season, same nets. The holes have been darned.', [PLUM, SKY], MUSTARD],
    [S2, D4, 'Matchday 4', 'Cobble Street Social', 77, '0-1', 'Unbeaten in three. Nobody has said it out loud.', [INK, LILAC], MUSTARD],
    [S2, D4, 'Matchday 8', 'Kettlewick Victoria', 83, '1-2', 'The derby. Both ends of the High Street are here.', [PURPLE, SILVER], SKY],
    [S2, D4, 'Matchday 11', 'Crannock Dairies', 69, '2-2', 'Halfway, and third. The secretary has checked twice.', [SILVER, INK], MUSTARD],
    [S2, D4, 'Matchday 15', 'Staunchley Rangers', 90, '0-0', 'Ninety minutes of nothing. One move would do.', [ROYAL, PINK], LILAC],
    [S2, D4, 'Matchday 18', 'Lower Hexby', 79, '1-2', 'Lose here and second place is a rumour again.', [BROWN, SKY], MUSTARD],
    [S2, D4, 'Matchday 21', 'Wrenfield Colts', 87, '2-2', 'Second hosts third. Two go up, and three want to.', [BLACK, LILAC], MUSTARD],
    [S2, D4, 'Matchday 22', 'Scarrow Vale', '90+2', '1-1', 'The champions need nothing. We need one more goal.', [CLARET, SKY], MUSTARD],

    // Season 3: a Division Three club in the County Cup, round by round, to a final nobody budgeted for.
    [S3, CUP, 'First round', "Monk's Hollin", 61, '0-0', 'First cup tie in eleven years. The kit still fits.', [LILAC, INK], MUSTARD],
    [S3, CUP, 'Second round', 'Tindle Moor Welfare', 72, '2-2', 'Four goals already. The groundsman is not enjoying it.', [BROWN, CHALK], SKY],
    [S3, CUP, 'Third round', 'Eastmere Harriers', 88, '1-2', 'Two divisions above us. An equaliser buys a replay.', [INK, SILVER], SKY],
    [S3, CUP, 'Replay', 'Eastmere Harriers', 81, '0-0', 'Wednesday night, heavy rain. They brought the pink kit.', [PINK, INK], MUSTARD],
    [S3, CUP, 'Fourth round', 'Quillham Athletic', 90, '1-1', 'Last sixteen. The coach home leaves at five sharp.', [PLUM, CHALK], MUSTARD],
    [S3, CUP, 'Quarter-final', 'Brackenfold United', 85, '0-0', 'Brackenfold have not conceded in this cup. Yet.', [BLACK, SKY], MUSTARD],
    [S3, CUP, 'Semi-final', 'Kettlewick Victoria', 114, '2-2', 'The derby, at a neutral ground, in extra time.', [PURPLE, SILVER], SKY],
    [S3, CUP, 'Final', 'Thistlewick Town', '90+4', '2-2', 'Two down at the break. Level since the 71st minute.', [SKY, INK], MUSTARD]
  ];

  // Built once: a second load reuses the first table, so applying again changes nothing.
  const STORY = root.OMT_STORY || (root.OMT_STORY = FIXTURES.map(f => ({
    season: f[0],
    story: { us: US, comp: f[1], match: f[2], opp: f[3], minute: f[4], score: f[5], line: f[6] },
    kit: { us: HOME.slice(), them: f[7].slice(), gk: f[8] }
  })));

  // Apply by position. Safe with fewer than 20 levels, and a level that already carries its entry is left alone.
  try {
    for (let i = 0; i < STORY.length && i < L.length; i++) {
      const lv = L[i]; if (!lv || typeof lv !== 'object' || lv.story === STORY[i].story) continue;
      lv.season = STORY[i].season; lv.story = STORY[i].story; lv.kit = STORY[i].kit;
    }
  } catch (e) { /* never stop the game over programme notes */ }
  if (typeof module !== 'undefined' && module.exports) module.exports = STORY;
})(typeof module !== 'undefined' ? global : window);

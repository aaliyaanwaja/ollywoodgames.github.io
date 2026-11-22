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
  const D4 = 'Division Four', D3 = 'Division Three', D2 = 'Division Two', D1 = 'Division One', CUP = 'County Cup', NAT = 'Amateur Cup';

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
    [S3, CUP, 'Final', 'Thistlewick Town', '90+4', '2-2', 'Two down at the break. Level since the 71st minute.', [SKY, INK], MUSTARD],

    // Season 4: Division Three, fourteen clubs, one title. Scarrow Vale lead it from August and have to be caught.
    [S4, D3, 'Matchday 1', 'Greaveley Glassworks', 63, '0-0', 'County Cup holders, says the gate. The gate still sticks.', [CLARET, CHALK], MUSTARD],
    [S4, D3, 'Matchday 5', "Monk's Hollin", 78, '1-1', "Monk's Hollin again. They have not forgotten the cup.", [LILAC, INK], MUSTARD],
    [S4, D3, 'Matchday 9', 'Nabthorpe Rovers', 86, '0-1', 'Scarrow Vale won again. A point keeps them in sight.', [ROYAL, SILVER], MUSTARD],
    [S4, D3, 'Matchday 13', 'Tindle Moor Welfare', 70, '2-2', 'Halfway. Second, four points behind Scarrow Vale.', [BROWN, CHALK], SKY],
    [S4, D3, 'Matchday 17', 'Loomgate Mechanics', 82, '0-0', 'Frost on the slope. A corner may be the only way up it.', [PETROL, PINK], MUSTARD],
    [S4, D3, 'Matchday 21', 'Wrenfield Colts', 75, '1-2', 'Wrenfield came up a year after us. They are still quick.', [BLACK, LILAC], MUSTARD],
    [S4, D3, 'Matchday 24', "Oxbeck St Jude's", 88, '1-1', 'Scarrow Vale drew. A win today puts us level on points.', [CHALK, PURPLE], MUSTARD],
    [S4, D3, 'Matchday 26', 'Scarrow Vale', 87, '0-1', 'Level on points, ahead on goals. A draw wins the league.', [CLARET, SKY], MUSTARD],

    // Season 5: the first year in Division Two. Bigger grounds, less of the ball, and three clubs go down.
    [S5, D2, 'Matchday 1', 'Cudderston Borough', 74, '0-1', 'First day in Division Two. Their ground has a stand.', [INK, PINK], MUSTARD],
    [S5, D2, 'Matchday 4', 'Quillham Athletic', 67, '1-1', 'One point from three games. Quillham are still tidy.', [PLUM, CHALK], MUSTARD],
    [S5, D2, 'Matchday 8', 'Pinderfold Athletic', 81, '1-2', 'They have had the ball all afternoon. We get it once.', [SILVER, ROYAL], MUSTARD],
    [S5, D2, 'Matchday 12', 'Brackenfold United', 59, '0-0', 'Brackenfold still give little away. One break may do.', [BLACK, SKY], MUSTARD],
    [S5, D2, 'Matchday 17', 'Marrowby Railway', 85, '0-1', 'No win since October. We now read the table upwards.', [CLARET, SILVER], MUSTARD],
    [S5, D2, 'Matchday 22', 'Wetherlow Wanderers', 72, '2-2', 'Fourth bottom at fifth bottom. Three go down.', [SKY, PURPLE], MUSTARD],
    [S5, D2, 'Matchday 26', 'Stoopley End', 90, '1-1', 'Stoopley End send everyone forward. That leaves room.', [BROWN, LILAC], MUSTARD],
    [S5, D2, 'Matchday 29', 'Quernside United', 83, '1-1', 'A win and we are safe with a Sunday to spare.', [SLATE, CHALK], MUSTARD],

    // Season 6: top of Division Two by Christmas, while the council decides whether the Rec becomes houses.
    [S6, D2, 'Matchday 1', 'Sallowby Institute', 57, '0-0', 'A notice on the gate. The council wants the Rec back.', [ROYAL, LILAC], MUSTARD],
    [S6, D2, 'Matchday 6', 'Rudlock Brickworks', 76, '1-2', 'The petition is on the tea hut. Sign before kick-off.', [BROWN, PINK], SKY],
    [S6, D2, 'Matchday 10', 'Kettlewick Victoria', 88, '1-1', 'Victoria signed the petition. Then they named a side.', [PURPLE, SILVER], SKY],
    [S6, D2, 'Matchday 15', 'Cudderston Borough', 64, '0-0', 'Top at Christmas. A surveyor measured the pitch Tuesday.', [INK, PINK], MUSTARD],
    [S6, D2, 'Matchday 19', 'Uffwell Old Boys', 79, '2-2', 'The surveyor is back. He stayed for the second half.', [BLACK, CHALK], LILAC],
    [S6, D2, 'Matchday 24', 'Aldergrave Welfare', '90+1', '0-1', 'The hearing is in May. So, as it happens, is the run-in.', [PLUM, LILAC], MUSTARD],
    [S6, D2, 'Matchday 28', 'Brackenfold United', 71, '0-0', 'Marrowby lead by a point. Brackenfold give nothing.', [BLACK, SKY], MUSTARD],
    [S6, D2, 'Matchday 30', 'Marrowby Railway', 84, '1-1', 'One goes up. Win and it is us. The council votes Monday.', [CLARET, SILVER], MUSTARD],

    // Season 7: Division One, and the other end of the table from season one. Everybody defends against the leaders.
    [S7, D1, 'Matchday 1', 'Mossgrave Casuals', 71, '0-0', 'The council voted six to five. The Rec stays.', [ROYAL, SKY], MUSTARD],
    [S7, D1, 'Matchday 5', 'Eastmere Harriers', 80, '1-1', 'Eastmere again, as equals this time. Navy at home.', [INK, SILVER], SKY],
    [S7, D1, 'Matchday 9', 'Eldergate Amateurs', 68, '0-1', 'Eldergate scored early and have defended ever since.', [PLUM, PINK], MUSTARD],
    [S7, D1, 'Matchday 13', 'Thistlewick Town', 85, '1-1', 'Thistlewick are top. They rang ahead about parking.', [SKY, INK], MUSTARD],
    [S7, D1, 'Matchday 18', 'Yarlow Bridge', 90, '0-0', 'Top since New Year. Nobody comes here to attack now.', [BROWN, SILVER], MUSTARD],
    [S7, D1, 'Matchday 22', 'Wimberfold Olympic', 77, '1-2', 'Two visits, two goals for them. Then ten behind the ball.', [CHALK, ROYAL], MUSTARD],
    [S7, D1, 'Matchday 26', 'Varnley Park', 88, '0-0', 'Thistlewick won at noon. The lead is one point again.', [PURPLE, LILAC], MUSTARD],
    [S7, D1, 'Matchday 29', 'Thistlewick Town', 86, '1-1', 'First at second, a point apart. Win and it is settled.', [SKY, INK], MUSTARD],

    // Season 8: the league champions go into the national Amateur Cup. Eight rounds, and the last is at the national ground.
    [S8, NAT, 'First round', 'Coldrake Welfare', 62, '0-0', 'League champions get a national draw. It is a home tie.', [BLACK, SILVER], MUSTARD],
    [S8, NAT, 'Second round', 'Saltern Quay Dockers', 79, '1-1', 'Five hours by coach. The driver knows a short cut.', [PETROL, CHALK], MUSTARD],
    [S8, NAT, 'Third round', 'Sedgeholme Fen', 84, '2-2', 'Last 64 in the country. Flat pitch, wind off the fen.', [PLUM, SILVER], MUSTARD],
    [S8, NAT, 'Fourth round', 'Old Athelstonians', 104, '1-1', 'Six times winners, none lately. Extra time at theirs.', [PINK, BLACK], MUSTARD],
    [S8, NAT, 'Fifth round', 'Polvessa Mariners', 89, '0-0', 'Record gate at the Rec: 1,104. The urn was filled twice.', [INK, CHALK], MUSTARD],
    [S8, NAT, 'Quarter-final', 'Limeburn Gasworks', 76, '2-2', 'Last eight. The secretary has stopped checking twice.', [PURPLE, SKY], MUSTARD],
    [S8, NAT, 'Semi-final', 'Stannerby Steelworks', '90+2', '1-1', 'A borrowed league ground. Both dugouts have roofs.', [CLARET, PINK], MUSTARD],
    [S8, NAT, 'Final', 'Winterlea Amateurs', 119, '3-3', 'Extra time. The typesetter has kept the back page blank.', [CHALK, INK], LILAC]
  ];

  // Built once: a second load reuses the first table, so applying again changes nothing.
  const STORY = root.OMT_STORY || (root.OMT_STORY = FIXTURES.map(f => ({
    season: f[0],
    story: { us: US, comp: f[1], match: f[2], opp: f[3], minute: f[4], score: f[5], line: f[6] },
    kit: { us: HOME.slice(), them: f[7].slice(), gk: f[8] }
  })));

  // Apply by position. Safe with fewer than 60 levels, and a level that already carries its entry is left alone.
  try {
    for (let i = 0; i < STORY.length && i < L.length; i++) {
      const lv = L[i]; if (!lv || typeof lv !== 'object' || lv.story === STORY[i].story) continue;
      lv.season = STORY[i].season; lv.story = STORY[i].story; lv.kit = STORY[i].kit;
    }
  } catch (e) { /* never stop the game over programme notes */ }
  if (typeof module !== 'undefined' && module.exports) module.exports = STORY;
})(typeof module !== 'undefined' ? global : window);

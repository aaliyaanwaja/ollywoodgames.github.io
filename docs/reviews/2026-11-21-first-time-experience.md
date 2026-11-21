# First-time experience: review of playtest 1 (21 Nov 2026)

## Recommendation

Do both, but not as the owner framed it. Put four no-fail drills in front of level 1 as the first things you play (skippable, replayable from How to play), not a separate menu item. Keep levels 1-2 roughly as they are, with a wider shooting target and no visible clock. Do not remove more defenders: that was tried and did not work, because the problem is learning load, not opposition.

## Diagnosis

Level 1 asks for about fourteen new things inside a move the bot finishes in 4.2 seconds: left thumb runs; right thumb presses and holds; drag direction aims; drag length sets power; release kicks; pass into space; time rewinds; you become someone else; your pass replays; wait, then run onto it; carry closer; pick a corner; a clock; several fail states.

Taught: ten coach prompts in the right order, but they change during live play, and nobody reads with both thumbs busy.

First unexplained failure: the shot. I simulated it. On level 1, a shot from where the ball is received is saved at almost any aim. From about 10 m, the middle 3 m of the 8 m goal is saved and the posts go wide, leaving two bands about 2 m wide. The coach says "Press SHOOT and drag at the goal". A first-timer drags straight up and is "Saved" for doing as told. "Carry closer" is never prompted. Passing is not the problem: of 121 rough passes I swept, 120 could still be scored from.

Second: offside arrives at level 2, too soon.

## The design: first three minutes

No clock, stars or fail sheet in any drill. A miss puts the ball back within a second. One sentence each, with the game frozen until the player acts.

1. 0:00 Shoot. You are the 9, ball at feet, 10 m out, keeper only. Score twice. Teaches press, drag, release, corners.
2. 0:30 Run and shoot. Ball lying 8 m ahead. Run, collect, carry, score. Teaches the left thumb, then both.
3. 1:00 Pass. You are the 8, the 9 stands still, a marked patch of grass in front of him. Land the ball in it. Teaches power. No defender.
4. 1:30 The rewind. Same pass, then "Now you are the 9". A ghost line shows the run once. Meet your own pass and score, then watch the full replay. The game's one original idea deserves a clean moment.
5. 2:15 Level 1 as now, clock hidden, shots nudged towards the nearer open corner, early mistakes restart instantly.
6. 3:00 Level 2 becomes a second plain finish from another angle. Challenge starts at level 3: offside and the clock arrive there. Aim assist fades out by level 5.

I would not slow time while aiming: timing is the game, and it teaches a rhythm you must unlearn.

Cut: the brief page before level 1; mid-play coach text on level 1; clock and stars on levels 1-2; the jump to five defenders at level 5 (make it three, then four).

## What the owner's 20 retries predict

He knows football, invented the rules and wants it to work. A stranger has none of that; in my experience two or three unexplained failures end a free game's first session. His 20 predicts that most strangers never see level 5. The brief does not say which levels took 20; ask him.

I disagree that "tough but addictive" generalises: it was addictive because he understood every failure.

Targets, for first-timers:
- Drills: everyone finishes inside two minutes.
- Levels 1-2: four in five within two attempts.
- Levels 3-4: median three attempts, nobody over six.
- Levels 5-6: median five, nobody over ten.
- Levels 1-6 inside ten minutes.

## Hallway test, five people, this week

Five people who have not seen it, at least two who do not follow football. Your device, screen recorded.

Say: "I am testing the game, not you. Please think aloud. I cannot help." Then nothing: do not explain the rewind, encourage or point. If asked, reply "What would you try?" Stop at ten minutes or level 6.

Watch thumbs and face. Write down: attempts per level; time to first goal; every fail they cannot explain (ask "What happened there?" once); what they say at the rewind; whether they ask to carry on.

Nielsen Norman Group advises that five users surface most usability problems and that several small rounds beat one large one: fix, then rerun with five new people.

Fixed means:
1. Five of five score in level 1 within two attempts, unaided.
2. After any fail, they can say what they will do differently.
3. At least three ask to keep playing when you stop them.

## What I checked

Verified: the brief, pack1.js, the COACH and TUT prompts, the ftue screenshots for levels 1-2, the jitter test, and my own bot sweeps of passes and shots (throwaway scripts; repo untouched). From experience, not measured: tolerance for unexplained failure, reading under two-thumb load, and the targets, which are hypotheses until the hallway test. Apple's developer guidance supports the shape: one step at a time, competence before advancement, a skip option.

## Sources

- Apple Developer, "Onboarding for Games": developer.apple.com/app-store/onboarding-for-games/
- Nielsen Norman Group, "Why You Only Need to Test with 5 Users": nngroup.com/articles/why-you-only-need-to-test-with-5-users/

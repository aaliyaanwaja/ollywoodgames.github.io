/* Pack 7: breaking a low block (fixtures 45-52). Eight or nine behind the ball, a back four on the edge of its own
   box and no room in behind: the moves work in front of the block and round the sides of it.
   Defender types and fields are described in tools/LEVEL_DESIGN.md. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    {
      name: 'The overload', time: 8,
      brief: 'Four players. Three of you crowd the right and their block comes across. Then get it left, fast.',
      att: [
        { num: 7, name: 'Winger', x: 43, y: 30, role: 'ball', tip: 'They have crowded you out. Roll it back to the 8.' },
        { num: 8, name: 'Midfielder', x: 35, y: 38, role: 'ball', tip: 'Aim early and move it on first time to the 6 in the middle.' },
        { num: 6, name: 'Pivot', x: 23, y: 44, role: 'ball', tip: 'Aim early. Fire it first time to the left corner of the box, into the path of the 11.' },
        { num: 11, name: 'Left winger', x: 7, y: 28, role: 'ball', tip: 'Nobody went with you. Meet it at the corner of the box and strike first time, far corner.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'mark', a: 0, x: 41, y: 26.2, spd: 5.2 },
        { t: 'zone', x: 37, y: 30, spd: 5, eng: 5 },
        { t: 'zone', x: 32, y: 31, spd: 5, eng: 5 },
        { t: 'zone', x: 27, y: 30, spd: 5, eng: 5 },
        { t: 'line', x: 15, y: 14, spd: 5.2, eng: 3 }, { t: 'line', x: 23, y: 14, spd: 5.2, eng: 3 },
        { t: 'line', x: 31, y: 14, spd: 5.2, eng: 3 }, { t: 'line', x: 39, y: 14, spd: 5.2, eng: 3 }
      ],
      gk: { react: 16 },
      lines: { 0: { floor: 10, step: 1 } }
    },
    {
      name: 'Let it run', time: 11,
      brief: 'Four players. The 9 comes to meet the square ball and steps over it. The 10 behind him strikes.',
      att: [
        { num: 8, name: 'Playmaker', x: 23, y: 41, role: 'ball', tip: 'Play it wide to the feet of the 7.' },
        { num: 7, name: 'Winger', x: 44, y: 29, role: 'ball', tip: 'Come inside to the corner of the box, then roll it square along the edge.' },
        { num: 9, name: 'Decoy', x: 21.5, y: 16.5, role: 'decoy', tip: 'No ball for you. Run to meet the pass so your marker comes, and let it run. Then DONE.' },
        { num: 10, name: 'Number ten', x: 13, y: 27, role: 'ball', tip: 'Arrive where the 9 was standing. Aim early and strike it first time.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'zone', x: 31, y: 27, spd: 5, eng: 4 },
        { t: 'zone', x: 21, y: 29, spd: 5, eng: 4 },
        { t: 'zone', x: 36, y: 25, spd: 5, eng: 3.5, screen: 3 },
        { t: 'mark', a: 2, x: 21.8, y: 14.3, spd: 5.2 },
        { t: 'line', x: 12, y: 12.5, spd: 5.2, eng: 3 }, { t: 'line', x: 21, y: 12.5, spd: 5.2, eng: 3 },
        { t: 'line', x: 29, y: 12.5, spd: 5.2, eng: 3 }, { t: 'line', x: 38, y: 12.5, spd: 5.2, eng: 3 }
      ],
      lines: { 0: { floor: 10 } }
    },
    {
      name: 'Drag them across', time: 12,
      brief: 'Four players. Carry it across the box and their block slides with you. The 7 strikes where they were.',
      att: [
        { num: 6, name: 'Pivot', x: 27, y: 44, role: 'ball', tip: 'Play it out to the 8 on your right.' },
        { num: 8, name: 'Midfielder', x: 38, y: 34, role: 'ball', tip: 'Aim early and lay it inside first time to the 10.' },
        { num: 10, name: 'Number ten', x: 30, y: 27, role: 'ball', tip: 'Carry it left across the box so they slide over, then roll it back to the right for the 7.' },
        { num: 7, name: 'Winger', x: 44, y: 24, role: 'ball', tip: 'Hold your run. Arrive at the right of the D as the 10 rolls it back and strike first time.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'zone', x: 30, y: 36, spd: 5, eng: 4 },
        { t: 'zone', x: 21, y: 30, spd: 5, eng: 4 },
        { t: 'zone', x: 36, y: 27, spd: 5, eng: 3.5 },
        { t: 'line', x: 14, y: 13, spd: 5.2, eng: 3 }, { t: 'line', x: 21, y: 13, spd: 5.2, eng: 3 },
        { t: 'line', x: 27, y: 13, spd: 5.2, eng: 3 }, { t: 'line', x: 34, y: 13, spd: 5.2, eng: 3 }
      ],
      lines: { 0: { floor: 10 } }
    },
    {
      name: 'Blind-side run', time: 14,
      brief: 'Four players. Everyone watches the ball on the right. The 11 steals in behind his man at the far post.',
      att: [
        { num: 6, name: 'Pivot', x: 24, y: 44, role: 'ball', tip: 'Roll it across to the 8 on your right.' },
        { num: 8, name: 'Midfielder', x: 34, y: 37, role: 'ball', tip: 'Aim early and send it first time down the right touchline for the 7.' },
        { num: 7, name: 'Winger', x: 45, y: 27, role: 'ball', tip: 'Take it in your stride, away from the full-back. From the byline, drive it low to the far post.' },
        { num: 11, name: 'Left winger', x: 12, y: 17, role: 'ball', tip: 'Your marker is watching the ball. Go late behind his back and finish at the far post.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'zone', x: 29, y: 33, spd: 5, eng: 4 },
        { t: 'zone', x: 20, y: 30, spd: 5, eng: 4 },
        { t: 'zone', x: 35, y: 24, spd: 5, eng: 3.5 },
        { t: 'mark', a: 3, x: 13.6, y: 14.6, spd: 5.7, react: 30 },
        { t: 'mark', a: 2, x: 43, y: 23.4, spd: 5.5 },
        { t: 'line', x: 14, y: 13, spd: 5.2, eng: 3.5 }, { t: 'line', x: 21, y: 13, spd: 5.2, eng: 3.5 },
        { t: 'line', x: 27, y: 13, spd: 5.2, eng: 3.5 }, { t: 'line', x: 34, y: 13, spd: 5.2, eng: 3.5 }
      ],
      lines: { 0: { floor: 10 } }
    },
    {
      name: 'The underlap', time: 13,
      brief: 'Four players. The winger drags the full-back out, and the 8 runs inside him to the byline.',
      att: [
        { num: 6, name: 'Pivot', x: 27, y: 42, role: 'ball', tip: 'Play it wide to the feet of the 7.' },
        { num: 7, name: 'Winger', x: 44, y: 26, role: 'ball', tip: 'Come short so the full-back follows. Aim early and lay it square inside to the 8.' },
        { num: 8, name: 'Underlapper', x: 38, y: 37, role: 'ball', tip: 'Take it on the run inside the full-back, drive to the byline and pull it back to the 9.' },
        { num: 9, name: 'Striker', x: 23, y: 25, role: 'ball', tip: 'Arrive late near the penalty spot. Aim early and hit it first time.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'zone', x: 29, y: 34, spd: 5, eng: 4 },
        { t: 'zone', x: 20, y: 32, spd: 5, eng: 4 },
        { t: 'zone', x: 28, y: 23, spd: 5.2, eng: 4 },
        { t: 'mark', a: 3, x: 23.3, y: 22.6, spd: 5.3, react: 18 },
        { t: 'mark', a: 1, x: 42.6, y: 23.2, spd: 5.2, eng: 2 },
        { t: 'line', x: 10, y: 15, spd: 5.2, eng: 3 }, { t: 'line', x: 19, y: 15, spd: 5.2, eng: 3 },
        { t: 'line', x: 28, y: 15, spd: 5.2, eng: 3 }
      ],
      lines: { 0: { floor: 11 } }
    },
    {
      name: 'Draw them out', time: 8,
      brief: 'Four players. They will not leave their box. Play it backwards twice and their line follows it out.',
      att: [
        { num: 10, name: 'Number ten', x: 27, y: 26, role: 'ball', tip: 'No way through. Roll it back to the 8 and watch their line step up.' },
        { num: 8, name: 'Midfielder', x: 20, y: 32, role: 'ball', tip: 'Aim early and set it back again first time, to the 6.' },
        { num: 6, name: 'Pivot', x: 29, y: 38, role: 'ball', tip: 'They have come out. Aim early and hit it first time between the centre-halves.' },
        { num: 9, name: 'Striker', x: 24, y: 18.5, role: 'ball', tip: 'Come back out with their line to stay onside, then spin in behind as the 6 plays it.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'zone', x: 23, y: 28, spd: 5, eng: 4 },
        { t: 'zone', x: 33, y: 29, spd: 5, eng: 4 },
        { t: 'zone', x: 14, y: 27, spd: 5, eng: 4 },
        { t: 'mark', a: 3, x: 24.3, y: 16.2, spd: 5.3 },
        { t: 'line', x: 9, y: 17, spd: 5.2, eng: 6 }, { t: 'line', x: 20, y: 17, spd: 5.2, eng: 6 },
        { t: 'line', x: 30, y: 17, spd: 5.2, eng: 6 }, { t: 'line', x: 41, y: 17, spd: 5.2, eng: 6 }
      ],
      lines: { 0: { floor: 14, step: 6 } }
    },
    {
      name: 'Inside the full-back', time: 8,
      brief: 'Four players. One gap, between full-back and centre-half. The 7 darts into it as the 10 slides it through.',
      att: [
        { num: 6, name: 'Pivot', x: 30, y: 43, role: 'ball', tip: 'Roll it across to the 8 on your left.' },
        { num: 8, name: 'Midfielder', x: 18, y: 35, role: 'ball', tip: 'Take a touch, then play it into the feet of the 10.' },
        { num: 10, name: 'Number ten', x: 27, y: 22, role: 'ball', tip: 'Come short off your marker. Aim early and slide it first time inside the full-back.' },
        { num: 7, name: 'Winger', x: 42, y: 18, role: 'ball', tip: 'Stay level with their line. Dart inside the full-back as the 10 plays it. Finish first time.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'zone', x: 25, y: 34, spd: 5, eng: 4 },
        { t: 'zone', x: 33, y: 28, spd: 5, eng: 4 },
        { t: 'mark', a: 2, x: 26.8, y: 19.6, spd: 5.3 },
        { t: 'line', x: 11, y: 13, spd: 5.2, eng: 3.5 }, { t: 'line', x: 19, y: 13, spd: 5.2, eng: 3.5 },
        { t: 'line', x: 27, y: 13, spd: 5.2, eng: 3.5 }, { t: 'line', x: 36, y: 13, spd: 5.2, eng: 3.5 }
      ],
      lines: { 0: { floor: 10 } }
    },
    {
      name: 'Crossover runs', time: 12,
      brief: 'Five players. Both forwards are marked tight in the box. They swap posts as the cross comes in.',
      att: [
        { num: 9, name: 'Decoy', x: 21.5, y: 9.8, role: 'decoy', tip: 'No ball for you. Run across to the far post so your marker leaves the near one. Then DONE.' },
        { num: 6, name: 'Pivot', x: 27, y: 43, role: 'ball', tip: 'Roll it across to the 8 on your left.' },
        { num: 8, name: 'Midfielder', x: 17, y: 36, role: 'ball', tip: 'Aim early and send it first time down the left touchline for the 11.' },
        { num: 11, name: 'Winger', x: 5, y: 27, role: 'ball', tip: 'Take it in your stride, then pull it back to the near post before the covering man closes.' },
        { num: 10, name: 'Forward', x: 29, y: 12.5, role: 'ball', tip: 'Cross behind the 9 to the near post as the ball comes in. Finish first time.' }
      ],
      order: [0, 1, 2, 3, 4],
      def: [
        { t: 'zone', x: 22, y: 33, spd: 5, eng: 4 },
        { t: 'zone', x: 31, y: 30, spd: 5, eng: 4 },
        { t: 'zone', x: 15, y: 24, spd: 5, eng: 3.5 },
        { t: 'mark', a: 3, x: 7, y: 23.4, spd: 5.8 },
        { t: 'mark', a: 0, x: 21.8, y: 7.5, spd: 5.4 },
        { t: 'mark', a: 4, x: 28.6, y: 10.2, spd: 5.7, react: 10, tight: 0.6 },
        { t: 'zone', x: 36, y: 14, spd: 5, eng: 4 },
        { t: 'zone', x: 11.3, y: 10.7, spd: 5.1, eng: 5 }
      ]
    }
  );
})(typeof module !== 'undefined' ? global : window);

// Shared HUD pieces for the mockups (static; no game logic).
const SV = {
  pause: '<svg viewBox="0 0 24 24"><path d="M8.5 5.5v13M15.5 5.5v13" stroke-width="3"/></svg>',
  retry: '<svg viewBox="0 0 24 24"><path d="M19 12a7 7 0 1 1-2.2-5.1"/><path d="M19.5 3.8v4.4h-4.4"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M6.5 5.5v13"/><path d="M18.5 6l-8 6 8 6z"/></svg>',
  next: '<svg class="ic" viewBox="0 0 24 24"><path d="M4.5 12h14M13 6l6 6-6 6"/></svg>',
  list: '<svg class="ic" viewBox="0 0 24 24"><path d="M9 6.5h11M9 12h11M9 17.5h11"/><path d="M4.5 6.5h.5M4.5 12h.5M4.5 17.5h.5" stroke-width="3"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 2.8l2.85 5.9 6.45.9-4.7 4.5 1.15 6.4L12 17.45 6.25 20.5l1.15-6.4-4.7-4.5 6.45-.9z"/></svg>',
  arrow: '<svg viewBox="0 0 14 10" width="12" height="10"><path d="M1 5h11M8 1.5L12 5 8 8.5" fill="none" stroke="#4A5573" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
function hud(o) {
  const strip = o.team.map((t, i) => (i ? SV.arrow : '') + '<span class="base ' + t[1] + '">' + t[0] + '</span>').join('');
  return '<header class="hud2">' +
    '<div class="rowa"><span class="ib">' + SV.pause + '</span><div class="team">' + strip + '</div>' +
    '<span class="ib">' + SV.prev + '</span><span class="ib">' + SV.retry + '</span></div>' +
    '<div class="rowb"><span class="board"><span class="min">' + o.min + '</span><span class="sc">' + o.score + '</span></span>' +
    '<div class="bar"><div class="fill" style="width:' + o.fill + '%"></div><div class="tickx"></div>' + (o.marks || []).map(m => '<i class="dia" style="left:' + m + '%"></i>').join('') + '</div>' +
    '<span class="secs">' + o.secs + '</span></div></header>';
}

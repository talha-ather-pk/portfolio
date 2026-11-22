// Filter the data-portfolio cards by skill. Without JS every card stays visible.
(function () {
  var bar = document.querySelector('.pfilter');
  if (!bar) return;
  var cards = document.querySelectorAll('.pcard');
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-filter]');
    if (!b) return;
    var f = b.getAttribute('data-filter');
    bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    cards.forEach(function (c) {
      c.hidden = f !== 'all' && (' ' + c.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') < 0;
    });
  });
})();

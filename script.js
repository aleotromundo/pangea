(function(){
  var toggle = document.getElementById('navToggle');
  var panel = document.getElementById('mobilePanel');
  if(!toggle || !panel) return;
  function closePanel(){
    toggle.classList.remove('active');
    panel.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function(){
    var isActive = toggle.classList.toggle('active');
    panel.classList.toggle('active', isActive);
    toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });
  panel.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closePanel);
  });
})();

document.querySelectorAll('.filter-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    var f = btn.dataset.filter;
    document.querySelectorAll('.world-card').forEach(function(card){
      var cats = card.dataset.cats.split(' ');
      card.style.display = (f === 'all' || cats.indexOf(f) !== -1) ? '' : 'none';
    });
  });
});

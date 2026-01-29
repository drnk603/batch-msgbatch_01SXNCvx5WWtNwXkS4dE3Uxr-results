(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var burger = header.querySelector('.dr-header-burger');
  var navList = header.querySelector('.dr-nav-list');
  var headerInner = header.querySelector('.dr-header-inner');

  if (!burger || !navList || !headerInner) return;

  burger.addEventListener('click', function () {
    var isOpen = burger.classList.toggle('dr-is-open');
    headerInner.classList.toggle('dr-nav-open', isOpen);
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
})();

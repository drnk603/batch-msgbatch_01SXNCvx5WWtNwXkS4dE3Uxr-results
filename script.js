(function() {
  'use strict';

  window.__app = window.__app || {};

  if (window.__app.__initialized) {
    return;
  }
  window.__app.__initialized = true;

  var debounce = function(fn, delay) {
    var timer = null;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  };

  var throttle = function(fn, limit) {
    var inThrottle;
    return function() {
      var context = this;
      var args = arguments;
      if (!inThrottle) {
        fn.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  };

  function initBurgerMenu() {
    if (window.__app.__burgerInit) {
      return;
    }
    window.__app.__burgerInit = true;

    var toggle = document.querySelector('.navbar-toggler');
    var navbarNav = document.getElementById('navbarNav');
    var body = document.body;

    if (!toggle || !navbarNav) {
      return;
    }

    var isOpen = false;

    function openMenu() {
      isOpen = true;
      navbarNav.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
    }

    function closeMenu() {
      isOpen = false;
      navbarNav.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    function toggleMenu() {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleMenu();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', function(e) {
      if (isOpen && !navbarNav.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    var navLinks = navbarNav.querySelectorAll('.c-nav__link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        closeMenu();
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && isOpen) {
        closeMenu();
      }
    }, 200);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function initScrollSpy() {
    if (window.__app.__scrollSpyInit) {
      return;
    }
    window.__app.__scrollSpyInit = true;

    var sections = document.querySelectorAll('[id^="section-"]');
    var navLinks = document.querySelectorAll('.c-nav__link[href^="#section-"]');

    if (sections.length === 0 || navLinks.length === 0) {
      return;
    }

    function getHeaderHeight() {
      var header = document.querySelector('.l-header');
      return header ? header.offsetHeight : 80;
    }

    var scrollHandler = throttle(function() {
      var scrollPos = window.pageYOffset || document.documentElement.scrollTop;
      var headerHeight = getHeaderHeight();
      var currentSection = null;

      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var sectionTop = section.offsetTop - headerHeight - 100;
        var sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          currentSection = section.getAttribute('id');
          break;
        }
      }

      for (var j = 0; j < navLinks.length; j++) {
        var link = navLinks[j];
        var href = link.getAttribute('href');
        if (href && href.substring(1) === currentSection) {
          link.classList.add('is-active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('is-active');
          link.removeAttribute('aria-current');
        }
      }
    }, 100);

    window.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler();
  }

  function initSmoothScroll() {
    if (window.__app.__smoothScrollInit) {
      return;
    }
    window.__app.__smoothScrollInit = true;

    function getHeaderHeight() {
      var header = document.querySelector('.l-header');
      return header ? header.offsetHeight : 80;
    }

    function smoothScrollTo(target) {
      var headerHeight = getHeaderHeight();
      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (target && target.tagName === 'A') {
        var href = target.getAttribute('href');
        if (href && href.indexOf('#') === 0 && href !== '#' && href !== '#!') {
          var targetId = href.substring(1);
          var targetElement = document.getElementById(targetId);
          if (targetElement) {
            e.preventDefault();
            smoothScrollTo(targetElement);
            if (window.history && window.history.pushState) {
              window.history.pushState(null, null, href);
            }
          }
        }
      }
    });
  }

  function initActiveMenu() {
    if (window.__app.__activeMenuInit) {
      return;
    }
    window.__app.__activeMenuInit = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.c-nav__link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkPath = link.getAttribute('href');

      link.classList.remove('is-active');
      link.removeAttribute('aria-current');

      if (linkPath === currentPath || 
          (currentPath === '/' && linkPath === '/index.html') ||
          (currentPath === '/index.html' && linkPath === '/')) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      } else if (linkPath && linkPath !== '/' && linkPath !== '/index.html' && currentPath.indexOf(linkPath) === 0) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    }
  }

  function initCookieBanner() {
    if (window.__app.__cookieBannerInit) {
      return;
    }
    window.__app.__cookieBannerInit = true;

    var banner = document.querySelector('.c-cookie-banner');
    var acceptBtn = document.getElementById('acceptCookies');
    var declineBtn = document.getElementById('declineCookies');

    if (!banner) {
      return;
    }

    var cookieConsent = localStorage.getItem('cookieConsent');
    if (cookieConsent) {
      banner.style.display = 'none';
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.style.display = 'none';
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'declined');
        banner.style.display = 'none';
      });
    }
  }

  function initForms() {
    if (window.__app.__formsInit) {
      return;
    }
    window.__app.__formsInit = true;

    var toastContainer = document.createElement('div');
    toastContainer.className = 'position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);

    window.__app.notify = function(message, type) {
      type = type || 'info';
      var alertClass = 'alert-' + type;
      var toast = document.createElement('div');
      toast.className = 'alert ' + alertClass + ' alert-dismissible fade show';
      toast.setAttribute('role', 'alert');
      toast.innerHTML = message + '<button type="button" class="btn-close" aria-label="Close"></button>';
      toastContainer.appendChild(toast);

      var closeBtn = toast.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          toast.classList.remove('show');
          setTimeout(function() {
            if (toast.parentNode) {
              toastContainer.removeChild(toast);
            }
          }, 150);
        });
      }

      setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
          if (toast.parentNode) {
            toastContainer.removeChild(toast);
          }
        }, 150);
      }, 5000);
    };

    function validateEmail(email) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    function validatePhone(phone) {
      var re = /^[\d\s\+\-\(\)]{10,20}$/;
      return re.test(phone);
    }

    function validateName(name) {
      var re = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
      return re.test(name);
    }

    function validateMessage(message) {
      return message && message.length >= 10;
    }

    function showError(input, message) {
      input.classList.add('is-invalid');
      var feedback = input.parentElement.querySelector('.invalid-feedback');
      if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback d-block';
        input.parentElement.appendChild(feedback);
      }
      feedback.textContent = message;
      feedback.classList.add('d-block');
    }

    function clearError(input) {
      input.classList.remove('is-invalid');
      var feedback = input.parentElement.querySelector('.invalid-feedback');
      if (feedback) {
        feedback.classList.remove('d-block');
      }
    }

    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var nameInput = document.getElementById('contactName');
        var emailInput = document.getElementById('contactEmail');
        var phoneInput = document.getElementById('contactPhone');
        var subjectInput = document.getElementById('contactSubject');
        var messageInput = document.getElementById('contactMessage');
        var privacyInput = document.getElementById('contactPrivacy');

        var isValid = true;

        if (nameInput) {
          clearError(nameInput);
          if (!nameInput.value.trim()) {
            showError(nameInput, 'Bitte geben Sie Ihren Namen ein.');
            isValid = false;
          } else if (!validateName(nameInput.value.trim())) {
            showError(nameInput, 'Bitte geben Sie einen gültigen Namen ein.');
            isValid = false;
          }
        }

        if (emailInput) {
          clearError(emailInput);
          if (!emailInput.value.trim()) {
            showError(emailInput, 'Bitte geben Sie Ihre E-Mail-Adresse ein.');
            isValid = false;
          } else if (!validateEmail(emailInput.value.trim())) {
            showError(emailInput, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
            isValid = false;
          }
        }

        if (phoneInput && phoneInput.value.trim() && !validatePhone(phoneInput.value.trim())) {
          clearError(phoneInput);
          showError(phoneInput, 'Bitte geben Sie eine gültige Telefonnummer ein.');
          isValid = false;
        } else if (phoneInput) {
          clearError(phoneInput);
        }

        if (subjectInput) {
          clearError(subjectInput);
          if (!subjectInput.value.trim()) {
            showError(subjectInput, 'Bitte geben Sie einen Betreff ein.');
            isValid = false;
          }
        }

        if (messageInput) {
          clearError(messageInput);
          if (!validateMessage(messageInput.value.trim())) {
            showError(messageInput, 'Bitte geben Sie eine Nachricht mit mindestens 10 Zeichen ein.');
            isValid = false;
          }
        }

        if (privacyInput) {
          clearError(privacyInput);
          if (!privacyInput.checked) {
            showError(privacyInput, 'Bitte akzeptieren Sie die Datenschutzerklärung.');
            isValid = false;
          }
        }

        if (!isValid) {
          return;
        }

        var submitBtn = contactForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          var originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';

          setTimeout(function() {
            window.__app.notify('Ihre Nachricht wurde erfolgreich gesendet!', 'success');
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            setTimeout(function() {
              window.location.href = 'thank_you.html';
            }, 1000);
          }, 1500);
        }
      });
    }

    var careerForm = document.getElementById('careerForm');
    if (careerForm) {
      careerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var firstNameInput = document.getElementById('firstName');
        var lastNameInput = document.getElementById('lastName');
        var emailInput = document.getElementById('email');
        var phoneInput = document.getElementById('phone');
        var positionInput = document.getElementById('position');
        var messageInput = document.getElementById('message');
        var privacyInput = document.getElementById('privacy');

        var isValid = true;

        if (firstNameInput) {
          clearError(firstNameInput);
          if (!firstNameInput.value.trim()) {
            showError(firstNameInput, 'Bitte geben Sie Ihren Vornamen ein.');
            isValid = false;
          } else if (!validateName(firstNameInput.value.trim())) {
            showError(firstNameInput, 'Bitte geben Sie einen gültigen Vornamen ein.');
            isValid = false;
          }
        }

        if (lastNameInput) {
          clearError(lastNameInput);
          if (!lastNameInput.value.trim()) {
            showError(lastNameInput, 'Bitte geben Sie Ihren Nachnamen ein.');
            isValid = false;
          } else if (!validateName(lastNameInput.value.trim())) {
            showError(lastNameInput, 'Bitte geben Sie einen gültigen Nachnamen ein.');
            isValid = false;
          }
        }

        if (emailInput) {
          clearError(emailInput);
          if (!emailInput.value.trim()) {
            showError(emailInput, 'Bitte geben Sie Ihre E-Mail-Adresse ein.');
            isValid = false;
          } else if (!validateEmail(emailInput.value.trim())) {
            showError(emailInput, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
            isValid = false;
          }
        }

        if (phoneInput) {
          clearError(phoneInput);
          if (!phoneInput.value.trim()) {
            showError(phoneInput, 'Bitte geben Sie Ihre Telefonnummer ein.');
            isValid = false;
          } else if (!validatePhone(phoneInput.value.trim())) {
            showError(phoneInput, 'Bitte geben Sie eine gültige Telefonnummer ein.');
            isValid = false;
          }
        }

        if (positionInput) {
          clearError(positionInput);
          if (!positionInput.value) {
            showError(positionInput, 'Bitte wählen Sie eine Position aus.');
            isValid = false;
          }
        }

        if (messageInput) {
          clearError(messageInput);
          if (!validateMessage(messageInput.value.trim())) {
            showError(messageInput, 'Bitte geben Sie eine Nachricht mit mindestens 10 Zeichen ein.');
            isValid = false;
          }
        }

        if (privacyInput) {
          clearError(privacyInput);
          if (!privacyInput.checked) {
            showError(privacyInput, 'Bitte akzeptieren Sie die Datenschutzerklärung.');
            isValid = false;
          }
        }

        if (!isValid) {
          return;
        }

        var submitBtn = careerForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          var originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';

          setTimeout(function() {
            window.__app.notify('Ihre Bewerbung wurde erfolgreich eingereicht!', 'success');
            careerForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            setTimeout(function() {
              window.location.href = 'thank_you.html';
            }, 1000);
          }, 1500);
        }
      });
    }
  }

  function initImages() {
    if (window.__app.__imagesInit) {
      return;
    }
    window.__app.__imagesInit = true;

    var images = document.querySelectorAll('img');
    var placeholderSVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e9ecef" width="400" height="300"/%3E%3Ctext fill="%236c757d" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E';

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      if (!img.hasAttribute('loading') && 
          !img.classList.contains('c-logo__img') && 
          !img.hasAttribute('data-critical')) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function(e) {
        var failedImg = e.target;
        failedImg.src = placeholderSVG;
        failedImg.style.objectFit = 'contain';
      });
    }
  }

  function initHeaderScroll() {
    if (window.__app.__headerScrollInit) {
      return;
    }
    window.__app.__headerScrollInit = true;

    var header = document.querySelector('.l-header');
    if (!header) {
      return;
    }

    var scrollHandler = throttle(function() {
      if (window.pageYOffset > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }, 100);

    window.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler();
  }

  window.__app.init = function() {
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenu();
    initCookieBanner();
    initForms();
    initImages();
    initHeaderScroll();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.__app.init);
  } else {
    window.__app.init();
  }

})();

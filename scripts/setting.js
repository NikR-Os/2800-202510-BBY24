const themeToggleBtn = document.getElementById('themeBtn');
const bodyElement = document.body;
const navbar = document.getElementById('navbar');

themeToggleBtn.addEventListener('click', () => {
  bodyElement.classList.toggle('dark-mode');

  if (bodyElement.classList.contains('dark-mode')) {
    navbar.classList.remove('bg-body-tertiary');
    navbar.classList.add('bg-dark', 'navbar-dark');
  } else {
    navbar.classList.remove('bg-dark', 'navbar-dark');
    navbar.classList.add('bg-body-tertiary');
  }
});

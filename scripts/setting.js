const themeToggleBtn = document.getElementById('themeBtn');
const increaseFontToggleBtn = document.getElementById('increaseFontBtn');
const deceaseFontToggleBtn = document.getElementById('desceaseFontBtn');
const dropdownItems = document.querySelectorAll('.dropdown-item');
const dropdown = document.getElementsByClassName('dropdown');

const bodyElement = document.body;
const root = document.documentElement;
const navbar = document.getElementById('navbar');

let currentFontSize = 100;
let currentTheme = 'normal-mode';

function darkModeOn() {
    navbar.classList.remove('bg-body-tertiary');
    navbar.classList.add('navbar-dark');
    themeToggleBtn.classList.remove('btn-dark');
    themeToggleBtn.classList.add('btn-light')

    dropdown.classList.remove('light');
    dropdown.classList.add('dark');
}
function darkModeOff() {
    navbar.classList.remove('navbar-dark');
    navbar.classList.add('bg-body-tertiary');
    themeToggleBtn.classList.remove('btn-light');
    themeToggleBtn.classList.add('btn-dark');
    dropdown.classList.remove('dark');
    dropdown.classList.add('light');
}

// dark mode event listener
themeToggleBtn.addEventListener('click', () => {
    bodyElement.classList.toggle('dark-mode');
    bodyElement.classList.remove('protanopia', 'tritanopia', 'deuteranopia', 'normal-mode');

    if (bodyElement.classList.contains('dark-mode')) {
        darkModeOn();
    } else {
        darkModeOff();
    }
});

// font sizes
function applyFontSize() {
    root.style.fontSize = `${currentFontSize}%`;
    userSchema.fontSize = `${currentFontSize}%`;
}

increaseFontToggleBtn.addEventListener('click', () => {
    if (currentFontSize < 200) {
        currentFontSize += 10;
        applyFontSize();
    }
});

deceaseFontToggleBtn.addEventListener('click', () => {
    if (currentFontSize > 50) {
        currentFontSize -= 10;
        applyFontSize();
    }
});

// dropdown menu
dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
    e.preventDefault();

    dropdownItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    const mode = item.getAttribute('data-mode');

    bodyElement.classList.remove('protanopia', 'tritanopia', 'deuteranopia', 'normal-mode');
    navbar.classList.remove('protanopia', 'tritanopia', 'deuteranopia', 'normal-mode');
    switch (mode) {
    case 'protanopia':
        bodyElement.classList.add('protanopia');
        navbar.classList.add('protanopia');
        navbar.classList.remove('bg-body-tertiary');
        break;
    case 'tritanopia':
        bodyElement.classList.add('tritanopia');
        navbar.classList.add('tritanopia')
        navbar.classList.remove('bg-body-tertiary');
        break;
    case 'deuteranopia':
        bodyElement.classList.add('deuteranopia');
        navbar.classList.add('deuteranopia')
        navbar.classList.remove('bg-body-tertiary');
        break;
    case 'true':
    default:
        bodyElement.classList.add('normal-mode');
        break;
    }
    });
  });

app.get()
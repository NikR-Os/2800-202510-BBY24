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

// change styles to dark mode
function darkModeOn() {
    navbar.classList.remove('bg-body-tertiary');
    navbar.classList.add('navbar-dark');
    themeToggleBtn.classList.remove('btn-dark');
    themeToggleBtn.classList.add('btn-light')

    dropdown.classList.remove('light');
    dropdown.classList.add('dark');
}

// change styles to standard mode
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

// Increase Font button function 
increaseFontToggleBtn.addEventListener('click', () => {
    if (currentFontSize < 200) {
        currentFontSize += 10;
        applyFontSize();
    }
});

// Decease Font button function
deceaseFontToggleBtn.addEventListener('click', () => {
    if (currentFontSize > 50) {
        currentFontSize -= 10;
        applyFontSize();
    }
});
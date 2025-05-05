const themeToggleBtn = document.getElementById('themeBtn');
const increaseFontToggleBtn = document.getElementById('increaseFontBtn');
const deceaseFontToggleBtn = document.getElementById('desceaseFontBtn');

const bodyElement = document.body;
const root = document.documentElement;
const navbar = document.getElementById('navbar');

let currentFontSize = 100;
let darkmode = false;

// dark mode event listener
themeToggleBtn.addEventListener('click', () => {
    //toggle body dark-mode
    bodyElement.classList.toggle('dark-mode');
    if(darkmode){
        darkmode = false;
    } else {
        darkmode = true;
    }

    if (bodyElement.classList.contains('dark-mode')) {
        navbar.classList.remove('bg-body-tertiary');
        navbar.classList.add('bg-dark', 'navbar-dark');
    } else {
        navbar.classList.remove('bg-dark', 'navbar-dark');
        navbar.classList.add('bg-body-tertiary');
  }
});

function applyFontSize() {
    root.style.fontSize = `${currentFontSize}%`;
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
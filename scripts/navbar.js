// Configuration
const config = {
  navbarUrl: './navbar.html',
  placeholderId: 'navbarPlaceholder',
  animationDuration: 300
};

// Cache DOM elements
const dom = {
  placeholder: null,
  navbar: null,
  sidebar: null,
  overlay: null,
  toggle: null
};

// Main initialization function
async function initNavbar() {
  // dynamic loading 
  await loadNavbar();
  
  // Initialize sidebar functionality
  cacheDomElements();
  setupSidebar();
  
  // Set up event listeners
  setupEventListeners();
  
  // Handle initial responsive state
  handleResize();
}

// Dynamic navbar loader
async function loadNavbar() {
  try {
    const response = await fetch(config.navbarUrl);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const html = await response.text();
    dom.placeholder = document.getElementById(config.placeholderId);
    
    if (dom.placeholder) {
      dom.placeholder.innerHTML = html;
      return true;
    }
  } catch (error) {
    console.warn('Dynamic navbar load failed, using static version:', error);
    return false;
  }
}

// Cache DOM elements for sidebar functionality
function cacheDomElements() {
  dom.sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
  dom.overlay = document.querySelector('.overlay');
  dom.toggle = document.getElementById('sidebarToggle');
}

// Sidebar toggle functionality
function setupSidebar() {
  if (!dom.sidebar) return;
  
  // Initialize state
  dom.sidebar.style.transition = `left ${config.animationDuration}ms ease`;
  dom.sidebar.classList.remove('active'); //ensure it's closed initially

  // Initialize overlay state
  if (dom.overlay) {
    dom.overlay.style.display = 'none'; // Match CSS default
  }
}

// Event listeners setup
function setupEventListeners() {
  // Sidebar toggle
  if (dom.toggle) {
    dom.toggle.addEventListener('click', toggleSidebar);
  }
  
  // Overlay click
  if (dom.overlay) {
    dom.overlay.addEventListener('click', toggleSidebar);
  }
  
  // Nav link clicks (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth < 992 && e.target.closest('.nav-link')) {
      toggleSidebar();
    }
  });
  
   document.addEventListener('click', (e) => {
    // Check if sidebar is open and click is outside
    if (dom.sidebar.classList.contains('active') && 
        !e.target.closest('#sidebar') && 
        !e.target.closest('#sidebarToggle')) {
      toggleSidebar();
    }
  });

  // Handle navigation link clicks
document.addEventListener('click', function(e) {
  const profileLink = e.target.closest('.nav-link[data-link="profile"]');
  if (profileLink) {
    e.preventDefault();
    
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');
    const userName = sessionStorage.getItem('userName');
    
    if (!userId) {
      window.location.href = 'login.html';
      return;
    }
    
    // Ensure we have all required session data
    if (!userRole || !userName) {
      // If missing data, fetch from server
      fetch(`/profile/${userId}`)
        .then(response => response.json())
        .then(userData => {
          sessionStorage.setItem('userRole', userData.role || 'student');
          sessionStorage.setItem('userName', userData.name || 'User');
          redirectToProfile(userData.role);
        })
        .catch(() => {
          // Fallback if fetch fails
          redirectToProfile(userRole || 'student');
        });
    } else {
      redirectToProfile(userRole);
    }
    
    // Close sidebar if mobile
    if (window.innerWidth < 992) {
      toggleSidebar();
    }
  }
});

// Helper function for profile redirection
function redirectToProfile(role) {
  window.location.href = role === 'admin' 
    ? 'admin_profile.html' 
    : 'student_profile.html';
}
  // Window resize
  window.addEventListener('resize', handleResize);
}

// Toggle sidebar visibility
function toggleSidebar() {
  if (!dom.sidebar || !dom.overlay) return;
  
  const isOpening = !dom.sidebar.classList.contains('active');
  
  // Toggle sidebar
  dom.sidebar.classList.toggle('active');
  
  // Toggle overlay (using display to match your CSS)
  dom.overlay.style.display = isOpening ? 'block' : 'none';
  
  // Handle content shifting for desktop
  if (window.innerWidth >= 992 && dom.content) {
    dom.content.classList.toggle('shifted', isOpening);
  }
  
  // Handle body overflow for mobile
  if (window.innerWidth < 992) {
    document.body.style.overflow = isOpening ? 'hidden' : '';
  }
}

// Handle window resize
function handleResize() {
  if (!dom.sidebar) return;
  
  // Close sidebar when resizing to any size
  dom.sidebar.classList.remove('active');
  if (dom.overlay) {
    dom.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Toggle sidebar visibility to handle content shifting
function toggleSidebar() {
  if (!dom.sidebar || !dom.overlay) return;
  
  const isOpening = !dom.sidebar.classList.contains('active');
  
  dom.sidebar.classList.toggle('active');
  
  // Toggle content shifting for desktop
  if (window.innerWidth >= 992) {
    document.getElementById('content').classList.toggle('shifted', isOpening);
  }
  
  // Overlay only for mobile
  if (window.innerWidth < 992) {
    dom.overlay.classList.toggle('active');
    dom.overlay.style.transition = `opacity ${config.animationDuration}ms ease`;
    document.body.style.overflow = isOpening ? 'hidden' : '';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'complete') {
  initNavbar();
} else {
  document.addEventListener('DOMContentLoaded', initNavbar);
}

// Public API (if needed by other scripts)
window.navbar = {
  refresh: loadNavbar,
  toggle: toggleSidebar
};


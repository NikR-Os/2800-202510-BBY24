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

// update the username in the navbar
function updateNavbarUserInfo() {
  // get elements
  const usernameDisplay = document.getElementById('usernameDisplay');
  const userRoleDisplay = document.getElementById('userRoleDisplay');
  
  if (usernameDisplay && userRoleDisplay) {
    usernameDisplay.textContent = sessionStorage.getItem('userName') || 'Guest';
    userRoleDisplay.textContent = sessionStorage.getItem('userRole') || 'Visitor';
  }
}

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

   updateNavbarUserInfo(); // Just update the username and role in the navbar

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

  dom.sidebar.classList.remove('active');
  
  // Initialize state
  dom.sidebar.style.transition = `left ${config.animationDuration}ms ease`;
  
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
  })

  // Logout functionality
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const userId = sessionStorage.getItem('userId');
      
      try {
        const response = await fetch('/api/logout', {  // Changed to /api/logout
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          // Clear client-side session
          sessionStorage.clear();
          // Redirect to login page
          window.location.href = 'login.html';
        } else {
          console.error('Logout failed:', data.message);
          alert('Logout failed. Please try again.');
        }
      } catch (error) {
        console.error('Logout error:', error);
        alert('An error occurred during logout.');
      }
    });
  }

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
  
  dom.sidebar.classList.toggle('active');
  
  if (dom.overlay) {
    dom.overlay.classList.toggle('active');
    dom.overlay.style.transition = `opacity ${config.animationDuration}ms ease`;
  }
  
  document.body.style.overflow = isOpening ? 'hidden' : '';
}

// Handle window resize
function handleResize() {
  if (!dom.sidebar) return;

  // Close overlay when resizing to desktop
  if (window.innerWidth >= 992 && dom.overlay) {
    dom.overlay.classList.remove('active');
    document.body.style.overflow = '';
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


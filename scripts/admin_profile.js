document.addEventListener('DOMContentLoaded', () => {
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');
    
    if (!userId) {
      alert('Please login first');
      window.location.href = 'login.html';
      return;
    }
  
    if (userRole !== 'admin') {
      alert('You do not have admin privileges');
      window.location.href = 'student_profile.html'; 
      return;
    }
    
// DOM Elements
const profileForm = document.getElementById('profileForm');
const imageUpload = document.getElementById('imageUpload');
const addCourseBtn = document.getElementById('addCourseBtn');
const newCourseInput = document.getElementById('newCourse');
const coursesContainer = document.getElementById('coursesContainer');

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    try {
        // Load profile data
        fetch(`/profile/${userId}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load profile');
                return response.json();
            })
            .then(userData => {
                // Populate form fields
                document.getElementById('fullName').value = userData.name || '';
                document.getElementById('email').value = userData.email || '';
                document.getElementById('department').value = userData.department || '';
                document.getElementById('position').value = userData.position || 'Associate Professor';
                
                // Update displayed name
                document.getElementById('teacherName').textContent = userData.name || 'Admin';
                
                // Populate courses
                if (userData.courses && userData.courses.length > 0) {
                    coursesContainer.innerHTML = '';
                    userData.courses.forEach(course => {
                        const courseBadge = document.createElement('span');
                        courseBadge.className = 'course-badge';
                        courseBadge.innerHTML = `
                            ${course}
                            <span class="remove-course">×</span>
                        `;
                        coursesContainer.appendChild(courseBadge);
                    });
                }
            });

        // Set up remove course handlers for existing courses
        document.querySelectorAll('.remove-course').forEach(btn => {
            btn.addEventListener('click', function() {
                this.parentElement.remove();
            });
        });
    } catch (error) {
        console.error('Error loading profile:', error);
    }
});

// Image Upload Handler 
imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('profileImage').src = event.target.result;           
            // uploadProfileImage(file);
        };
        reader.readAsDataURL(file);
    }
});

// Course Management 
addCourseBtn.addEventListener('click', addCourse);

newCourseInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addCourse();
    }
});

function addCourse() {
    const courseCode = newCourseInput.value.trim();
    if (courseCode) {
        const courseBadge = document.createElement('span');
        courseBadge.className = 'course-badge';
        courseBadge.innerHTML = `
            ${courseCode}
            <span class="remove-course">×</span>
        `;
        
        // Add click handler to the new remove button
        courseBadge.querySelector('.remove-course').addEventListener('click', function() {
            this.parentElement.remove();
        });
        
        coursesContainer.appendChild(courseBadge);
        newCourseInput.value = '';
    }
}

// Form Submission Handler
profileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }
    
    // Get all courses
    const courses = Array.from(document.querySelectorAll('.course-badge'))
        .map(badge => badge.firstChild.textContent.trim());
    
    // Prepare form data
    const formData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        department: document.getElementById('department').value,
        position: document.getElementById('position').value,
        courses: courses
    };
    
    const saveBtn = profileForm.querySelector('.btn-save');
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...';
    saveBtn.disabled = true;
    
    // Send data to server
    fetch(`/profile/admin/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Update failed');
        return response.json();
    })
    .then(() => {
        saveBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Saved!';
        setTimeout(() => {
            saveBtn.innerHTML = '<i class="bi bi-save-fill me-2"></i> Save Profile';
            saveBtn.disabled = false;
        }, 1500);
    })
    .catch(error => {
        console.error('Error:', error);
        saveBtn.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i> Error';
        setTimeout(() => {
            saveBtn.innerHTML = '<i class="bi bi-save-fill me-2"></i> Save Profile';
            saveBtn.disabled = false;
        }, 1500);
    });
});

});
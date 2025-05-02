// DOM Elements
const profileForm = document.getElementById('profileForm');
const imageUpload = document.getElementById('imageUpload');
const addCourseBtn = document.getElementById('addCourseBtn');
const newCourseInput = document.getElementById('newCourse');
const coursesContainer = document.getElementById('coursesContainer');

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Set up remove course handlers for existing courses
    document.querySelectorAll('.remove-course').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });
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

// Form Submission
profileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
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
    
    // Simulate save action
    const saveBtn = profileForm.querySelector('.btn-save');
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...';
    saveBtn.disabled = true;
    
    setTimeout(() => {
        saveBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Saved!';
        setTimeout(() => {
            saveBtn.innerHTML = '<i class="bi bi-save-fill me-2"></i> Save Profile';
            saveBtn.disabled = false;
        }, 1500);
    }, 1000);
    
});

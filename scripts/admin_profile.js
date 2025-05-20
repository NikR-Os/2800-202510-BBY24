document.addEventListener('DOMContentLoaded', async () => {
    // 1. First get session data
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');

    // 2. Enhanced role verification
    if (!userId) {
        // No user ID at all - redirect to login
        window.location.href = 'login.html';
        return;
    }

    if (userRole !== 'admin') {
        // Non-admins should be redirected to their respective profiles
        window.location.href = userRole === 'student' ? 'student_profile.html' : 'login.html';
        return;
    }

    const profileForm = document.getElementById('profileForm');
    const imageUpload = document.getElementById('imageUpload');
    const addCourseBtn = document.getElementById('addCourseBtn');
    const newCourseInput = document.getElementById('newCourse');
    const coursesContainer = document.getElementById('coursesContainer');

    // 3. Image Upload Handler
    imageUpload.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) {
            alert('No file selected');
            return;
        }

        // File type validation
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg', 'image/avif'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
            return;
        }

        // File size validation (5MB limit)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('Image must be smaller than 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('profileImage').src = event.target.result;
        };
        reader.readAsDataURL(file);

        const imgUploadBtn = document.querySelector('.edit-photo-btn');
        const originalBtnContent = imgUploadBtn.innerHTML;
        imgUploadBtn.innerHTML = '<i class="bi bi-hourglass me-2"></i> Uploading...';
        imgUploadBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`/profile/${userId}/image`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Image upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            alert(`Failed to upload image: ${error.message}`);
        } finally {
            imgUploadBtn.innerHTML = originalBtnContent;
            imgUploadBtn.disabled = false;
        }
    });

    // 4. Load Profile Data
    try {
        const response = await fetch(`/profile/${userId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const userData = await response.json();
        
        // Verify response contains required data
        if (!userData || !userData.name) {
            throw new Error('Invalid profile data received');
        }

        // Populate form fields
        document.getElementById('fullName').value = userData.name || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('department').value = userData.department || '';
        document.getElementById('position').value = userData.position || 'Associate Professor';
        document.getElementById('teacherName').textContent = userData.name || 'Admin';

        // Load courses
        if (userData.courses && userData.courses.length > 0) {
            coursesContainer.innerHTML = '';
            userData.courses.forEach(course => {
                const courseBadge = document.createElement('span');
                courseBadge.className = 'course-badge';
                courseBadge.innerHTML = `${course} <span class="remove-course">×</span>`;
                coursesContainer.appendChild(courseBadge);
            });
        }

        // Load profile image if available
        try {
            const imgResponse = await fetch(`/profile/${userId}/image`);
            if (imgResponse.ok) {
                const blob = await imgResponse.blob();
                const newSrc = URL.createObjectURL(blob);
                const imgElement = document.getElementById('profileImage');
                const oldSrc = imgElement.src;
                imgElement.src = newSrc;
                if (oldSrc.startsWith('blob:')) {
                    URL.revokeObjectURL(oldSrc);
                }
            }
        } catch (imgError) {
            console.error('Error loading profile image:', imgError);
        }
    } catch (error) {
        console.error('Profile load error:', error);
        alert('Failed to load profile. Please try again.');
        return;
    }

    // Course management
    coursesContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-course')) {
            e.target.parentElement.remove();
        }
    });

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
            courseBadge.innerHTML = `${courseCode} <span class="remove-course">×</span>`;
            coursesContainer.appendChild(courseBadge);
            newCourseInput.value = '';
        }
    }

    // 5. Form Submission with feedback
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const saveBtn = profileForm.querySelector('.btn-save');
        try {
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...';
            saveBtn.disabled = true;

            const courses = Array.from(document.querySelectorAll('.course-badge'))
                .map(badge => badge.firstChild.textContent.trim());

            const formData = {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                department: document.getElementById('department').value,
                position: document.getElementById('position').value,
                courses: courses
            };

            const response = await fetch(`/profile/admin/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Update failed');
            }

            // Update UI on success
            document.getElementById('teacherName').textContent = formData.name;
            saveBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Saved!';
            
            // Update session name if changed
            if (formData.name !== sessionStorage.getItem('userName')) {
                sessionStorage.setItem('userName', formData.name);
            }

        } catch (error) {
            console.error('Save error:', error);
            saveBtn.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i> Error';
            alert(`Save failed: ${error.message}`);
        } finally {
            setTimeout(() => {
                saveBtn.innerHTML = '<i class="bi bi-save-fill me-2"></i> Save Profile';
                saveBtn.disabled = false;
            }, 1500);
        }
    });

    // 6. Delete Profile
// 1. This shows the confirmation modal when delete button is clicked
document.getElementById('deleteProfileBtn').addEventListener('click', () => {
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteProfileModal'));
  deleteModal.show();
});

// 2. This handles the actual deletion when user confirms
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  const deleteBtn = document.getElementById('confirmDeleteBtn');
  const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteProfileModal'));
  
  try {
    // Show loading state
    deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Deleting...';
    deleteBtn.disabled = true;

    const response = await fetch(`/profile/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}` // If using tokens
      }
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete profile');
    }

    // Clear session and redirect on success
    sessionStorage.clear();
    window.location.href = 'login.html';
    
  } catch (error) {
    console.error('Profile deletion error:', error);
    
    // Show error to user
    const errorMessage = error.message.includes('User not found') 
      ? 'Your account was not found in our system' 
      : `Deletion failed: ${error.message}`;
    
    alert(errorMessage);
    
    // Reset button state
    deleteBtn.innerHTML = 'Delete Profile';
    deleteBtn.disabled = false;
    
    // Keep modal open to allow retry
  }
});
});
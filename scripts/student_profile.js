document.addEventListener('DOMContentLoaded', async () => {
  // 1. First get session data
  const userId = sessionStorage.getItem('userId');
  const userRole = sessionStorage.getItem('userRole');

  // 2. Enhanced role verification
  if (!userId) {
    // No user ID at all - redirect to login
    window.location.href = '/login';
    return;
  }

  if (userRole === 'admin') {
    // Admins should be redirected to admin profile
    window.location.href = 'admin_profile.html';
    return;
  }

  // Set default role if missing (fallback to student)
  if (!userRole) {
    sessionStorage.setItem('userRole', 'student');
  }

  // 3. Image Upload Handler 
document.getElementById('imageUpload').addEventListener('change', async function(e) {
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
  reader.readAsDataURL(file); // Moved outside onload

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
    document.getElementById('fullName').value = userData.name;
    document.getElementById('email').value = userData.email || '';
    document.getElementById('program').value = userData.program || '';
    document.getElementById('year').value = userData.year || '2';
    document.getElementById('studentName').textContent = userData.name;

    // Update sessionStorage with any missing data
    if (!sessionStorage.getItem('userRole') && userData.role) {
      sessionStorage.setItem('userRole', userData.role);
    }

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
      alert('Failed to load profile image. Please try again.');
    }
  } catch (error) {
    console.error('Profile load error:', error);
    alert('Failed to load profile. Please try again.');
    return;
  }

  // 5. Form Submission with feedback
  document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const saveBtn = document.querySelector('.btn-save');
    try {
      saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...';
      saveBtn.disabled = true;

      const formData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        program: document.getElementById('program').value,
        year: document.getElementById('year').value
      };

      const response = await fetch(`/profile/student/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      // Update UI on success
      document.getElementById('studentName').textContent = formData.name;
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
  // Add this with your other event listeners
document.getElementById('deleteProfileBtn').addEventListener('click', () => {
  // Show confirmation modal
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteProfileModal'));
  deleteModal.show();
});

// 6. Delete Profile with confirmation
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  const deleteBtn = document.getElementById('confirmDeleteBtn');
  try {
    deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Deleting...';
    deleteBtn.disabled = true;

    const response = await fetch(`/profile/${userId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Deletion failed');
    }

    // Clear session and redirect
    sessionStorage.clear();
    window.location.href = '/login';
    
  } catch (error) {
    console.error('Profile deletion error:', error);
    alert(`Profile deletion failed: ${error.message}`);
    
    // Reset button state
    deleteBtn.innerHTML = 'Delete Profile';
    deleteBtn.disabled = false;
    
    // Hide modal
    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteProfileModal'));
    deleteModal.hide();
  }
});
});
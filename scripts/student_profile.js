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
  document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        document.getElementById('profileImage').src = event.target.result;
      };
      reader.readAsDataURL(file);
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
});
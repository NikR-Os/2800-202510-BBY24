document.addEventListener('DOMContentLoaded', () => {
    const userEmail = sessionStorage.getItem('userEmail');
    const userRole = sessionStorage.getItem('userRole');
    
    if (!userEmail) {
      alert('Please login first');
      window.location.href = 'login.html';
      return;
    }
        
    if (userRole !== 'student') {
        alert('This page is for students only');
        window.location.href = 'admin_profile.html';
        return;
    }

    // Image Upload Preview 
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

    // Load existing profile data
    fetch(`/profile/${userEmail}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load profile');
            return response.json();
        })
        .then(userData => {
            // Populate form fields
            document.getElementById('fullName').value = userData.name || '';
            document.getElementById('email').value = userData.email || '';
            document.getElementById('program').value = userData.program || '';
            document.getElementById('year').value = userData.year || '2';
            
            // Update displayed name
            document.getElementById('studentName').textContent = userData.name || 'Student';
        })
        .catch(error => {
            console.error('Error loading profile:', error);
        });

    // Form Submission Handler
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userEmail = sessionStorage.getItem('userEmail');
        if (!userEmail) {
            alert('Please login first');
            window.location.href = 'login.html';
            return;
        }
        
        // Get form data
        const formData = {
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            program: document.getElementById('program').value,
            year: document.getElementById('year').value
        };
        
        const saveBtn = document.querySelector('.btn-save');
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...';
        saveBtn.disabled = true;
        
        // Send data to server
        fetch(`/profile/student/${userEmail}`, {
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
            // Update displayed name
            document.getElementById('studentName').textContent = formData.name;
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
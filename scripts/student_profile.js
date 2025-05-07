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

// Form Submission
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        program: document.getElementById('program').value,
        year: document.getElementById('year').value
    };
    
    // Here you would normally send to your backend
    console.log('Saving profile:', formData);
    
    // Simulate save action
    const saveBtn = document.querySelector('.btn-save');
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
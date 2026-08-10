/* ============================================
   EduCoreX - Authentication JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Role Selection Logic
    const roleButtons = document.querySelectorAll('.role-btn');
    const roleInput = document.querySelector('#id_role');
    const studentFields = document.getElementById('student-fields');
    const mentorFields = document.getElementById('mentor-fields');
    const alumniFields = document.getElementById('alumni-fields');
    
    // Initialize - hide all role fields
    hideAllRoleFields();
    
    // Add click event to role buttons
    roleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedRole = this.getAttribute('data-role');
            
            // Update hidden input
            roleInput.value = selectedRole;
            
            // Update button states
            roleButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.remove('selected');
            });
            this.classList.add('active');
            this.classList.add('selected');
            
            // Show/hide role-specific fields
            hideAllRoleFields();
            showRoleFields(selectedRole);
            
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    function hideAllRoleFields() {
        if (studentFields) studentFields.style.display = 'none';
        if (mentorFields) mentorFields.style.display = 'none';
        if (alumniFields) alumniFields.style.display = 'none';
    }
    
    function showRoleFields(role) {
        switch(role) {
            case 'student':
                if (studentFields) {
                    studentFields.style.display = 'block';
                    // Focus first field
                    const firstInput = studentFields.querySelector('input');
                    if (firstInput) firstInput.focus();
                }
                break;
            case 'mentor':
                if (mentorFields) {
                    mentorFields.style.display = 'block';
                    const firstInput = mentorFields.querySelector('input');
                    if (firstInput) firstInput.focus();
                }
                break;
            case 'alumni':
                if (alumniFields) {
                    alumniFields.style.display = 'block';
                    const firstInput = alumniFields.querySelector('input');
                    if (firstInput) firstInput.focus();
                }
                break;
        }
    }
    
    // Form Validation Enhancement
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const role = roleInput.value;
            const password = document.getElementById('id_password')?.value;
            const confirmPassword = document.getElementById('id_confirm_password')?.value;
            
            // Validate role selection
            if (!role) {
                e.preventDefault();
                showError('Please select a role before submitting.');
                return;
            }
            
            // Validate password
            if (password && password.length < 8) {
                e.preventDefault();
                showError('Password must be at least 8 characters long.');
                return;
            }
            
            if (password !== confirmPassword) {
                e.preventDefault();
                showError('Passwords do not match.');
                return;
            }
            
            // Role-specific validation
            let isValid = true;
            let errorMessage = '';
            
            if (role === 'student') {
                const university = document.querySelector('#id_university')?.value;
                const department = document.querySelector('#id_department')?.value;
                
                if (!university || !department) {
                    isValid = false;
                    errorMessage = 'University and Department are required for students.';
                }
            }
            else if (role === 'mentor') {
                const expertise = document.querySelector('#id_expertise')?.value;
                const experience = document.querySelector('#id_experience_years')?.value;
                
                if (!expertise || !experience) {
                    isValid = false;
                    errorMessage = 'Expertise and Years of Experience are required for mentors.';
                }
            }
            else if (role === 'alumni') {
                const gradYear = document.querySelector('#id_grad_year')?.value;
                const company = document.querySelector('#id_current_company')?.value;
                
                if (!gradYear || !company) {
                    isValid = false;
                    errorMessage = 'Graduation Year and Current Company are required for alumni.';
                }
            }
            
            if (!isValid) {
                e.preventDefault();
                showError(errorMessage);
            }
        });
    }
    
    function showError(message) {
        // Create or update error display
        let errorDiv = document.querySelector('.form-errors');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'form-errors';
            const form = document.querySelector('.register-form');
            if (form) form.insertBefore(errorDiv, form.firstChild);
        }
        
        errorDiv.innerHTML = `<div class="error-message">${message}</div>`;
        errorDiv.style.display = 'block';
        
        // Scroll to error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Password strength indicator (optional enhancement)
    const passwordInput = document.getElementById('id_password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strength = checkPasswordStrength(this.value);
            updatePasswordStrengthIndicator(strength);
        });
    }
    
    function checkPasswordStrength(password) {
        if (!password) return 0;
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return strength;
    }
    
    function updatePasswordStrengthIndicator(strength) {
        let indicator = document.getElementById('password-strength');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'password-strength';
            indicator.className = 'password-strength';
            passwordInput.parentNode.appendChild(indicator);
        }
        
        const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        indicator.textContent = `Password Strength: ${levels[strength] || 'Very Weak'}`;
        indicator.className = `password-strength strength-${strength}`;
    }
    
    // Add CSS for password strength indicator
    const strengthCSS = `
        .password-strength {
            font-size: 0.85rem;
            margin-top: 0.5rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        .strength-0, .strength-1 { color: #ff6b6b; background: rgba(255, 107, 107, 0.1); }
        .strength-2, .strength-3 { color: #ffd166; background: rgba(255, 209, 102, 0.1); }
        .strength-4, .strength-5 { color: #00BFA6; background: rgba(0, 191, 166, 0.1); }
    `;
    
    const style = document.createElement('style');
    style.textContent = strengthCSS;
    document.head.appendChild(style);
});
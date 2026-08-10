/* ============================================
   EduCoreX - Interactive JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // 1. Mobile Menu Toggle
    // ============================================
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });

    // ============================================
    // 2. Header & Scroll Effects
    // ============================================
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // ============================================
    // 3. Role-Based Field Switching (Registration)
    // ============================================
    const roleSelect = document.getElementById('role');
    const sections = {
        'student': document.getElementById('student-fields'),
        'mentor': document.getElementById('mentor-fields'),
        'alumni': document.getElementById('alumni-fields')
    };

    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            const selectedRole = this.value.toLowerCase();
            
            // Hide all first
            Object.values(sections).forEach(sec => {
                if (sec) sec.style.display = 'none';
            });

            // Show the specific one
            if (sections[selectedRole]) {
                sections[selectedRole].style.display = 'block';
            }
        });
    }

    // ============================================
    // 4. Form Validation (Registration)
    // ============================================
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirmPassword').value;
            const role = roleSelect.value;

            if (!role) {
                e.preventDefault();
                alert("Please select a role!");
                return;
            }

            if (password.length < 8) {
                e.preventDefault();
                alert("Password must be at least 8 characters long!");
                return;
            }

            if (password !== confirm) {
                e.preventDefault();
                alert("Passwords do not match!");
                return;
            }
        });
    }

    // ============================================
    // 5. Animations & UI Logic
    // ============================================
    
    // Intersection Observer for Fade-ins
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .ai-content').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Button Ripple Effect
    document.querySelectorAll('.btn, .ai-button, .btn-register, .btn-login').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    console.log('%c🎓 EduCoreX Loaded Successfully!', 'color: #00BFA6; font-size: 16px; font-weight: bold;');
});

// ============================================
// Dashboard Sidebar Toggle
// ============================================

// Initialize sidebar toggle if on dashboard page
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const dashboardBody = document.querySelector('.dashboard-body');

if (sidebarToggle && sidebar) {
    
    // Mobile sidebar toggle
    sidebarToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggle = sidebarToggle.contains(event.target);
        
        if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
    
    // Close sidebar when clicking on a nav item (mobile)
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });
}

// ============================================
// Dashboard Progress Animation
// ============================================

// Animate progress bar on page load
const progressBar = document.querySelector('.progress-fill');
if (progressBar) {
    window.addEventListener('load', function() {
        const progress = progressBar.style.width;
        progressBar.style.width = '0%';
        setTimeout(() => {
            progressBar.style.width = progress;
        }, 300);
    });
}

// ============================================
// Dashboard Card Animations
// ============================================

// Animate cards on scroll
const dashboardCards = document.querySelectorAll('.dashboard-card');
if (dashboardCards.length > 0) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const cardObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, observerOptions);
    
    dashboardCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        cardObserver.observe(card);
    });
}

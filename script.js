// Mobile Navigation Toggle with Animation
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links li');

hamburger.addEventListener('click', () => {
    // Toggle navigation
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    
    // Animate hamburger to X
    hamburger.classList.toggle('active');
    
    // Animate nav items
    if (navLinks.style.display === 'flex') {
        navLinksItems.forEach((item, index) => {
            item.style.animation = `slideInRight 0.3s ease forwards ${index * 0.1}s`;
            item.style.opacity = '0';
        });
    }
});

// Scroll Animation
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .stat-item, .info-item');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Smooth Scrolling with Animation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
                hamburger.classList.remove('active');
            }
        }
    });
});

// Form Submission with Animation
const contactForm = document.getElementById('contact-form');
const messageContainer = document.getElementById('message-container');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Add loading animation to submit button
        const submitBtn = this.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Hide any previous messages
        messageContainer.style.display = 'none';
        
        try {
            // Get form data
            const formData = new FormData(this);

            // Submit to Netlify
            const response = await fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            });

            if (response.ok) {
                // Show success message
                messageContainer.textContent = 'Message sent successfully! We will get back to you soon.';
                messageContainer.className = 'message-container success';
                messageContainer.style.display = 'block';
                
                // Reset form
                this.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            messageContainer.textContent = 'Error sending message. Please try again later.';
            messageContainer.className = 'message-container error';
            messageContainer.style.display = 'block';
        } finally {
            // Reset button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            
            // Hide message after 5 seconds
            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 5000);
        }
    });
}

// Navbar Scroll Effect with Animation
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        return;
    }
    
    if (currentScroll > lastScroll) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
        navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    }
    
    lastScroll = currentScroll;
});

// Animate Stats on Scroll with Enhanced Animation
const stats = document.querySelectorAll('.stat-item h3');
let animated = false;

function animateStats() {
    if (animated) return;
    
    stats.forEach(stat => {
        const target = parseInt(stat.textContent);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                clearInterval(timer);
                current = target;
            }
            stat.textContent = Math.floor(current) + '+';
        }, 20);
    });
    
    animated = true;
}

// Intersection Observer for Stats Animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.about-stats');
if (statsSection) {
    observer.observe(statsSection);
}

// Enhanced Service Cards Animation
const serviceCards = document.querySelectorAll('.service-card');

serviceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
        card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
    });
});

// Add scroll event listener for animations
window.addEventListener('scroll', animateOnScroll);
// Initial check for elements in view
animateOnScroll();

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[name="contact"]');
    const messageContainer = document.getElementById('message-container');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    // Show success message
                    messageContainer.innerHTML = 'Thank you for your message! We will get back to you soon.';
                    messageContainer.className = 'message-container message-success';
                    form.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                // Show error message
                messageContainer.innerHTML = 'Sorry, there was a problem submitting your message. Please try again.';
                messageContainer.className = 'message-container message-error';
            }

            // Show the message
            messageContainer.style.display = 'block';

            // Hide the message after 5 seconds
            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 5000);
        });
    }

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}); 
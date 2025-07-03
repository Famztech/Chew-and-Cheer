// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initMenuFilter();
    initCart();
    initForms();
    initOrderForm();
    initContactForm();
    initAccessibility();
    initAnimations();
});

// Mobile Menu Functionality
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Toggle menu
            navMenu.classList.toggle('active');
            
            // Update ARIA attributes
            this.setAttribute('aria-expanded', !isExpanded);
            
            // Animate hamburger
            this.classList.toggle('active');
            
            // Manage focus
            if (!isExpanded) {
                // Focus first menu item when opening
                const firstMenuItem = navMenu.querySelector('.nav-link');
                if (firstMenuItem) {
                    setTimeout(() => firstMenuItem.focus(), 300);
                }
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.classList.remove('active');
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.focus();
            }
        });
    }
}

// Menu Filter Functionality
function initMenuFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuCategories = document.querySelectorAll('.menu-category');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            
            // Filter menu items
            if (filter === 'all') {
                menuCategories.forEach(category => {
                    category.style.display = 'block';
                    // Animate items
                    const items = category.querySelectorAll('.menu-item');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                });
            } else {
                menuCategories.forEach(category => {
                    const categoryType = category.getAttribute('data-category');
                    if (categoryType === filter) {
                        category.style.display = 'block';
                        // Animate items
                        const items = category.querySelectorAll('.menu-item');
                        items.forEach((item, index) => {
                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'translateY(0)';
                            }, index * 100);
                        });
                    } else {
                        category.style.display = 'none';
                    }
                });
            }
            
            // Announce filter change to screen readers
            announceToScreenReader(`Showing ${filter === 'all' ? 'all' : filter} items`);
        });
    });
}

// Cart Functionality
function initCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartSummary = document.querySelector('.cart-summary');
    const cartToggle = document.querySelector('.cart-toggle');
    const cartClose = document.querySelector('.cart-close');
    
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const menuItem = this.closest('.menu-item');
            const item = {
                id: Date.now(),
                name: menuItem.querySelector('h3').textContent,
                price: parseFloat(menuItem.querySelector('.menu-price').textContent.replace('D', '')),
                image: menuItem.querySelector('.menu-img').src,
                quantity: 1
            };
            
            // Check if item already exists
            const existingItem = cart.find(cartItem => cartItem.name === item.name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push(item);
            }
            
            updateCart();
            showCartNotification(item.name);
            
            // Provide feedback
            this.textContent = 'Added!';
            this.disabled = true;
            setTimeout(() => {
                this.textContent = 'Add to Cart';
                this.disabled = false;
            }, 2000);
        });
    });
    
    // Cart toggle
    if (cartToggle) {
        cartToggle.addEventListener('click', function() {
            cartSummary.classList.toggle('active');
            if (cartSummary.classList.contains('active')) {
                trapFocus(cartSummary);
            }
        });
    }
    
    // Cart close
    if (cartClose) {
        cartClose.addEventListener('click', function() {
            cartSummary.classList.remove('active');
            if (cartToggle) cartToggle.focus();
        });
    }
    
    // Update cart display
    function updateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartSummary();
        updateOrderSummary();
        
        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }
    
    function updateCartSummary() {
        const cartItems = document.querySelector('.cart-items');
        const cartTotal = document.querySelector('.cart-total');
        
        if (!cartItems) return;
        
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart" aria-hidden="true"></i>
                    <p>Your cart is empty</p>
                    <a href="menu.html" class="btn btn-primary">Browse Menu</a>
                </div>
            `;
            if (cartTotal) cartTotal.style.display = 'none';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>D${item.price.toFixed(2)} x ${item.quantity}</p>
                    </div>
                    <div class="item-controls">
                        <button class="quantity-btn minus" aria-label="Decrease quantity">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" aria-label="Increase quantity">+</button>
                        <button class="remove-item" aria-label="Remove ${item.name} from cart">
                            <i class="fas fa-trash" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (cartTotal) {
                cartTotal.innerHTML = `<strong>Total: D${total.toFixed(2)}</strong>`;
                cartTotal.style.display = 'block';
            }
            
            // Add event listeners for cart controls
            addCartControlListeners();
        }
    }
    
    function addCartControlListeners() {
        // Quantity controls
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const cartItem = this.closest('.cart-item');
                const itemId = parseInt(cartItem.dataset.id);
                const item = cart.find(item => item.id === itemId);
                
                if (this.classList.contains('plus')) {
                    item.quantity += 1;
                } else if (this.classList.contains('minus') && item.quantity > 1) {
                    item.quantity -= 1;
                }
                
                updateCart();
            });
        });
        
        // Remove item
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const cartItem = this.closest('.cart-item');
                const itemId = parseInt(cartItem.dataset.id);
                cart = cart.filter(item => item.id !== itemId);
                updateCart();
                announceToScreenReader('Item removed from cart');
            });
        });
    }
    
    function updateOrderSummary() {
        const summaryItems = document.getElementById('summary-items');
        const summaryTotals = document.getElementById('summary-totals');
        const subtotal = document.getElementById('subtotal');
        const deliveryFee = document.getElementById('delivery-fee');
        const tax = document.getElementById('tax');
        const finalTotal = document.getElementById('final-total');
        
        if (!summaryItems) return;
        
        if (cart.length === 0) {
            summaryItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart" aria-hidden="true"></i>
                    <p>Your cart is empty</p>
                    <a href="menu.html" class="btn btn-primary">Browse Menu</a>
                </div>
            `;
            if (summaryTotals) summaryTotals.style.display = 'none';
        } else {
            summaryItems.innerHTML = cart.map(item => `
                <div class="summary-item">
                    <span>${item.name} x${item.quantity}</span>
                    <span>D${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');
            
            const subtotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const deliveryFeeAmount = 3.99;
            const taxAmount = subtotalAmount * 0.08;
            const totalAmount = subtotalAmount + deliveryFeeAmount + taxAmount;
            
            if (subtotal) subtotal.textContent = `D${subtotalAmount.toFixed(2)}`;
            if (deliveryFee) deliveryFee.textContent = `D${deliveryFeeAmount.toFixed(2)}`;
            if (tax) tax.textContent = `D${taxAmount.toFixed(2)}`;
            if (finalTotal) finalTotal.textContent = `D${totalAmount.toFixed(2)}`;
            if (summaryTotals) summaryTotals.style.display = 'block';
        }
    }
    
    function showCartNotification(itemName) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            <span>${itemName} added to cart!</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
        
        announceToScreenReader(`${itemName} added to cart`);
    }
    
    // Initialize cart display
    updateCart();
}

// Form Validation and Handling
function initForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (isValid) {
                handleFormSubmission(this);
            } else {
                // Focus first invalid field
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.focus();
                    announceToScreenReader('Please correct the errors in the form');
                }
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    const errorElement = document.getElementById(`${field.id}-error`);
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(field)} is required`;
    }
    
    // Email validation
    else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    else if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    // Card number validation
    else if (fieldName === 'cardNumber' && value) {
        const cardRegex = /^[\d\s]{13,19}$/;
        if (!cardRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid card number';
        }
    }
    
    // Card expiry validation
    else if (fieldName === 'cardExpiry' && value) {
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter expiry date in MM/YY format';
        }
    }
    
    // CVV validation
    else if (fieldName === 'cardCvv' && value) {
        const cvvRegex = /^\d{3,4}$/;
        if (!cvvRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid CVV';
        }
    }
    
    // Update field appearance and error message
    if (isValid) {
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    } else {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        }
    }
    
    return isValid;
}

function getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent.replace('*', '').trim() : field.name;
}

// Order Form Specific Functionality
function initOrderForm() {
    const orderForm = document.getElementById('order-form');
    if (!orderForm) return;
    
    const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const deliveryFields = document.querySelector('.delivery-fields');
    const cardFields = document.querySelector('.card-fields');
    
    // Order type change
    orderTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'pickup') {
                deliveryFields.style.display = 'none';
                // Remove required attributes from delivery fields
                deliveryFields.querySelectorAll('input[required]').forEach(input => {
                    input.removeAttribute('required');
                });
            } else {
                deliveryFields.style.display = 'block';
                // Add required attributes back
                deliveryFields.querySelectorAll('input').forEach(input => {
                    if (input.name.includes('delivery')) {
                        input.setAttribute('required', '');
                    }
                });
            }
        });
    });
    
    // Payment method change
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'cash') {
                cardFields.style.display = 'none';
                // Remove required attributes from card fields
                cardFields.querySelectorAll('input[required]').forEach(input => {
                    input.removeAttribute('required');
                });
            } else {
                cardFields.style.display = 'block';
                // Add required attributes back
                cardFields.querySelectorAll('input').forEach(input => {
                    if (input.name.includes('card')) {
                        input.setAttribute('required', '');
                    }
                });
            }
        });
    });
    
    // Card number formatting
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '');
            let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
            this.value = formattedValue;
        });
    }
    
    // Card expiry formatting
    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }
}

// Contact Form Functionality
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleContactFormSubmission(this);
    });
}

function handleContactFormSubmission(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    // Simulate form submission
    setTimeout(() => {
        // Hide form and show success message
        form.style.display = 'none';
        
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            <h2>Message Sent Successfully!</h2>
            <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
            <button class="btn btn-primary" onclick="location.reload()">Send Another Message</button>
        `;
        
        form.parentNode.insertBefore(successMessage, form);
        
        // Announce success to screen readers
        announceToScreenReader('Your message has been sent successfully');
        
        // Focus the success message
        successMessage.focus();
        
    }, 2000);
}

function handleFormSubmission(form) {
    if (form.id === 'order-form') {
        handleOrderSubmission(form);
    } else if (form.id === 'contact-form') {
        handleContactFormSubmission(form);
    }
}

function handleOrderSubmission(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    btnText.style.opacity = '0';
    btnLoading.style.display = 'inline-block';
    
    // Simulate order processing
    setTimeout(() => {
        // Hide form and show success message
        form.style.display = 'none';
        
        const orderSuccess = document.getElementById('order-success');
        const orderNumber = document.getElementById('order-number');
        const estimatedDelivery = document.getElementById('estimated-delivery');
        
        // Generate order details
        const orderNum = 'ORD' + Date.now().toString().slice(-6);
        const deliveryTime = new Date();
        deliveryTime.setMinutes(deliveryTime.getMinutes() + 45);
        
        orderNumber.textContent = orderNum;
        estimatedDelivery.textContent = deliveryTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        orderSuccess.style.display = 'block';
        orderSuccess.focus();
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Announce success to screen readers
        announceToScreenReader(`Order placed successfully. Order number ${orderNum}`);
        
        // Scroll to success message
        orderSuccess.scrollIntoView({ behavior: 'smooth' });
        
    }, 3000);
}

// Accessibility Features
function initAccessibility() {
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Keyboard navigation for custom elements
    initKeyboardNavigation();
    
    // ARIA live region for announcements
    createAriaLiveRegion();
    
    // Focus management for modals and overlays
    initFocusManagement();
}

function initKeyboardNavigation() {
    // Menu items keyboard navigation
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const addBtn = item.querySelector('.add-to-cart');
        if (addBtn) {
            addBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        }
    });
    
    // Filter buttons keyboard navigation
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach((btn, index) => {
        btn.addEventListener('keydown', function(e) {
            let targetIndex;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    targetIndex = index > 0 ? index - 1 : filterBtns.length - 1;
                    filterBtns[targetIndex].focus();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    targetIndex = index < filterBtns.length - 1 ? index + 1 : 0;
                    filterBtns[targetIndex].focus();
                    break;
                case 'Home':
                    e.preventDefault();
                    filterBtns[0].focus();
                    break;
                case 'End':
                    e.preventDefault();
                    filterBtns[filterBtns.length - 1].focus();
                    break;
            }
        });
    });
}

function createAriaLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
}

function announceToScreenReader(message) {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

function initFocusManagement() {
    // Focus trap for cart summary
    const cartToggle = document.querySelector('.cart-toggle');
    if (cartToggle) {
        cartToggle.addEventListener('click', function() {
            cartSummary.classList.toggle('active');
            if (cartSummary.classList.contains('active')) {
                trapFocus(cartSummary);
            }
        });
    }
}

function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    });
    
    // Focus first element
    if (firstFocusable) {
        firstFocusable.focus();
    }
}

// Animation and Visual Effects
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.featured-item, .menu-item, .feature, .value-item, .team-member'
    );
    
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update focus for accessibility
                if (target.tabIndex < 0) {
                    target.tabIndex = -1;
                }
                target.focus();
            }
        });
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // Could send error to logging service
});

// Performance Monitoring
window.addEventListener('load', function() {
    // Monitor page load performance
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log('Page load time:', loadTime + 'ms');
    }
});

// Service Worker Registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Additional CSS for animations and notifications
const additionalStyles = `
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .cart-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .cart-notification.show {
        transform: translateX(0);
    }
    
    .cart-notification i {
        font-size: 1.2rem;
    }
    
    @media (max-width: 768px) {
        .cart-notification {
            right: 10px;
            left: 10px;
            transform: translateY(-100%);
        }
        
        .cart-notification.show {
            transform: translateY(0);
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateField,
        announceToScreenReader,
        trapFocus,
        debounce,
        throttle
    };
}

/* ==========================================================================
   FORM-VALIDATION.JS — Client-side form validation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.form[data-validate]').forEach(form => {

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Clear previous errors
      form.querySelectorAll('.form-error').forEach(err => {
        err.classList.remove('visible');
      });
      form.querySelectorAll('.error').forEach(input => {
        input.classList.remove('error');
      });

      // Validate required fields
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          showError(field, 'This field is required');
        }
      });

      // Validate email
      form.querySelectorAll('[type="email"]').forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
          isValid = false;
          showError(field, 'Please enter a valid email address');
        }
      });

      // Validate phone
      form.querySelectorAll('[type="tel"]').forEach(field => {
        if (field.value && !isValidPhone(field.value)) {
          isValid = false;
          showError(field, 'Please enter a valid phone number');
        }
      });

      if (isValid) {
        // Show success message
        const successMsg = form.closest('section')?.querySelector('.form-success');
        if (successMsg) {
          form.style.display = 'none';
          successMsg.classList.add('visible');
        }

        // In production, you would submit the form data here
        console.log('Form submitted:', new FormData(form));
      }
    });

    // Real-time validation on blur
    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => {
        clearError(field);

        if (field.required && !field.value.trim()) {
          showError(field, 'This field is required');
        } else if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
          showError(field, 'Please enter a valid email address');
        }
      });

      // Clear error on input
      field.addEventListener('input', () => {
        clearError(field);
      });
    });
  });

  function showError(field, message) {
    field.classList.add('error');
    const errorEl = field.parentElement.querySelector('.form-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearError(field) {
    field.classList.remove('error');
    const errorEl = field.parentElement.querySelector('.form-error');
    if (errorEl) {
      errorEl.classList.remove('visible');
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    return /^[\d\s\-+()]{7,}$/.test(phone);
  }

});

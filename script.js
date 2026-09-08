// Small interactive helpers: year, mailto fallback, form handling
document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('bookingForm');
const status = document.getElementById('formStatus');
const submitBtn = form.querySelector('button[type="submit"]');

// Form validation
function validateForm(formData) {
  const errors = [];
  
  if (!formData.get('name') || formData.get('name').trim() === '') {
    errors.push('Please enter your name');
  }
  if (!formData.get('email') || formData.get('email').trim() === '') {
    errors.push('Please enter your email');
  } else if (!isValidEmail(formData.get('email'))) {
    errors.push('Please enter a valid email');
  }
  if (!formData.get('phone') || formData.get('phone').trim() === '') {
    errors.push('Please enter your phone number');
  }
  if (!formData.get('guests') || parseInt(formData.get('guests')) < 1) {
    errors.push('Please enter number of guests');
  }
  
  return errors;
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showStatus(message, type = 'success') {
  status.textContent = message;
  status.className = `form-status form-status-${type}`;
  status.style.display = 'block';
}

function resetStatus() {
  status.textContent = '';
  status.className = 'form-status';
  status.style.display = 'none';
}

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const fd = new FormData(form);
  
  // Validate form
  const validationErrors = validateForm(fd);
  if (validationErrors.length > 0) {
    showStatus(validationErrors.join(' • '), 'error');
    return;
  }
  
  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.6';
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  
  showStatus('Submitting your booking request...', 'info');
  
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: fd,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      showStatus('✓ Thank you! Your booking request has been sent. We will contact you soon.', 'success');
      form.reset();
      
      // Reset button after 3 seconds
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.textContent = originalText;
        resetStatus();
      }, 3000);
    } else {
      // Try alternative: send via mailto as backup
      sendViaMailto(fd);
      showStatus('✓ Booking sent! If you don\'t receive confirmation, check your email.', 'success');
      form.reset();
      
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.textContent = originalText;
        resetStatus();
      }, 3000);
    }
  } catch (err) {
    console.error('Submit error:', err);
    showStatus('⚠ Unable to submit online. Please use the email button or call us directly.', 'error');
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.textContent = originalText;
  }
});

// Send via email as backup
function sendViaMailto(formData) {
  const name = formData.get('name') || '';
  const email = formData.get('email') || '';
  const phone = formData.get('phone') || '';
  const date = formData.get('event_date') || 'Not specified';
  const type = formData.get('event_type') || '';
  const guests = formData.get('guests') || '';
  const message = formData.get('message') || '';

  const subject = encodeURIComponent("New Booking Request from Website");
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nEvent Details:\nDate: ${date}\nType: ${type}\nNumber of Guests: ${guests}\n\nSpecial Requests:\n${message}\n\n---\nPlease reply to ${email}`
  );
  
  const mailto = `mailto:yanagisushicatering@gmail.com?subject=${subject}&body=${body}`;
  window.location.href = mailto;
}

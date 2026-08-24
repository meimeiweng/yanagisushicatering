// Small interactive helpers: year, mailto fallback, minimal form handling
document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('bookingForm');
const status = document.getElementById('formStatus');
const mailtoBtn = document.getElementById('mailtoFallback');

mailtoBtn.addEventListener('click', () => {
  // Build mailto with form values as fallback
  const fd = new FormData(form);
  const name = fd.get('name') || '';
  const email = fd.get('email') || '';
  const phone = fd.get('phone') || '';
  const date = fd.get('event_date') || '';
  const type = fd.get('event_type') || '';
  const guests = fd.get('guests') || '';
  const message = fd.get('message') || '';

  const subject = encodeURIComponent("Booking request from website");
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nEvent date: ${date}\nEvent type: ${type}\nGuests: ${guests}\n\nMessage:\n${message}`
  );
  const mailto = `mailto:yanagisushicatering@gmail.com?subject=${subject}&body=${body}`;
  window.location.href = mailto;
});

// Optional AJAX attempt to FormSubmit; if it fails, we leave the regular submit (it opens in a new tab due to target="_blank")
form.addEventListener('submit', (e) => {
  status.textContent = 'Submitting...';
  // Try to send via fetch to FormSubmit to keep user on page. This may fail due to CORS — in that case the form will still submit in a new tab.
  e.preventDefault();
  const action = form.action;
  const fd = new FormData(form);

  fetch(action, {
    method: 'POST',
    body: fd,
    headers: {
      'Accept': 'application/json'
    },
    mode: 'cors'
  }).then(response => {
    if (response.ok) {
      status.textContent = 'Thank you — your booking request was sent.';
      form.reset();
    } else {
      // Fallback: open the form in a new tab (the form element has target="_blank")
      status.textContent = 'Submitted via fallback — if you do not receive a confirmation, try the Email button.';
      form.submit();
    }
  }).catch(err => {
    // Likely CORS or network issue — use form submit (opens new tab) to ensure email is sent by the form service
    console.error('Fetch submit failed:', err);
    status.textContent = 'Network fallback: opening email form in a new tab.';
    form.submit();
  });
});

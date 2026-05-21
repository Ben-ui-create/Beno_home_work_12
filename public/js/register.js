console.log('Register SCRIPT')

const registrationForm = document.querySelector('#registrationForm');

if (registrationForm) {
  registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document
      .querySelectorAll('.error-msg')
      .forEach((span) => span.textContent = '');

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      console.log(result)

      if (!response.ok && result.errors) {
        for (const [field, errorMessage] of Object.entries(result.errors)) {
          const errorSpan = document.querySelector(`[data-error="${field}"]`);
          if (errorSpan) {
            errorSpan.textContent = errorMessage;
          }
        }
      } else if (response.ok) {
        alert('Registration successful!');
        window.location.href = '/users/login';
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  });
}
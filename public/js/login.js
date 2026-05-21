console.log('Login SCRIPT initialized');

const loginForm = document.querySelector('#loginForm');
const generalErrorDiv = document.querySelector('#generalError');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelectorAll('.error-msg').forEach((span) => {
      span.textContent = '';
    });

    if (generalErrorDiv) {
      generalErrorDiv.textContent = '';
    }

    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      console.log(result);

      if (!response.ok) {
        if (result.errors) {
          for (const [field, message] of Object.entries(result.errors)) {
            const errorSpan = document.querySelector(
              `[data-error="${field}"]`
            );

            if (errorSpan) {
              errorSpan.textContent = message;
            }
          }
        }

        if (result.message && generalErrorDiv) {
          generalErrorDiv.textContent = result.message;
        }

        return;
      }

      localStorage.setItem('token', result.token);

      localStorage.setItem(
        'userDate',
        JSON.stringify(result.user)
      );

      window.location.href = '/';

    } catch (error) {
      console.error('Login error:', error);

      if (generalErrorDiv) {
        generalErrorDiv.textContent =
          'Network error. Please try again.';
      }
    }
  });
}
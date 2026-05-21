const user = JSON.parse(localStorage.getItem('userDate'));
const token = localStorage.getItem('token');

console.log(user);

const userInfo = document.querySelector('#user_info');

if (!token) {
  window.location.href = '/users/login';
}


if (userInfo) {
  for (const [key, value] of Object.entries(user)) {
    const span = document.createElement('span');
    const br = document.createElement('br');

    span.innerHTML = `
    <div class="container">
    <div class="key">${key}:</div>
    <div class="value">${value}</div>
    </div>`;

    userInfo.append(span);
    userInfo.append(br);
  }
}




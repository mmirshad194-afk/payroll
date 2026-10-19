function toggleUserDropdown() {

  const dropdown = document.querySelector('.user-dropdown');
  dropdown.classList.toggle('show');

}

function logout() {

  localStorage.removeItem("loggedIn");
  window.location.replace("login.html");

}

window.addEventListener('click', function(e) {

  const dropdown = document.querySelector('.user-dropdown');
  const userLogo = document.querySelector('.user-logo');

  if (!dropdown.contains(e.target) && e.target !== userLogo) {

    dropdown.classList.remove('show');

  }

});
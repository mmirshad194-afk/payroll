document
  .getElementById("loginForm")
  .addEventListener("submit", loginUser);

async function loginUser(event) {

  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    const response = await fetch("http://localhost:5000/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (response.ok) {

      alert("Login Successful ✅");

      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userEmail", data.user.email);

      window.location.href = "dashboard.html";

    } else {

      alert(data.message);

    }

  } catch (error) {

    console.log(error);
    alert("Server Error ❌");

  }

}
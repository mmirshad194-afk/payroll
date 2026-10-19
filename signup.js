// signup.js

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    // Get values
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const batch = document.getElementById("batch").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Validation
    if (!name || !phone || !batch || !email || !password || !confirmPassword) {
        alert("Please fill all fields");
        return;
    }

    // Password check
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {

        const response = await fetch("http://localhost:8000/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                phone,
                batch,
                email,
                password
            })
        });

        const data = await response.json();

        console.log("SERVER RESPONSE =>", data);

        // Success
        if (response.ok) {

            alert("Signup Successful");

            // Redirect to login page
            window.location.href = "login.html";

        } else {

            alert(data.error || "Signup Failed");

        }

    } catch (error) {

        console.log("FETCH ERROR =>", error);

        alert("Server Error");

    }

});
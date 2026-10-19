// reset-password.js

async function resetPassword() {

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const message = document.getElementById("message");

    // email from forgot password page
    const email = localStorage.getItem("resetEmail");

    if (!newPassword || !confirmPassword) {

        message.style.color = "red";
        message.innerHTML = "Please fill all fields";
        return;
    }

    if (newPassword !== confirmPassword) {

        message.style.color = "red";
        message.innerHTML = "Passwords do not match";
        return;
    }

    try {

        const response = await fetch("http://localhost:8000/reset-password", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                newPassword
            })

        });

        const data = await response.json();

        if (response.ok) {

            message.style.color = "green";
            message.innerHTML = data.message;

            // clear saved email
            localStorage.removeItem("resetEmail");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } else {

            message.style.color = "red";
            message.innerHTML = data.message;
        }

    } catch (error) {

        console.log(error);

        message.style.color = "red";
        message.innerHTML = "Server error";
    }
}
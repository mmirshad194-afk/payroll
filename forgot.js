// forgot.js

async function sendOTP() {

    const email = document.getElementById("email").value;
    const message = document.getElementById("message");

    if (!email) {
        message.innerHTML = "Please enter email";
        return;
    }

    try {

        const response = await fetch("http://localhost:8000/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {

            message.style.color = "green";
            message.innerHTML = data.message;

            // email save
            localStorage.setItem("resetEmail", email);

            // redirect
            setTimeout(() => {
                window.location.href = "verifyotp.html";
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
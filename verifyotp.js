// verify-otp.js

async function verifyOTP() {

    const otp = document.getElementById("otp").value;
    const message = document.getElementById("message");

    // saved email from forgot password page
    const email = localStorage.getItem("resetEmail");

    if (!otp) {
        message.style.color = "red";
        message.innerHTML = "Please enter OTP";
        return;
    }

    try {

        const response = await fetch("http://localhost:8000/verify-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                otp
            })
        });

        const data = await response.json();

        if (response.ok) {

            message.style.color = "green";
            message.innerHTML = data.message;

            setTimeout(() => {
                window.location.href = "resetpassword.html";
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
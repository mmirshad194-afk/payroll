const params =
new URLSearchParams(window.location.search);

const id = params.get("id");

async function loadPayslip() {

    try {

        const response = await fetch(
            `http://localhost:5000/pay/payslip/${id}`
        );

        const data = await response.json();

        document.getElementById("employee_id").innerText =
            data.employee_id;

        document.getElementById("month_year").innerText =
            data.month_year;

        document.getElementById("gross_salary").innerText =
            data.gross_salary;

        document.getElementById("leave_deduction").innerText =
            data.leave_deduction;

        document.getElementById("other_deductions").innerText =
            data.other_deductions;

        document.getElementById("total_deductions").innerText =
            data.total_deductions;

        document.getElementById("net_salary").innerText =
            data.net_salary;

    }
    catch (error) {

        console.log(error);

        alert("Failed to load payslip");
    }
}

loadPayslip();
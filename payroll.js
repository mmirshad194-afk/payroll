const API = "http://localhost:5000/pay";

/* =========================
   SHOW FORM
========================= */

function showPayrollForm() {

  const form = document.getElementById("payrollForm");

  if (
    form.style.display === "none" ||
    form.style.display === ""
  ) {
    form.style.display = "block";
  } else {
    form.style.display = "none";
  }
}

/* =========================
   OPEN PAYSLIP
========================= */

function viewPayslip(id) {

  window.location.href =
    `payslip.html?id=${id}`;
}

/* =========================
   LOAD PAYROLL
========================= */

async function loadPayroll() {

  try {

    const response =
      await fetch(`${API}/payroll`);

    const data =
      await response.json();

    const tbody =
      document.getElementById("payrollBody");

    tbody.innerHTML = "";

    data.forEach(item => {

  tbody.innerHTML += `
  <tr>

    <td>${item.employee_id}</td>

    <td>${item.month_year}</td>

    <td>${item.gross_salary}</td>

    <td>${item.total_deductions}</td>

    <td>${item.net_salary}</td>

    <td>
      <button class="save-btn"
      onclick="viewPayslip(${item.payroll_id})">
        View Payslip
      </button>
    </td>

    <td>
      <button class="save-btn"
      onclick="sendPayslip(
        '${item.email || ""}',
        '${item.employee_id}',
        '${item.month_year}',
        '${item.net_salary}'
      )">
        Send Email
      </button>
    </td>

    <td>
      <i class="fa-solid fa-trash delete-btn"
      onclick="deletePayroll(${item.payroll_id})">
      </i>
    </td>

  </tr>
  `;
});

     
  } catch (err) {

    console.log(err);

    alert("Failed to load payroll");
  }
}


async function sendPayslip(
  employee_email,
  employee_id,
  month_year,
  net_salary
) {

  if (!employee_email) {
    alert("Employee email not found");
    return;
  }

  try {

    const response = await fetch(
      `${API}/send-payslip`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          employee_email,
          employee_id,
          month_year,
          net_salary
        })
      }
    );

    const result = await response.json();

    alert(result.msg);

  } catch (err) {

    console.log(err);

    alert("Failed to send email");
  }
}

/* =========================
   GENERATE PAYROLL
========================= */

async function generatePayroll() {

  const employee_id =
    document.getElementById("employee_id").value;

  const month_year =
    document.getElementById("month_year").value;

  if (!employee_id || !month_year) {

    alert("Fill all fields");
    return;
  }

  try {

    const response =
      await fetch(`${API}/add`, {

        method: "POST",

        headers: {
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({
          employee_id,
          month_year
        })
      });

    const result =
      await response.json();

    alert(result.msg);

    loadPayroll();

    document.getElementById("employee_id").value = "";
    document.getElementById("month_year").value = "";

  } catch (err) {

    console.log(err);

    alert("Payroll generation failed");
  }
}

/* =========================
   DELETE PAYROLL
========================= */

async function deletePayroll(id) {

  if (!confirm("Delete payroll?"))
    return;

  try {

    const response =
      await fetch(
        `${API}/payroll/delete/${id}`,
        {
          method: "DELETE"
        }
      );

    const result =
      await response.json();

    alert(result.msg);

    loadPayroll();

  } catch (err) {

    console.log(err);

    alert("Delete failed");
  }
}

/* =========================
   PAGE LOAD
========================= */

window.onload = () => {

  loadPayroll();
};
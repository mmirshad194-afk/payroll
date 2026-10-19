const API = "http://localhost:5000/deduc";

console.log("deduction.js loaded");

/* =========================
   SHOW FORM
========================= */

function showForm() {

  const form =
    document.getElementById("deductionForm");

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
   LOAD DEDUCTIONS
========================= */

async function loadDeductions() {

  try {

    const response = await fetch(
      `${API}/read/all`
    );

    const data = await response.json();

    const tbody =
      document.getElementById(
        "deductionBody"
      );

    tbody.innerHTML = "";

    data.forEach(item => {

      tbody.innerHTML += `

        <tr>

          <td>${item.employee_id}</td>

          <td>${item.pf}</td>

          <td>${item.esi}</td>

          <td>${item.professional_tax}</td>

          <td>${item.loan_deduction}</td>

          <td>${item.month_year}</td>

          <td class="action-cell">

            <div class="action-icons">

              <i class="fa-solid fa-trash delete-btn"
              onclick="deleteDeduction(${item.deduction_id})">
              </i>

            </div>

          </td>

        </tr>

      `;
    });

  } catch (error) {

    console.log(error);

    alert("Failed to load deductions");
  }
}

/* =========================
   ADD DEDUCTION
========================= */

async function addDeduction() {

  const data = {

    employee_id:
      document.getElementById("employee_id").value,

    pf:
      document.getElementById("pf").value,

    esi:
      document.getElementById("esi").value,

    professional_tax:
      document.getElementById("professional_tax").value,

    loan_deduction:
      document.getElementById("loan_deduction").value,

    month_year:
      document.getElementById("month_year").value
  };

  try {

    const response = await fetch(
      `${API}/insert`,
      {
        method: "POST",

        headers: {
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify(data)
      }
    );

    const result =
      await response.json();

    alert(result.message);

    document.getElementById("employee_id").value = "";
    document.getElementById("pf").value = "";
    document.getElementById("esi").value = "";
    document.getElementById("professional_tax").value = "";
    document.getElementById("loan_deduction").value = "";
    document.getElementById("month_year").value = "";

    loadDeductions();

  } catch (error) {

    console.log(error);

    alert("Failed to add deduction");
  }
}

/* =========================
   DELETE DEDUCTION
========================= */

async function deleteDeduction(id) {

  if (!confirm("Delete deduction?"))
    return;

  try {

    const response = await fetch(
      `${API}/delete/${id}`,
      {
        method: "DELETE"
      }
    );

    const result =
      await response.json();

    alert(result.message);

    loadDeductions();

  } catch (error) {

    console.log(error);

    alert("Delete failed");
  }
}

/* =========================
   PAGE LOAD
========================= */

window.onload = () => {

  loadDeductions();
};
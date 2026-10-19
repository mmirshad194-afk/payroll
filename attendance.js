const API = "http://localhost:5000/att";

let editId = null;



function showForm() {
  const form = document.getElementById("attendanceForm");

  if (
    form.style.display === "none" ||
    form.style.display === ""
  ) {
    form.style.display = "block";
  } else {
    form.style.display = "none";
  }
}



async function loadAttendance() {
  try {
    const response = await fetch(`${API}/attendance`);

    const data = await response.json();

    const tbody = document.querySelector(
      "#attendanceTable tbody"
    );

    tbody.innerHTML = "";

    data.forEach((item) => {

      
      const attendancePercent = (
        (item.present_days /
          item.total_working_days) * 100
      ).toFixed(0);

      tbody.innerHTML += `
        <tr>
          <td>${item.employee_id}</td>
          <td>${item.month_year}</td>
          <td>${item.total_working_days}</td>
          <td>${item.present_days}</td>
          <td>${item.leave_days}</td>
          <td>${attendancePercent}%</td>

          <td class="action-cell">
            <div class="action-icons">

              <i class="fa-solid fa-pen edit-btn"
              onclick="editAttendance(${item.attendance_id}, '${item.employee_id}', '${item.month_year}', ${item.total_working_days}, ${item.present_days}, ${item.late_count})">
              </i>

              <i class="fa-solid fa-trash delete-btn"
              onclick="deleteAttendance(${item.attendance_id})">
              </i>

            </div>
          </td>
        </tr>
      `;
    });

  } catch (error) {
    console.log(error);
    alert("Failed to load attendance");
  }
}


async function addAttendance() {

  const employee_id =
    document.getElementById("employee_id").value;

  const month_year =
    document.getElementById("month_year").value;

  const total_working_days =
    document.getElementById("total_working_days").value;

  const present_days =
    document.getElementById("present_days").value;

  const late_count =
    document.getElementById("late_count").value;


  if (
    !employee_id ||
    !month_year ||
    !total_working_days ||
    !present_days ||
    late_count === ""
  ) {
    alert("Please fill all fields");
    return;
  }

  const attendanceData = {
    employee_id,
    month_year,
    total_working_days,
    present_days,
    late_count
  };

  try {

    let response;

    if (editId) {

      response = await fetch(
        `${API}/attendance/update/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(attendanceData)
        }
      );

    } else {

      response = await fetch(`${API}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(attendanceData)
      });
    }

    const result = await response.json();

    if (!response.ok) {
      alert(result.msg || "Error");
      return;
    }

    alert(result.msg);

    clearForm();

    loadAttendance();

  } catch (error) {

    console.log(error);
    alert("Server error");
  }
}



function editAttendance(
  attendance_id,
  employee_id,
  month_year,
  total_working_days,
  present_days,
  late_count
) {

  editId = attendance_id;

  document.getElementById("employee_id").value = employee_id;

  document.getElementById("month_year").value = month_year;

  document.getElementById("total_working_days").value = total_working_days;

  document.getElementById("present_days").value = present_days;

  document.getElementById("late_count").value = late_count;

  document.querySelector(".save-btn").innerText =
    "Update Attendance";

  document.getElementById("attendanceForm").style.display =
    "block";
}



async function deleteAttendance(id) {

  const confirmDelete = confirm(
    "Are you sure want to delete?"
  );

  if (!confirmDelete) {
    return;
  }

  try {

    const response = await fetch(
      `${API}/attendance/delete/${id}`,
      {
        method: "DELETE"
      }
    );

    const result = await response.json();

    alert(result.msg);

    loadAttendance();

  } catch (error) {

    console.log(error);
    alert("Delete failed");
  }
}


function clearForm() {

  editId = null;

  document.getElementById("employee_id").value = "";

  document.getElementById("month_year").value = "";

  document.getElementById("total_working_days").value = "";

  document.getElementById("present_days").value = "";

  document.getElementById("late_count").value = "";

  document.querySelector(".save-btn").innerText =
    "Save Attendance";
}



window.onload = () => {
  loadAttendance();
};

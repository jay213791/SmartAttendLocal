let allStudents = [];
let filteredStudents = [];
let currentPage = 1;
const studentsPerPage = 7;

const params = new URLSearchParams(window.location.search);
const cardId = params.get("id");

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup", () => {

    const searchValue = searchInput.value.toLowerCase();

    filteredStudents = allStudents.filter(student =>
        student.name.toLowerCase().includes(searchValue) ||
        student.email.toLowerCase().includes(searchValue) ||
        student.studentNumber.toString().includes(searchValue) ||
        student.sex.toLowerCase().includes(searchValue)
    );
    currentPage = 1;

    renderStudent();
    renderPaginationForStudents();
});

function sendTheQrToAllStudents() {
    Swal.fire({
        title: "Send QR To All Student",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true,
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes"
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "QR codes are being sent to all students...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

          try {
              const response = await fetch(`/students/${cardId}/send-qrForAll`, {
                  method: "POST"
              });

              const data = await response.text();

              if (response.ok) {
                  Swal.fire({
                      icon: "success",
                      title: "Success!",
                      text:  data,
                      allowOutsideClick: false,
                      timer: 1500,
                      showConfirmButton: false,
                  });
              } else {
                  Swal.fire({
                      icon: "error",
                      title: "can't send QR",
                      text:  data,
                      allowOutsideClick: false,
                      timer: 1500,
                      showConfirmButton: false,
                  });
              }
          } catch (error) {
              Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "Error adding student:" + error,
              });
          }
        }
    });
}

function OpenScanner(){
    window.location.href = `/../body/scanner.html?id=${cardId}`;
}

function openAddStudentModal(){
    document.getElementById("addStudentModal").style.display="block";
}

function closeAddStudentModal() {
    document.getElementById("addStudentModal").style.display="none";
}

document.getElementById("studentForm").addEventListener("submit", function (e){
    e.preventDefault();
    StudentForm();
});

async function StudentForm(){
    const form = document.getElementById("studentForm");
    const name = document.getElementById("StudentName").value;
    const student_Number= document.getElementById("StudentNumber").value;
    const studentEmail = document.getElementById("StudentEmail").value;
    const studentGender = document.getElementById("StudentGender").value;

    if (!name || !student_Number || !studentEmail || !studentGender) {
        Swal.fire({
            icon: 'warning',
            title: "Missing Fields",
            text: "Please fill up fields.",
        });
        return;
    }

    if (!validStudentnumber(student_Number)){
        Swal.fire({
            icon: 'error',
            title: "Input Failed",
            text: "Please numbers only.",
        });
        return;
    }

    try{
        const response = await fetch(`/students/${cardId}/add`, {
            method: "POST",
            headers:{
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                studentNumber: student_Number,
                email: studentEmail,
                sex: studentGender,
            })
        });

        if(response.ok){
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Student Added!",
                allowOutsideClick: false,
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
               document.getElementById("addStudentModal").style.display="none";
            });
            form.reset();

            loadStudent(cardId);
        } else {
            const errorMessage = await response.text();

            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: errorMessage,
            });
        }

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error adding student:" + error,
        });
    }

}

function validStudentnumber(student_Number) {
    const studentNumberPattern = /^[0-9]+$/;
    return studentNumberPattern.test(student_Number);
}

window.onload = loadStudent;

async function loadStudent() {

    try {
        const response = await fetch(`/students/${cardId}/students`, {
           method: "GET",
        });

        allStudents = await response.json();

        filteredStudents = [...allStudents];

        renderStudent();
        renderPaginationForStudents();
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error adding student:" + error,
        });
    }
}

function renderStudent() {
    const studentTRContainer = document.getElementById("studentTable");
    studentTRContainer.innerHTML = "";

    const start = (currentPage - 1) * studentsPerPage;
    const end = start + studentsPerPage;

    const pageStudent = filteredStudents.slice(start,end);

    pageStudent.forEach((student, index) => {

        const studentsElements = document.createElement("tr");

        studentsElements.innerHTML = `
           <td>${start + index + 1}</td>
           <td>${student.name}</td>
           <td>${student.studentNumber}</td>
           <td>${student.email}</td>
           <td>${student.sex}</td>
           <td class="btn-container">
              <button class="send-qr-btn" onclick="sendQR(${student.id})">Send QR</button>
              <button class="menu-btn">⋮</button>       
             <div class="menu-dropdown">
               <div onclick="renameName(${student.id}, '${student.name}')">Name</div>
               <div onclick="renameStudentNumber(${student.id}, '${student.studentNumber}')">Student Number</div>
               <div onclick="changeEmail(${student.id}, '${student.email}')">Email</div>
               <div onclick="changeGender(${student.id}, '${student.sex}')">Gender</div>
               <div onclick="deleteStudent(${student.id})">Delete</div>
             </div>  
           </td>
           
      
        `;
        studentTRContainer.appendChild(studentsElements);
    });
}

function renderPaginationForStudents() {

    const pagination = document.querySelector(".pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(allStudents.length / studentsPerPage);

    for (let i = 1; i <= totalPages; i++) {

        const btn = document.createElement("button");

        btn.classList.add("page-btn");
        btn.textContent = i;

        if (i === currentPage) {
            btn.classList.add("active");
        }

        btn.onclick = () => {
            currentPage = i;
            renderStudent();
            renderPaginationForStudents();
        }
        pagination.appendChild(btn);
    }
}

 async function sendQR(id, studentEmail) {

     Swal.fire({
         title: "Sending QR CODE...",
         allowOutsideClick: false,
         didOpen: () => {
             Swal.showLoading();
         }
     });

    try{
      const response = await fetch(`/students/${id}/send-qr`, {
            method: "POST",
            headers:{
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: studentEmail,
            })
        });


        if (response.ok) {
            Swal.fire({
                icon: "success",
                title: "Success",
                allowOutsideClick: false,
                text: "Send QR Successfully!",
                timer: 1500,
                showConfirmButton: false,
            });
        } else {
            const data = await response.text();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error sending QR" + data,
            });
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error sending QR " + error,
        });
    }
}

document.addEventListener("click", function(e){
    if(e.target.classList.contains("menu-btn")){
        const menu = e.target.nextElementSibling;
        menu.style.display = menu.style.display === "flex" ? "none" : "flex";
    } else {
        document.querySelectorAll(".menu-dropdown").forEach(menu=>{
            menu.style.display = "none";
        });
    }
});

function renameName(id, currentName){

    Swal.fire({
        title: "Rename Name",
        input: "text",
        inputValue: currentName,
        showCancelButton: true
    }).then((result) => {

        if(result.isConfirmed){

            fetch(`/students/${id}`,{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    name: result.value
                })
            })
                .then(response=>response.json())
                .then(data=>{
                    Swal.fire({
                        icon: "success",
                        title: "Rename Name",
                        text: "Name updated successfully",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                });

        }
    });
}

function renameStudentNumber(id, currentStudentNumber){

    Swal.fire({
        title: "Rename Student Number",
        input: "text",
        inputValue: currentStudentNumber,
        showCancelButton: true
    }).then((result) => {

        if (result.isConfirmed) {
            fetch(`/students/${id}`,{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    studentNumber: result.value
                })
            })
                .then(response=>response.json())
                .then(data=>{
                    Swal.fire({
                        icon: "success",
                        title: "Rename Student Number",
                        text: "Student Number updated successfully",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                });

        }

    });
}

function changeEmail(id, currentEmail){
    Swal.fire({
        title: "Rename Email",
        input: "text",
        inputValue: currentEmail,
        showCancelButton: true
    }).then((result) => {

        if (result.isConfirmed) {
            fetch(`/students/${id}`,{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    email: result.value
                })
            })
                .then(response=>response.json())
                .then(data=>{
                    Swal.fire({
                        icon: "success",
                        title: "Rename Email",
                        text: "Email updated successfully",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                });
        }
    });
}

function changeGender(id, currentGender){
    Swal.fire({
        title: "Rename Gender",
        input: "select",
        inputOptions: {
            Male: "Male",
            Female: "Female"
        },
        inputValue: currentGender,
        showCancelButton: true
    }).then((result) => {

        if (result.isConfirmed) {
            fetch(`/students/${id}`,{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    sex: result.value
                })
            })
                .then(response=>response.json())
                .then(data=>{
                    Swal.fire({
                        icon: "success",
                        title: "Rename Gender",
                        text: "Gender updated successfully",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                });
        }
    });
}

function deleteStudent(id) {
    Swal.fire({
        title: "Delete Student",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it"
    }).then(result => {

        if(result.isConfirmed) {
            fetch(`/students/delete/${id}`,{
                method:"DELETE"
            })
                .then(response => {
                    if (response.ok) {

                        Swal.fire({
                            icon: "success",
                            title: "Student has been deleted.",
                            text: "successfully deleted.",
                            timer: 1000,
                            showConfirmButton: false
                        }).then(() => {
                            loadStudent();
                        });
                    } else {
                        Swal.fire(
                            "Error",
                            "Could not delete card.",
                            "error"
                        );
                    }

                });
        }

    });
}
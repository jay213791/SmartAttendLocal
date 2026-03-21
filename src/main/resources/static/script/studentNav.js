// GLOBAL VARIABLES PARA SA CARDS PAGINATION//
let allCards = [];
let filteredCards = [];
let currentPage = 1;
const cardsPerPage = 12;


const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup", function () {

    const searchValue = searchInput.value.toLowerCase();

    filteredCards = allCards.filter(card =>
        card.name.toLowerCase().includes(searchValue) ||
        card.subjectName.toLowerCase().includes(searchValue)
    );
    currentPage = 1;

    renderCards();
    renderPagination();
});

function openAddSectionModal(){
    document.getElementById("addSectionModal").style.display="block";
}

function closeAddSectionModal(){
    document.getElementById("addSectionModal").style.display="none";
}

document.getElementById("studentSectionForm").addEventListener("submit", function (e){
    e.preventDefault();
    sectionForm();
});

async function sectionForm(){
    const form = document.getElementById("studentSectionForm");
    const sectionName = document.getElementById("SectionName").value;
    const subjectName = document.getElementById("SubjectName").value;
    const startTime = document.getElementById("StartTime").value;
    const endTime = document.getElementById("EndTime").value;
    const classDays = [...document.querySelectorAll('.add-day-cb:checked')].map(c => c.value).join(',');

    if (!sectionName || !subjectName || !startTime || !endTime || !classDays) {
        Swal.fire({
            icon: 'warning',
            title: "Missing Fields",
            text: "Please fill in all fields and select at least one class day",
        });
        return;
    }

    try{
        const response = await fetch(`/cards/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: sectionName,
                subjectName: subjectName,
                startTime: startTime + ":00",
                endTime: endTime + ":00",
                classDays: classDays,
            })
        });

        if (response.ok) {
            Swal.fire({
                icon: "success",
                title: "Card Added",
                text: "Section created successfully",
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                document.getElementById("addSectionModal").style.display = "none";
            });
            form.reset();

            loadCards();
        } else {
            const errorMessage = await response.text();

            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: errorMessage,
            });
        }

    } catch (error){
        console.error("Error adding card:", error);
    }

}

window.onload = loadCards;

async function loadCards(){

    try{
        const response = await fetch(`/cards/my-cards`, {
            method: "GET"
        });

        allCards = await response.json();

        filteredCards = [...allCards];

        renderCards();
        renderPagination();

    } catch (error) {
        console.error("Error adding card:", error);
    }
}

function renderCards(){

    const cardsContainer = document.getElementById("cardsContainer");
    cardsContainer.innerHTML = "";

    const start = (currentPage - 1) * cardsPerPage;
    const end = start + cardsPerPage;

    const pageCards = filteredCards.slice(start,end);

    // must delete the console para lang toh sa see the logics //
    console.log("Current page:", currentPage);
    console.log("Start index:", start);
    console.log("End index:", end);
    console.log("Cards shown:", pageCards);

    pageCards.forEach(card => {

        const cardsElement = document.createElement("div");

        cardsElement.classList.add("card-box");

        const fmt = t => t ? t.slice(0, 5).replace(/^(\d+):(\d+)/, (_, h, m) => {
            const hr = +h % 12 || 12;
            return `${hr}:${m} ${+h < 12 ? 'AM' : 'PM'}`;
        }) : '--';

        const daysHtml = card.classDays
            ? card.classDays.split(',').map(d =>
                `<span class="day-chip">${d}</span>`
              ).join('')
            : '<span class="day-chip day-chip--none">No days set</span>';

        cardsElement.innerHTML = `

            <div class="card-header">
                <button class="menu-btn">⋮</button>

                <div class="menu-dropdown">
                    <div onclick="renameSection(${card.id}, '${card.name}')">Rename Section</div>
                    <div onclick="renameSubject(${card.id}, '${card.subjectName}')">Rename Subject</div>
                    <div onclick="setSchedule(${card.id})">Set Schedule</div>
                    <div onclick="deleteCard(${card.id})">Delete</div>
                </div>
            </div>

            <div class="card-body">
                <span class="subject-name">${card.name}</span>
                <p>${card.subjectName}</p>
                <div class="card-time">
                    <i class="fa-regular fa-clock"></i>
                    ${fmt(card.startTime)} &ndash; ${fmt(card.endTime)}
                </div>
                <div class="card-days">${daysHtml}</div>
            </div>

        `;

        const cardBody = cardsElement.querySelector(".card-body");
        cardBody.addEventListener("click", (e) => {
             window.location.href = `/../body/studentTable.html?id=${card.id}`;
        });

        cardsContainer.appendChild(cardsElement);


    });

}

function renderPagination(){

    const pagination = document.querySelector(".pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(allCards.length / cardsPerPage);

    for(let i=1;i<=totalPages;i++){

        const btn = document.createElement("button");

        btn.classList.add("page-btn");
        btn.textContent = i;

        if(i === currentPage){
            btn.classList.add("active");
        }

        btn.onclick = () => {
            currentPage = i;
            renderCards();
            renderPagination();
        };

        pagination.appendChild(btn);

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

function renameSection(id, currentName){

    Swal.fire({
        title: "Rename Section",
        input: "text",
        inputValue: currentName,
        showCancelButton: true
    }).then((result)=>{

        if(result.isConfirmed){

            fetch(`/cards/${id}`,{
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
                        title: "Rename Section",
                        text: "Section updated successfully",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                });

        }

    });

}


function renameSubject(id, currentSubjectName){

    Swal.fire({
        title: "Rename Subject",
        input: "text",
        inputValue: currentSubjectName,
        showCancelButton: true
    }).then((result)=>{

        if(result.isConfirmed){

            fetch(`/cards/${id}`,{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    subjectName: result.value
                })
            })
                .then(response=>response.json())
                .then(data=>{
                    Swal.fire({
                        icon: "success",
                        title: "Rename Subject",
                        text: "Subject updated successfully",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                });

        }

    });

}

function setSchedule(id) {
    Swal.fire({
        title: "Set Schedule",
        html:
            `<label>Start Time</label><br>
             <input type="time" id="swal-start" class="swal2-input"><br>
             <label>End Time</label><br>
             <input type="time" id="swal-end" class="swal2-input"><br><br>
             <label style="font-weight:600">Class Days</label><br>
             <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px">
               ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d =>
                 `<label style="display:flex;align-items:center;gap:4px;font-size:13px">
                    <input type="checkbox" class="day-cb" value="${d}"> ${d}
                  </label>`
               ).join('')}
             </div>`,
        showCancelButton: true,
        preConfirm: () => {
            const start = document.getElementById("swal-start").value;
            const end   = document.getElementById("swal-end").value;
            const days  = [...document.querySelectorAll('.day-cb:checked')].map(c => c.value).join(',');
            if (!start || !end) {
                Swal.showValidationMessage("Please fill in both times");
                return false;
            }
            if (!days) {
                Swal.showValidationMessage("Please select at least one class day");
                return false;
            }
            return { startTime: start + ":00", endTime: end + ":00", classDays: days };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/cards/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result.value)
            })
                .then(response => response.json())
                .then(() => {
                    Swal.fire({
                        icon: "success",
                        title: "Schedule Updated",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => loadCards());
                });
        }
    });
}

function deleteCard(id){

    Swal.fire({
        title: "Delete this card?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it"
    }).then((result)=>{

        if(result.isConfirmed){

            fetch(`/cards/delete/${id}`,{
                method:"DELETE"
            })
                .then(response=>{
                    if(response.ok){

                        Swal.fire({
                            icon: "success",
                            title: "Card has been deleted.",
                            text: "success",
                            timer: 1000,
                            showConfirmButton: false
                        }).then(() => {
                            loadCards();
                        });

                    }else{
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
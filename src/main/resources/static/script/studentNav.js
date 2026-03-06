function openAddStudentModal(){
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
    const sectionName = document.getElementById("SectionName").value;
    const subjectName = document.getElementById("SubjectName").value;

    if (!sectionName || !subjectName) {
        Swal.fire({
            icon: 'warning',
            title: "Missing Fields",
            text: "Please section email and subject",
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

            loadCards();
        }

    } catch (error){
        console.error("Error adding card:", error);
    }

}

window.onload = loadCards;

async function loadCards(){
    const cardsContainer = document.getElementById("cardsContainer");


    try{
        const response = await fetch(`/cards/my-cards`, {
            method: "GET"
        });

        const cards = await response.json();

        cardsContainer.innerHTML = "";

        cards.forEach(card => {
            const cardsElement = document.createElement("div");

            cardsElement.classList.add("card-box");

            cardsElement.innerHTML =  `

                 <div class="card-header">
                 
                  </div>
                 
                 <div class="card-body">
                      <span>${card.name}</span>
                      <p>${card.subjectName}</p>
                 </div>
            `;
            cardsContainer.appendChild(cardsElement);
        });
    } catch (error) {
        console.error("Error adding card:", error);
    }
}
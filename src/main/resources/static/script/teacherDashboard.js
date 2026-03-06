function logoutFunction(){
    document.getElementById("LogoutModal").style.display = "block";
}

function LogoutBtn(){
    fetch("/logout", {
        method: "POST",
        credentials: "include"
    }).then(() => {
        window.location.href = "/body/login.html";
    });
}

function closeLogoutModal(){
    document.getElementById("LogoutModal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function(){
    fetch(`/students/count/my-students`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("studentCount").innerHTML = data;
        })
        .catch(error => console.log("error: ", error));
});
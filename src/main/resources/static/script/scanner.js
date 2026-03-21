const params = new URLSearchParams(window.location.search);
const cardId = params.get("id");

const beep = new Audio("../assets/beepsmooth.wav");
const error = new Audio("../assets/error.wav");

function studentTable() {
    window.location.href = `/../body/studentTable.html?id=${cardId}`;
}

window.onload = () => {
    loadStudent();
    setDateRange();
    scheduleDailyUpdate();

    document.getElementById("searchInput").addEventListener("input", filterTable);
    document.querySelector(".search-btn").addEventListener("click", filterTable);
};

function filterTable() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#studentTable tr");
    rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(query) ? "" : "none";
    });
}

let html5QrcodeScanner = null;
let isRunning = false;

function openCamera() {
    if (isRunning) {
        html5QrcodeScanner.stop().then(() => {
            html5QrcodeScanner = null;
            isRunning = false;
            const reader = document.getElementById("reader");
            reader.innerHTML = `
                <div class="camera-icon"><i class="fa-solid fa-camera"></i></div>
                <p class="webcam-text">Live Webcam - Point QR code here</p>
            `;
            reader.onclick = openCamera;
        }).catch(err => console.error("Stop failed", err));
        return;
    }

    let isProcessing = false;

    async function scanQR(qrCode) {
        try {
            const response = await fetch("/attendance/scan", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    qrcode: qrCode,
                    cardId: cardId,
                })
            });

            const result = await response.text();

            if (response.ok) {
                beep.volume = 1.0;
                beep.play();
                Swal.fire({
                    icon: "success",
                    title: "Scanned",
                    text: result,
                }).then(() => {
                    loadStudent();
                });
            } else {
                error.play();
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: result,
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                title: "Error",
                text: "unable to connect to the server" + err.message,
            });
        }
    }

    function onScanSuccess(decodedText) {

        if (isProcessing) return;

        isProcessing = true;

        scanQR(decodedText);

        setTimeout(() => {
            isProcessing = false;
        }, 3000); // 2 seconds delay
    }

    function onScanFailure(error) {
        // optional: ignore failed scan attempts
    }

    html5QrcodeScanner = new Html5Qrcode("reader");
    html5QrcodeScanner.start(
        {facingMode: "environment"},
        {fps: 10, qrbox: 450},
        onScanSuccess,
        onScanFailure
    ).then(() => {
        isRunning = true;
    }).catch(err => console.error("Camera start failed", err));
}

async function loadStudent() {

    try {
        const response = await fetch(`/attendance/scanned/${cardId}`, {
            method: "GET",
        });

        const data = await response.json();

        const studentTRContainer = document.getElementById("studentTable");
        studentTRContainer.innerHTML = "";

        data.forEach((student, index) => {

            const studentsElements = document.createElement("tr");

            studentsElements.innerHTML = `
           <td>${index + 1}</td>
           <td>${student.name}</td>
           <td>${student.studentNumber}</td>
           <td>${student.email}</td>
           <td>${new Date(student.time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
           <td>${student.status}</td>
        `;
            studentTRContainer.appendChild(studentsElements);
        });

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error adding student:" + error,
        });
    }
}

async function exportReport(format) {
    toggleExportMenu();
    try {
        if (format === 'csv') {
            const response = await fetch(`/attendance/report/${cardId}`);
            const data = await response.json();
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const rows = [
                ["ID", "Name", "Student Number", "Email", "Time", "Status"],
                ...data.map((s, i) => [
                    i + 1, s.name, s.studentNumber, s.email,
                    s.time ? new Date(s.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-",
                    s.status
                ])
            ];
            const csv = rows.map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
            const blob = new Blob([`Attendance Report - ${today}\n\n` + csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `attendance_report_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            const response = await fetch(`/attendance/report/${cardId}`);
            const data = await response.json();
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            const rowH = 36, headerH = 60, colW = [40, 200, 150, 260, 100, 100];
            const totalW = colW.reduce((a, b) => a + b, 0) + 40;
            const totalH = headerH + 44 + (data.length + 1) * rowH + 30;
            const pad = 20;

            const canvas = document.createElement('canvas');
            canvas.width = totalW;
            canvas.height = totalH;
            const ctx = canvas.getContext('2d');

            // background
            ctx.fillStyle = '#f4f8fb';
            ctx.fillRect(0, 0, totalW, totalH);

            // header bar
            ctx.fillStyle = '#0F6577';
            ctx.fillRect(0, 0, totalW, headerH);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px Poppins, sans-serif';
            ctx.fillText('SmartAttend - Attendance Report', pad, 28);
            ctx.font = '13px Poppins, sans-serif';
            ctx.fillText(today, pad, 48);

            // table background
            ctx.fillStyle = '#ffffff';
            ctx.roundRect(pad, headerH + 12, totalW - pad * 2, (data.length + 1) * rowH + rowH + 10, 10);
            ctx.fill();

            const cols = ['ID', 'Name', 'Student Number', 'Email', 'Time', 'Status'];
            let y = headerH + 12;

            // table header row
            ctx.fillStyle = '#222a35';
            ctx.fillRect(pad, y, totalW - pad * 2, rowH);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px Poppins, sans-serif';
            let x = pad + 10;
            cols.forEach((col, i) => { ctx.fillText(col, x, y + 23); x += colW[i]; });
            y += rowH;

            // data rows
            ctx.font = '12px Poppins, sans-serif';
            data.forEach((s, idx) => {
                ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f6f8fb';
                ctx.fillRect(pad, y, totalW - pad * 2, rowH);

                const statusColor = s.status === 'Present' ? '#16a34a' : s.status === 'Late' ? '#d97706' : '#dc2626';
                const cells = [
                    String(idx + 1), s.name, s.studentNumber, s.email,
                    s.time ? new Date(s.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                    s.status
                ];
                x = pad + 10;
                cells.forEach((cell, i) => {
                    ctx.fillStyle = i === 5 ? statusColor : '#1c2a3b';
                    if (i === 5) ctx.font = 'bold 12px Poppins, sans-serif';
                    ctx.fillText(cell, x, y + 23);
                    ctx.font = '12px Poppins, sans-serif';
                    x += colW[i];
                });
                y += rowH;
            });

            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = `attendance_report_${new Date().toISOString().slice(0, 10)}.png`;
            a.click();
        }
    } catch (err) {
        Swal.fire({ icon: "error", title: "Export Failed", text: err.message });
    }
}

function toggleExportMenu() {
    document.getElementById('exportMenu').classList.toggle('show');
}

function getPHTime() {
    return new Date(new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila"
    }));
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

function setDateRange() {
    const today = getPHTime();
    const end = new Date(today);

    end.setDate(today.getDate() + 10); // example: 10-day range

    document.getElementById("dateNow").textContent =
        `${formatDate(today)} - ${formatDate(end)}`;
}


function scheduleDailyUpdate() {
    const now = getPHTime();

    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    const timeUntilMidnight = nextMidnight - now;

    setTimeout(() => {
        setDateRange();
        setInterval(setDateRange, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
}


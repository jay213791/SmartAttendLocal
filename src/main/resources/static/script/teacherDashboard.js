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

function formatTime(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatLocalTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(+h, +m, 0);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function loadSchedule() {
    fetch('/cards/today-schedule')
        .then(r => r.json())
        .then(cards => {
            const list = document.getElementById('scheduleList');
            const dayEl = document.getElementById('scheduleDay');
            dayEl.textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

            if (!cards.length) {
                list.innerHTML = '<li class="schedule-empty">No classes scheduled today.</li>';
                return;
            }

            list.innerHTML = cards.map(c => {
                const timeRange = (c.startTime && c.endTime)
                    ? `${formatLocalTime(c.startTime)} – ${formatLocalTime(c.endTime)}`
                    : 'Time not set';
                const statusLabel = { ongoing: 'Ongoing', upcoming: 'Upcoming', done: 'Done', scheduled: 'Scheduled' }[c.status] || '';
                return `<li class="schedule-item">
                    <div class="schedule-info">
                        <span class="schedule-subject">${c.subject}</span>
                        <span class="schedule-time">${timeRange}</span>
                    </div>
                    <span class="schedule-badge ${c.status}">${statusLabel}</span>
                </li>`;
            }).join('');
        })
        .catch(err => console.error('Schedule error:', err));
}

function loadTodayStats() {
    fetch('/attendance/today-stats')
        .then(r => r.json())
        .then(data => {
            document.getElementById('studentCount').textContent  = data.totalStudents;
            document.getElementById('presentCount').textContent  = data.present;
            document.getElementById('absentCount').textContent   = data.absent;
            document.getElementById('lateCount').textContent     = data.late;

            const tbody = document.getElementById('recentTableBody');
            if (data.recent.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#8a97a7;padding:16px">No attendance recorded today</td></tr>';
                return;
            }
            tbody.innerHTML = data.recent
                .slice(-10).reverse()
                .map(r => `<tr>
                    <td>${r.name}</td>
                    <td>${r.studentNumber}</td>
                    <td>${formatTime(r.time)}</td>
                    <td><span class="status-pill ${r.status.toLowerCase()}">${r.status}</span></td>
                </tr>`).join('');
        })
        .catch(err => console.error('Stats error:', err));
}

document.addEventListener("DOMContentLoaded", function(){
    loadTodayStats();
    setInterval(loadTodayStats, 30000);

    loadSchedule();
    setInterval(loadSchedule, 60000);

    fetch('/attendance/chart')
        .then(r => r.json())
        .then(data => {
            const labels   = data.map(d => d.date);
            const present  = data.map(d => d.present);
            const late     = data.map(d => d.late);
            const absent   = data.map(d => d.absent);

            new Chart(document.getElementById('attendanceChart'), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Present',
                            data: present,
                            backgroundColor: '#16a34a',
                            borderRadius: 4,
                        },
                        {
                            label: 'Late',
                            data: late,
                            backgroundColor: '#d97706',
                            borderRadius: 4,
                        },
                        {
                            label: 'Absent',
                            data: absent,
                            backgroundColor: '#dc2626',
                            borderRadius: 4,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 11 } }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0, font: { size: 11 } },
                            grid: { color: '#f1f5f9' }
                        }
                    }
                }
            });
        })
        .catch(err => console.error('Chart error:', err));
});
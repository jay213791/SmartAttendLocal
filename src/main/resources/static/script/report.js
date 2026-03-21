let reportData = [];

function formatTime(isoString) {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function statusClass(status) {
    if (!status) return '';
    return status.toLowerCase();
}

function loadReport() {
    const date   = document.getElementById('dateFilter').value;
    const cardId = document.getElementById('classFilter').value;

    const params = new URLSearchParams();
    if (date)   params.append('date', date);
    if (cardId) params.append('cardId', cardId);

    fetch('/attendance/report-all?' + params.toString())
        .then(r => r.json())
        .then(data => {
            reportData = data;
            renderTable(data);
            renderSummary(data);

            const dateLabel = date || new Date().toLocaleDateString();
            document.getElementById('reportTitle').textContent = 'Attendance Report';
            document.getElementById('reportSubtitle').textContent = dateLabel;
        })
        .catch(err => console.error('Report error:', err));
}

function renderTable(data) {
    const tbody = document.getElementById('reportTableBody');
    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-msg">No records found.</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(r => `
        <tr>
            <td>${r.className || '-'}</td>
            <td>${r.name}</td>
            <td>${r.studentNumber}</td>
            <td>${r.email}</td>
            <td>${formatTime(r.time)}</td>
            <td><span class="status-pill ${statusClass(r.status)}">${r.status}</span></td>
        </tr>`).join('');
}

function renderSummary(data) {
    const section = document.getElementById('summarySection');
    if (!data.length) { section.style.display = 'none'; return; }

    const present = data.filter(r => r.status === 'Present').length;
    const late    = data.filter(r => r.status === 'Late').length;
    const absent  = data.filter(r => r.status === 'Absent').length;

    document.getElementById('sumPresent').textContent = present;
    document.getElementById('sumLate').textContent    = late;
    document.getElementById('sumAbsent').textContent  = absent;
    document.getElementById('sumTotal').textContent   = data.length;
    section.style.display = 'flex';
}

function downloadCSV() {
    if (!reportData.length) { alert('No data to download. Load a report first.'); return; }

    const date   = document.getElementById('dateFilter').value || localDateStr(new Date());
    const header = ['Class', 'Student Name', 'Student No.', 'Email', 'Time In', 'Status'];
    const rows   = reportData.map(r => [
        `"${r.className || ''}"`,
        `"${r.name}"`,
        `"${r.studentNumber}"`,
        `"${r.email}"`,
        `"${formatTime(r.time)}"`,
        `"${r.status}"`
    ].join(','));

    const csv  = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `attendance-report-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function localDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

document.addEventListener('DOMContentLoaded', () => {
    // set today as default date using LOCAL date (not UTC)
    document.getElementById('dateFilter').value = localDateStr(new Date());

    // load classes into dropdown
    fetch('/attendance/cards')
        .then(r => r.json())
        .then(cards => {
            const sel = document.getElementById('classFilter');
            cards.forEach(c => {
                const opt = document.createElement('option');
                opt.value       = c.id;
                opt.textContent = c.name;
                sel.appendChild(opt);
            });
        })
        .catch(err => console.error('Cards error:', err));

    // auto-load today's report
    loadReport();
});

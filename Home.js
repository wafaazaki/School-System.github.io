// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBx2Xl3me5Obdiaksd22l6t6x6qVz5GX84",
    authDomain: "nursinginstitute-6a36a.firebaseapp.com",
    databaseURL: "https://nursinginstitute-6a36a-default-rtdb.firebaseio.com",
    projectId: "nursinginstitute-6a36a",
    storageBucket: "nursinginstitute-6a36a.firebasestorage.app",
    messagingSenderId: "50087758858",
    appId: "1:50087758858:web:fd1808eafd923a1a16a3f3",
    measurementId: "G-VK83G9FX5J"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
document.addEventListener('DOMContentLoaded', async function() {
    await initializeData();
    // باقي الكود زي ما هو
    import { ref, get, child } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

const database = getDatabase(app);

async function getFromFirebase(key) {
    try {
        const snapshot = await get(child(ref(database), key));
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log(`Data loaded from Firebase for key "${key}":`, data.length, 'items');
            return Array.isArray(data) ? data : [];
        } else {
            console.log(`No data found in Firebase for key "${key}"`);
            return [];
        }
    } catch (error) {
        console.error(`Error loading from Firebase for key "${key}":`, error);
        return [];
    }
}
    function renderWelcomeMessage() {
    const welcomeMessage = document.querySelector('.welcome-message');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (welcomeMessage && loggedInUser) {
        welcomeMessage.textContent = `مرحبًا، ${loggedInUser.fullName || loggedInUser.username}!`;
    } else if (welcomeMessage) {
        welcomeMessage.textContent = 'مرحبًا، ضيف!';
    }
}
    function showToast(message, type = 'success') {
    let backgroundColor;
    switch (type) {
        case 'success':
            backgroundColor = '#28a745';
            break;
        case 'error':
            backgroundColor = '#dc3545';
            break;
        case 'info':
            backgroundColor = '#17a2b8';
            break;
        default:
            backgroundColor = '#333';
    }
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: backgroundColor,
        stopOnFocus: true,
        style: {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            padding: '15px',
            borderRadius: '5px',
            direction: 'rtl',
        }
    }).showToast();
}

    // جلب البيانات
    let students = [];
let violations = [];

async function initializeData() {
    students = await getFromFirebase('students');
    violations = await getFromFirebase('violations');
}

    // عرض الإشعارات
async function renderNotifications() {
    const notifications = await getFromFirebase('notifications');
    const tableBody = document.getElementById('notifications-table-body');
    if (tableBody) {
        tableBody.innerHTML = '';
        notifications.forEach(notification => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${notification.text}</td>
                <td>${notification.date}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

    // عرض النافبار بناءً على نوع المستخدم
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const navBar = document.getElementById('nav-bar');
    if (loggedInUser) {
        const navItems = [
            { href: 'index.html', icon: 'fas fa-home', title: 'الرئيسية' },
            { href: 'Home.html', icon: 'fas fa-chart-line', title: 'النتائج' },
            { href: 'profile.html', icon: 'fas fa-user', title: 'الملف الشخصي' }
        ];
        if (loggedInUser.type === 'admin') {
            navItems.push({ href: 'admin.html', icon: 'fas fa-cogs', title: 'لوحة التحكم' });
        }
        navBar.innerHTML = navItems.map(item => `
            <a href="${item.href}" title="${item.title}"><i class="${item.icon}"></i></a>
        `).join('');
    } else {
        navBar.innerHTML = '<a href="index.html" title="الرئيسية"><i class="fas fa-home"></i></a>';
    }

    // إخفاء لوحة التحكم
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'none';
    }

    // التعامل مع نموذج البحث
    const searchForm = document.getElementById('search-form');
    const resultTableBody = document.getElementById('result-table-body');
    const violationsTableBody = document.getElementById('violations-table-body');

  if (searchForm && resultTableBody && violationsTableBody) {
    if (loggedInUser && loggedInUser.type === 'student') {
        students = await getFromFirebase('students');
        const student = students.find(s => s.username === loggedInUser.username);
        if (student && document.getElementById('student-name')) {
            document.getElementById('student-name').value = student.fullName;
            document.getElementById('student-name').readOnly = true;
        }
    }

    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const studentName = document.getElementById('student-name').value.trim().toLowerCase();
        const studentId = document.getElementById('student-id').value.trim().toLowerCase();

        students = await getFromFirebase('students');
        violations = await getFromFirebase('violations');

        let student;
        if (loggedInUser && loggedInUser.type === 'student') {
            student = students.find(s => 
                s.username === loggedInUser.username &&
                s.fullName.toLowerCase() === studentName &&
                s.id.toLowerCase() === studentId
            );
        } else if (loggedInUser && loggedInUser.type === 'admin') {
            student = students.find(s => 
                s.fullName.toLowerCase() === studentName &&
                s.id.toLowerCase() === studentId
            );
        }

        resultTableBody.innerHTML = '';
        violationsTableBody.innerHTML = '';

        if (student) {
            showToast('تم العثور على النتيجة بنجاح!', 'success');
            const total = student.subjects.reduce((sum, s) => sum + (s.grade || 0), 0);
            const percentage = student.subjects.length ? (total / (student.subjects.length * 100)) * 100 : 0;

            const labels = ['اسم الطالب', 'رقم الجلوس'].concat(student.subjects.map(s => s.name));
            const values = [student.fullName, student.id].concat(student.subjects.map(s => s.grade || 0));
            const labelsWithSeparators = labels.map((label, index) => 
                index < labels.length - 1 ? `${label}<hr class="table-separator">` : label
            ).join('');
            const valuesWithSeparators = values.map((value, index) => 
                index < values.length - 1 ? `${value}<hr class="table-separator">` : value
            ).join('');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${labelsWithSeparators}</td>
                <td>${valuesWithSeparators}</td>
                <td>${total}</td>
                <td>${percentage.toFixed(2)}%</td>
            `;
            resultTableBody.appendChild(row);

            const studentViolations = violations.filter(v => v.studentId.toLowerCase() === studentId);
            if (studentViolations.length > 0) {
                studentViolations.forEach(violation => {
                    const violationRow = document.createElement('tr');
                    violationRow.innerHTML = `
                        <td>${violation.type === 'warning' ? 'إنذار' : 'مخالفة'}</td>
                        <td>${violation.reason}</td>
                        <td>${violation.penalty}</td>
                        <td>${violation.parentSummons ? 'نعم' : 'لا'}</td>
                        <td>${violation.date}</td>
                    `;
                    violationsTableBody.appendChild(violationRow);
                });
            } else {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="5">لا توجد إنذارات أو مخالفات لهذا الطالب.</td>`;
                violationsTableBody.appendChild(row);
            }
        } else {
            showToast('لم يتم العثور على نتيجة! تأكد من الاسم ورقم الجلوس.', 'error');
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4">لم يتم العثور على نتيجة! تأكد من الاسم ورقم الجلوس.</td>`;
            resultTableBody.appendChild(row);
            const violationRow = document.createElement('tr');
            violationRow.innerHTML = `<td colspan="5">لم يتم العثور على نتيجة!</td>`;
            violationsTableBody.appendChild(violationRow);
        }
    });
}

    // استدعاء الدوال
    // استدعاء الدوال
async function initializePage() {
    await initializeData();
    await renderNotifications();
    renderWelcomeMessage();
}
initializePage();
});

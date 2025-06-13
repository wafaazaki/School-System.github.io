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
   import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

const database = getDatabase(app);

async function saveToFirebase(key, data) {
    try {
        await set(ref(database, key), data);
        console.log(`Data saved to Firebase for key "${key}":`, data.length, 'items');
        return true;
    } catch (error) {
        console.error(`Error saving to Firebase for key "${key}":`, error);
        showToast('حدث خطأ أثناء حفظ البيانات! تحقق من وحدة التحكم.', 'error');
        return false;
    }
}

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
            backgroundColor = '#28a745'; // أخضر للنجاح
            break;
        case 'error':
            backgroundColor = '#dc3545'; // أحمر للخطأ
            break;
        case 'info':
            backgroundColor = '#17a2b8'; // أزرق للمعلومات
            break;
        default:
            backgroundColor = '#333'; // رمادي افتراضي
    }
    Toastify({
        text: message,
        duration: 3000, // 3 ثواني
        gravity: 'top', // أعلى الصفحة
        position: 'right', // اليمين
        backgroundColor: backgroundColor,
        stopOnFocus: true,
        style: {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            padding: '15px',
            borderRadius: '5px',
            direction: 'rtl', // النص من اليمين لليسار
        }
    }).showToast();
}

    // جلب البيانات
let students = [];
let admins = [];
let notifications = [];
let violations = [];

async function initializeData() {
    students = await getFromFirebase('students');
    admins = await getFromFirebase('admins');
    notifications = await getFromFirebase('notifications');
    violations = await getFromFirebase('violations');
}
    // دالة لتوليد اسم مستخدم فريد
    function generateUniqueUsername(fullName, id) {
        let baseUsername = fullName.toLowerCase().replace(/\s+/g, '').slice(0, 10) + id.slice(-2);
        let username = baseUsername;
        let counter = 1;
        while (students.some(s => s.username === username) || admins.some(a => a.username === username)) {
            username = `${baseUsername}${counter}`;
            counter++;
        }
        return username;
    }

    // دالة لتوليد كلمة مرور
    function generatePassword(fullName) {
        const firstName = fullName.split(' ')[0];
        return `${firstName.charAt(0).toUpperCase() + firstName.slice(1)}1234@`;
    }

    async function renderAdmins() {
    admins = await getFromFirebase('admins');
    const tableBody = document.getElementById('users-table-body');
    if (tableBody) {
        tableBody.innerHTML = '';
        admins.forEach(admin => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${admin.fullName}</td>
                <td>${admin.username}</td>
                <td>
                    <button class="delete-btn" onclick="deleteAdmin('${admin.username}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

    document.getElementById('add-user-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const fullName = document.getElementById('admin-name').value.trim();
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    if (!fullName || !username || !password) {
        showToast('يرجى إدخال الاسم الكامل، اسم المستخدم، وكلمة المرور!', 'error');
        return;
    }
    admins = await getFromFirebase('admins');
    students = await getFromFirebase('students');
    if (admins.some(admin => admin.username === username) || students.some(s => s.username === username)) {
        showToast('اسم المستخدم موجود بالفعل! اختر اسم مستخدم آخر.', 'error');
        return;
    }

    let hashedPassword;
    try {
        hashedPassword = CryptoJS.SHA256(password).toString();
        console.log('New admin password hashed:', hashedPassword.length, 'characters');
    } catch (error) {
        console.error('Error hashing password:', error);
        showToast('خطأ في تشفير كلمة المرور! تأكد من تحميل مكتبة CryptoJS.', 'error');
        return;
    }

    const newAdmin = {
        username: username,
        password: hashedPassword,
        fullName: fullName
    };
    admins.push(newAdmin);
    if (await saveToFirebase('admins', admins)) {
        renderAdmins();
        showToast(`تم إضافة الأدمن بنجاح!\nاسم المستخدم: ${username}\nكلمة المرور: ${password}\nاحتفظ بهذه البيانات.`, 'success');
        this.reset();
    }
});

    window.deleteAdmin = async function(username) {
    if (confirm('هل أنت متأكد من حذف هذا الأدمن؟')) {
        admins = await getFromFirebase('admins');
        if (admins.length === 1) {
            showToast('لا يمكن حذف آخر أدمن! يجب أن يبقى أدمن واحد على الأقل.', 'error');
            return;
        }
        admins = admins.filter(admin => admin.username !== username);
        if (await saveToFirebase('admins', admins)) {
            renderAdmins();
            showToast('تم حذف الأدمن بنجاح.', 'success');
        }
    }
};

    async function renderResults(filter = '') {
    students = await getFromFirebase('students');
    const tableBody = document.getElementById('results-table-body');
    if (tableBody) {
        tableBody.innerHTML = '';
        const filteredStudents = students.filter(student => 
            student.fullName.toLowerCase().includes(filter.toLowerCase()) ||
            student.id.toLowerCase().includes(filter.toLowerCase())
        );
        filteredStudents.forEach(student => {
            const total = student.subjects.reduce((sum, s) => sum + (s.grade || 0), 0);
            const percentage = student.subjects.length ? (total / (student.subjects.length * 100)) * 100 : 0;
            let percentageClass = '';
            if (percentage >= 85) percentageClass = 'high-percentage';
            else if (percentage >= 60) percentageClass = 'medium-percentage';
            else percentageClass = 'low-percentage';

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
                <td class="${percentageClass}">${percentage.toFixed(1)}%</td>
                <td>
                    <button class="edit-btn" onclick="editStudent('${student.id}')"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteStudent('${student.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

    document.getElementById('search-input')?.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        renderResults(searchTerm);
    });

    async function renderStats() {
    students = await getFromFirebase('students');
    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
        const totalStudents = students.length;
        const highestPercentage = students.length ? Math.max(...students.map(s => {
            const total = s.subjects.reduce((sum, s) => sum + (s.grade || 0), 0);
            return s.subjects.length ? (total / (s.subjects.length * 100)) * 100 : 0;
        })) : 0;
        const avgGrade = students.length ? students.reduce((sum, s) => {
            const avg = s.subjects.length ? s.subjects.reduce((sSum, s) => sSum + (s.grade || 0), 0) / s.subjects.length : 0;
            return sum + avg;
        }, 0) / students.length : 0;

        const passingStudents = students.filter(s => {
            const total = s.subjects.reduce((sum, s) => sum + (s.grade || 0), 0);
            return s.subjects.length ? (total / (s.subjects.length * 100)) * 100 >= 60 : false;
        }).length;
        const failingStudents = totalStudents - passingStudents;

        const subjects = [
            "مبادئ وأسس تمريض", "اللغة العربية", "اللغة الإنجليزية", "الفيزياء",
            "الكيمياء", "التشريح / علم وظائف الأعضاء", "التربية الدينية", "الكمبيوتر"
        ];
        const highestGrades = subjects.map(subject => {
            const maxGrade = students.length ? Math.max(...students.map(s => {
                const subj = s.subjects.find(sub => sub.name === subject);
                return subj ? (subj.grade || 0) : 0;
            })) : 0;
            return { subject, maxGrade };
        });

        statsSection.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item" id="total-students">
                    <p><i class="fas fa-users"></i> عدد الطلاب: ${totalStudents}</p>
                </div>
                <div class="stat-item" id="highest-grade">
                    <p><i class="fas fa-trophy"></i> أعلى نسبة مئوية: ${highestPercentage.toFixed(1)}%</p>
                </div>
                <div class="stat-item" id="average-grade">
                    <p><i class="fas fa-chart-line"></i> متوسط الدرجات: ${avgGrade.toFixed(1)}</p>
                </div>
                <div class="stat-item" id="passing-students">
                    <p><i class="fas fa-check-circle"></i> عدد الناجحين: ${passingStudents}</p>
                </div>
                <div class="stat-item" id="failing-students">
                    <p><i class="fas fa-times-circle"></i> عدد الراسبين: ${failingStudents}</p>
                </div>
                ${highestGrades.map(item => `
                    <div class="stat-item">
                        <p><i class="fas fa-star"></i> أعلى درجة في ${item.subject}: ${item.maxGrade}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

    async function renderNotifications() {
    notifications = await getFromFirebase('notifications');
    const tableBody = document.getElementById('notifications-table-body');
    if (tableBody) {
        tableBody.innerHTML = '';
        notifications.forEach((notification, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${notification.text}</td>
                <td>${notification.date}</td>
                <td>
                    <button class="delete-btn" onclick="deleteNotification(${index})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

    window.addNotification = async function() {
    const text = document.getElementById('notification-text')?.value.trim();
    if (!text) {
        showToast('يرجى إدخال نص الإشعار!', 'error');
        return;
    }
    notifications = await getFromFirebase('notifications');
    const date = new Date().toLocaleString('ar-EG');
    notifications.push({ text, date });
    if (await saveToFirebase('notifications', notifications)) {
        renderNotifications();
        showToast('تم إضافة الإشعار بنجاح!', 'success');
        document.getElementById('notification-text').value = '';
    }
};

    window.deleteNotification = async function(index) {
    if (confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
        notifications = await getFromFirebase('notifications');
        notifications.splice(index, 1);
        if (await saveToFirebase('notifications', notifications)) {
            renderNotifications();
            showToast('تم حذف الإشعار بنجاح.', 'success');
        }
    }
};

    async function renderViolations() {
    violations = await getFromFirebase('violations');
    students = await getFromFirebase('students');
    const tableBody = document.getElementById('violations-table-body');
    if (tableBody) {
        tableBody.innerHTML = '';
        violations.forEach((violation, index) => {
            const student = students.find(s => s.id === violation.studentId);
            const studentName = student ? student.fullName : 'طالب غير موجود';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${violation.studentId}</td>
                <td>${studentName}</td>
                <td>${violation.type === 'warning' ? 'إنذار' : 'مخالفة'}</td>
                <td>${violation.reason}</td>
                <td>${violation.penalty}</td>
                <td>${violation.parentSummons ? 'نعم' : 'لا'}</td>
                <td>${violation.date}</td>
                <td>
                    <button class="delete-btn" onclick="deleteViolation(${index})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

    document.getElementById('add-violation-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const studentId = document.getElementById('violation-student-id').value.trim();
    const type = document.getElementById('violation-type').value;
    const reason = document.getElementById('violation-reason').value.trim();
    const penalty = document.getElementById('violation-penalty').value.trim();
    const parentSummons = document.getElementById('parent-summons').checked;

    if (!studentId || !reason || !penalty) {
        showToast('يرجى إدخال جميع الحقول المطلوبة!', 'error');
        return;
    }

    students = await getFromFirebase('students');
    if (!students.some(s => s.id === studentId)) {
        showToast('رقم الجلوس غير موجود! يرجى التأكد من رقم الجلوس.', 'error');
        return;
    }

    violations = await getFromFirebase('violations');
    const date = new Date().toLocaleString('ar-EG');
    const newViolation = { studentId, type, reason, penalty, parentSummons, date };
    violations.push(newViolation);
    if (await saveToFirebase('violations', violations)) {
        renderViolations();
        showToast(`تم إضافة ${type === 'warning' ? 'إنذار' : 'مخالفة'} بنجاح!`, 'success');
        this.reset();
    }
});

    window.deleteViolation = async function(index) {
    if (confirm('هل أنت متأكد من حذف هذا الإنذار/المخالفة؟')) {
        violations = await getFromFirebase('violations');
        violations.splice(index, 1);
        if (await saveToFirebase('violations', violations)) {
            renderViolations();
            showToast('تم حذف الإنذار/المخالفة بنجاح.', 'success');
        }
    }
};

    window.processText = async function() {
    const textInput = document.getElementById('text-input')?.value.trim();
    if (!textInput) {
        showToast('يرجى إلصق النص أولاً!', 'error');
        return;
    }
    students = await getFromFirebase('students');
    const lines = textInput.split('\n').filter(line => line.trim() !== '');
    let addedCount = 0;
    let updatedCount = 0;
    lines.forEach(line => {
        const parts = line.split('|').map(part => part.trim());
        if (parts.length === 10) {
            const fullName = parts[0];
            const studentId = parts[1];
            const subjects = [
                { name: "مبادئ وأسس تمريض", grade: parseInt(parts[2]) || 0 },
                { name: "اللغة العربية", grade: parseInt(parts[3]) || 0 },
                { name: "اللغة الإنجليزية", grade: parseInt(parts[4]) || 0 },
                { name: "الفيزياء", grade: parseInt(parts[5]) || 0 },
                { name: "الكيمياء", grade: parseInt(parts[6]) || 0 },
                { name: "التشريح / علم وظائف الأعضاء", grade: parseInt(parts[7]) || 0 },
                { name: "التربية الدينية", grade: parseInt(parts[8]) || 0 },
                { name: "الكمبيوتر", grade: parseInt(parts[9]) || 0 }
            ];

            const existingStudent = students.find(s => s.id === studentId);
            if (existingStudent) {
                existingStudent.subjects = subjects;
                updatedCount++;
            } else {
                const username = generateUniqueUsername(fullName, studentId);
                const originalPassword = generatePassword(fullName);
                const hashedPassword = CryptoJS.SHA256(originalPassword).toString();
                students.push({
                    fullName,
                    id: studentId,
                    username,
                    password: hashedPassword,
                    subjects,
                    profile: { email: '', phone: '', birthdate: '', address: '', bio: '' },
                    originalPassword
                });
                addedCount++;
            }
        }
    });
    if (await saveToFirebase('students', students)) {
        renderResults();
        renderStats();
        showToast(`تم تحليل النص وإضافة ${addedCount} طالب جديد وتحديث ${updatedCount} طالب بنجاح! كلمة المرور للطلاب الجدد هي: [الاسم الأول بالحرف الكبير]1234@`, 'success');
        document.getElementById('text-input').value = '';
    }
};

  document.getElementById('add-result-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const fullName = document.getElementById('student-name').value.trim();
    const studentId = document.getElementById('student-id').value.trim();
    const subject1 = parseInt(document.getElementById('subject1').value) || 0;
    const subject2 = parseInt(document.getElementById('subject2').value) || 0;
    const subject3 = parseInt(document.getElementById('subject3').value) || 0;
    const subject4 = parseInt(document.getElementById('subject4').value) || 0;
    const subject5 = parseInt(document.getElementById('subject5').value) || 0;
    const subject6 = parseInt(document.getElementById('subject6').value) || 0;
    const subject7 = parseInt(document.getElementById('subject7').value) || 0;
    const subject8 = parseInt(document.getElementById('subject8').value) || 0;

    if (!fullName || !studentId) {
        showToast('يرجى إدخال اسم الطالب ورقم الجلوس!', 'error');
        return;
    }
    if ([subject1, subject2, subject3, subject4, subject5, subject6, subject7, subject8].some(g => g < 0 || g > 100)) {
        showToast('تأكد أن جميع الدرجات بين 0 و100!', 'error');
        return;
    }

    students = await getFromFirebase('students');
    const subjects = [
        { name: "مبادئ وأسس تمريض", grade: subject1 },
        { name: "اللغة العربية", grade: subject2 },
        { name: "اللغة الإنجليزية", grade: subject3 },
        { name: "الفيزياء", grade: subject4 },
        { name: "الكيمياء", grade: subject5 },
        { name: "التشريح / علم وظائف الأعضاء", grade: subject6 },
        { name: "التربية الدينية", grade: subject7 },
        { name: "الكمبيوتر", grade: subject8 }
    ];

    const existingStudent = students.find(s => s.id === studentId);
    if (existingStudent) {
        existingStudent.subjects = subjects;
        if (await saveToFirebase('students', students)) {
            renderResults();
            renderStats();
            showToast(`تم تحديث درجات الطالب ${fullName} بنجاح!`, 'success');
            this.reset();
        }
    } else {
        const username = generateUniqueUsername(fullName, studentId);
        const originalPassword = generatePassword(fullName);
        const hashedPassword = CryptoJS.SHA256(originalPassword).toString();
        const student = {
            fullName,
            id: studentId,
            username,
            password: hashedPassword,
            subjects,
            profile: { email: '', phone: '', birthdate: '', address: '', bio: '' },
            originalPassword
        };
        students.push(student);
        if (await saveToFirebase('students', students)) {
            renderResults();
            renderStats();
            showToast(`تم إضافة الطالب بنجاح!\nاسم المستخدم: ${username}\nكلمة المرور: ${originalPassword}`, 'success');
            this.reset();
        }
    }
});

    window.deleteStudent = async function(studentId) {
    if (confirm('هل أنت متأكد؟ لن تتمكن من استرجاع بيانات هذا الطالب!')) {
        students = await getFromFirebase('students');
        violations = await getFromFirebase('violations');
        students = students.filter(s => s.id !== studentId);
        violations = violations.filter(v => v.studentId !== studentId);
        if (await saveToFirebase('students', students) && await saveToFirebase('violations', violations)) {
            renderResults();
            renderStats();
            renderViolations();
            showToast('تم حذف الطالب بنجاح.', 'success');
        }
    }
};

    window.editStudent = function(studentId) {
        const student = students.find(s => s.id === studentId);
        if (student) {
            document.getElementById('student-name').value = student.fullName;
            document.getElementById('student-id').value = student.id;
            document.getElementById('subject1').value = student.subjects[0]?.grade || 0;
            document.getElementById('subject2').value = student.subjects[1]?.grade || 0;
            document.getElementById('subject3').value = student.subjects[2]?.grade || 0;
            document.getElementById('subject4').value = student.subjects[3]?.grade || 0;
            document.getElementById('subject5').value = student.subjects[4]?.grade || 0;
            document.getElementById('subject6').value = student.subjects[5]?.grade || 0;
            document.getElementById('subject7').value = student.subjects[6]?.grade || 0;
            document.getElementById('subject8').value = student.subjects[7]?.grade || 0;
            // لا نحذف الطالب هنا، بل نترك النموذج لتحديث البيانات عبر الإرسال
        }
    };

    window.scrollToTop = function() {
        document.querySelector('.admin-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.scrollToBottom = function() {
        const container = document.querySelector('.admin-container');
        if (container) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }
    };

    // استدعاء الدوال عند التحميل
    // استدعاء الدوال عند التحميل
async function initializePage() {
    await initializeData();
    await renderAdmins();
    await renderResults();
    await renderStats();
    await renderNotifications();
    await renderViolations();
    renderWelcomeMessage();
}
initializePage();
  });

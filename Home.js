document.addEventListener('DOMContentLoaded', function() {
    // دالة لجلب البيانات من localStorage مع فحص السلامة
    function getFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            if (data === null || data === 'undefined') {
                console.log(`No data found in localStorage for key "${key}"`);
                return [];
            }
            const parsed = JSON.parse(data);
            if (!Array.isArray(parsed)) {
                throw new Error(`Data for key "${key}" is not an array`);
            }
            console.log(`Data loaded from localStorage for key "${key}":`, parsed.length, 'items');
            return parsed;
        } catch (error) {
            console.error(`Error loading from localStorage for key "${key}":`, error);
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

    // جلب البيانات
    let students = getFromLocalStorage('students');
    let violations = getFromLocalStorage('violations');

    // عرض الإشعارات
    function renderNotifications() {
        const notifications = getFromLocalStorage('notifications');
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
        // إذا الطالب مسجل، املأ حقل اسم الطالب تلقائيًا
        if (loggedInUser && loggedInUser.type === 'student') {
            const student = students.find(s => s.username === loggedInUser.username);
            if (student && document.getElementById('student-name')) {
                document.getElementById('student-name').value = student.fullName;
                document.getElementById('student-name').readOnly = true; // منع التعديل
            }
        }

        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const studentName = document.getElementById('student-name').value.trim().toLowerCase();
            const studentId = document.getElementById('student-id').value.trim().toLowerCase();

            // إذا المستخدم طالب، تحقق من أن البحث يخصه فقط
            let student;
            if (loggedInUser && loggedInUser.type === 'student') {
                student = students.find(s => 
                    s.username === loggedInUser.username &&
                    s.fullName.toLowerCase() === studentName &&
                    s.id.toLowerCase() === studentId
                );
            } else if (loggedInUser && loggedInUser.type === 'admin') {
                // الأدمن يقدر يبحث عن أي طالب
                student = students.find(s => 
                    s.fullName.toLowerCase() === studentName &&
                    s.id.toLowerCase() === studentId
                );
            }

            resultTableBody.innerHTML = '';
            violationsTableBody.innerHTML = '';

            if (student) {
                // عرض النتيجة
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

                // عرض الإنذارات/المخالفات
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
    renderNotifications();
    renderNotifications();
});

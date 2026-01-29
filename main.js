// 滾動時導覽列陰影效果
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    } else {
        navbar.style.boxShadow = 'none';
        navbar.style.background = 'rgba(255, 255, 255, 0.8)';
    }
});

// 手機版菜單 切換邏輯
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// 動態頁面加載邏輯 (SPA-like)
const pageWrapper = document.getElementById('page-wrapper');

async function loadPage(url) {
    try {
        // 如果是錨點連結，則由原有的平滑捲動處理
        if (url.startsWith('#')) return;

        console.log(`Loading page: ${url}`);
        const response = await fetch(url);
        const html = await response.text();

        // 解析獲取的 HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 獲取新頁面的 #page-wrapper 內容
        const newContent = doc.querySelector('#page-wrapper');

        if (newContent && pageWrapper) {
            // 添加淡出效果 (可選)
            pageWrapper.classList.add('fade-out');

            setTimeout(() => {
                pageWrapper.innerHTML = newContent.innerHTML;
                pageWrapper.classList.remove('fade-out');
                pageWrapper.classList.add('fade-in');

                // 捲回頂部
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // 重新綁定新內容中的點擊事件 (如有需要)
                rebindEvents();
            }, 300);

            // 更新瀏覽器網址 (不重新整理)
            window.history.pushState({ path: url }, '', url);
        } else {
            // 如果頁面沒有 #page-wrapper，則直接跳轉
            window.location.href = url;
        }
    } catch (error) {
        console.error('Failed to load page:', error);
        window.location.href = url; // 發生錯誤時回歸傳統跳轉
    }
}

function rebindEvents() {
    // 處理頁面內部的連結
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 監聽導覽列點擊
document.addEventListener('click', (e) => {
    const navLink = e.target.closest('.nav-btn, .logo');
    if (navLink && navLink.getAttribute('href') && !navLink.getAttribute('href').startsWith('#') && !navLink.getAttribute('target')) {
        e.preventDefault();
        const url = navLink.getAttribute('href');
        loadPage(url);

        // 如果在手機模式，點擊後關閉選單
        if (navLinks.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            navLinks.classList.remove('active');
        }
    }
});

// 處理瀏覽器前進後退
window.addEventListener('popstate', () => {
    window.location.reload(); // 簡單處理回退：直接重整
});

// 初始化
rebindEvents();

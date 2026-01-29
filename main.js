// 滾動時導覽列陰影效果
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.background = 'rgba(255, 255, 255, 0.8)';
        }
    }
});

// 手機版菜單 切換邏輯 (封裝成函式以便重新綁定)
function initMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        // 先移除舊的監聽器（防止重複綁定）
        const newMenu = mobileMenu.cloneNode(true);
        mobileMenu.parentNode.replaceChild(newMenu, mobileMenu);

        newMenu.addEventListener('click', () => {
            newMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
}

// 動態頁面加載邏輯
const pageWrapper = document.getElementById('page-wrapper');

async function loadPage(url) {
    try {
        if (url.startsWith('#')) return;

        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const newContent = doc.querySelector('#page-wrapper');
        const newNavbar = doc.querySelector('#navbar');

        if (newContent && pageWrapper) {
            pageWrapper.classList.add('fade-out');

            setTimeout(() => {
                // 更新內容
                pageWrapper.innerHTML = newContent.innerHTML;

                // 同步更新導覽列的 active 狀態
                if (newNavbar) {
                    const currentNavbar = document.getElementById('navbar');
                    if (currentNavbar) {
                        currentNavbar.innerHTML = newNavbar.innerHTML;
                    }
                }

                pageWrapper.classList.remove('fade-out');
                pageWrapper.classList.add('fade-in');

                window.scrollTo({ top: 0, behavior: 'smooth' });

                // 重新綁定事件
                rebindEvents();
                initMobileMenu();

                // 發送頁面切換完成事件，讓頁面專屬的 JS 可以重新執行
                document.dispatchEvent(new CustomEvent('page-switched'));
            }, 300);

            window.history.pushState({ path: url }, '', url);
        } else {
            window.location.href = url;
        }
    } catch (error) {
        window.location.href = url;
    }
}

function rebindEvents() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
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
    const navLink = e.target.closest('.nav-btn, .logo, .nav-links a:not([href^="#"])');
    if (navLink) {
        const url = navLink.getAttribute('href');
        if (url && url !== '#' && !url.startsWith('#') && !navLink.getAttribute('target')) {
            e.preventDefault();
            loadPage(url);

            const navLinks = document.querySelector('.nav-links');
            const mobileMenu = document.getElementById('mobile-menu');
            if (navLinks && navLinks.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                navLinks.classList.remove('active');
            }
        }
    }
});

window.addEventListener('popstate', () => {
    window.location.reload();
});

// 初始化
initMobileMenu();
rebindEvents();

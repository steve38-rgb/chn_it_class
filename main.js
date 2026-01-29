// 滾動時導覽列陰影效果
window.addEventListener('scroll', function () {
    var navbar = document.getElementById('navbar');
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
    var mobileMenu = document.getElementById('mobile-menu');
    var navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        // 先移除舊的監聽器（防止重複綁定）
        var newMenu = mobileMenu.cloneNode(true);
        mobileMenu.parentNode.replaceChild(newMenu, mobileMenu);

        newMenu.addEventListener('click', function () {
            newMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
}

// 動態頁面加載邏輯
var pageWrapper = document.getElementById('page-wrapper');

async function loadPage(url) {
    try {
        if (url.startsWith('#')) return;

        var response = await fetch(url);
        var html = await response.text();
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');

        var newContent = doc.querySelector('#page-wrapper');
        var newNavbar = doc.querySelector('#navbar');

        if (newContent && pageWrapper) {
            pageWrapper.classList.add('fade-out');

            setTimeout(function () {
                // 1. 更新內容
                pageWrapper.innerHTML = newContent.innerHTML;

                // 2. 獲取並執行新頁面的腳本
                var scripts = doc.querySelectorAll('script');
                scripts.forEach(function (oldScript) {
                    var newScript = document.createElement('script');
                    if (oldScript.src) {
                        // 如果是外部腳本 (且不是 main.js 本身)，則重新載入
                        if (!oldScript.src.includes('main.js')) {
                            newScript.src = oldScript.src;
                        } else {
                            return; // 跳過 main.js
                        }
                    } else {
                        // 如果是內聯腳本，則複製內容
                        newScript.textContent = oldScript.textContent;
                    }
                    document.body.appendChild(newScript);
                    // 執行完後移除，保持 DOM 乾淨 (選用)
                    if (!oldScript.src) document.body.removeChild(newScript);
                });

                // 3. 同步更新導覽列的 active 狀態
                if (newNavbar) {
                    var currentNavbar = document.getElementById('navbar');
                    if (currentNavbar) {
                        currentNavbar.innerHTML = newNavbar.innerHTML;
                    }
                }

                pageWrapper.classList.remove('fade-out');
                pageWrapper.classList.add('fade-in');

                window.scrollTo({ top: 0, behavior: 'smooth' });

                // 4. 重新綁定事件
                rebindEvents();
                initMobileMenu();

                // 5. 發送頁面切換完成事件
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
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            var target = document.querySelector(href);
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
document.addEventListener('click', function (e) {
    var navLink = e.target.closest('.nav-btn, .logo, .nav-links a:not([href^="#"])');
    if (navLink) {
        var url = navLink.getAttribute('href');
        if (url && url !== '#' && !url.startsWith('#') && !navLink.getAttribute('target')) {
            e.preventDefault();
            loadPage(url);

            var navLinks = document.querySelector('.nav-links');
            var mobileMenu = document.getElementById('mobile-menu');
            if (navLinks && navLinks.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                navLinks.classList.remove('active');
            }
        }
    }
});

window.addEventListener('popstate', function () {
    window.location.reload();
});

// 初始化
initMobileMenu();
rebindEvents();

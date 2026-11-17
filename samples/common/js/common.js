/* 툴팁 : [data-tooltip-trigger] 클릭 시 가장 가까운 .comTooltip 에 open 클래스 토글
   (2026-10-19 접근성) 열림 상태를 트리거의 aria-expanded로 함께 알려주고, 닫기(X)로 닫으면 포커스를 트리거로 돌려준다. */
function setTooltipOpen(tooltip, open) {
    tooltip.classList.toggle('open', open);
    var trigger = tooltip.querySelector('[data-tooltip-trigger]');
    if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
}

document.querySelectorAll('[data-tooltip-trigger]').forEach(function (el) {
    el.setAttribute('aria-expanded', 'false');
});

document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-tooltip-trigger]');
    if (trigger) {
        var tooltip = trigger.closest('.comTooltip');
        var wasOpen = tooltip.classList.contains('open');

        document.querySelectorAll('.comTooltip.open').forEach(function (el) {
            setTooltipOpen(el, false);
        });

        if (!wasOpen) {
            setTooltipOpen(tooltip, true);
        }
        return;
    }

    var tooltipClose = e.target.closest('.comTooltip [data-tooltip-close]');
    if (tooltipClose) {
        var closingTooltip = tooltipClose.closest('.comTooltip');
        setTooltipOpen(closingTooltip, false);
        var tooltipTrigger = closingTooltip.querySelector('[data-tooltip-trigger]');
        if (tooltipTrigger) tooltipTrigger.focus();
        return;
    }

    if (!e.target.closest('.comTooltip')) {
        document.querySelectorAll('.comTooltip.open').forEach(function (el) {
            setTooltipOpen(el, false);
        });
    }
});

/* (2026-10-21 사용자 지시) 고정 헤더 : 스크롤이 조금이라도 내려가면 헤더(.layoutTop 안의 .cptHeader)에 -fixed를 붙여
   화면 위에 고정하고 높이를 60px로 줄인다(맨 위로 돌아오면 원래대로). 헤더 자리는 .layoutTop이 계속 차지하므로
   고정되는 순간 본문이 움직이지 않는다(_cptHeader.scss 참고). 새로고침 등으로 중간 위치에서 열려도 바로 맞춰진다. */
(function () {
    var header = document.querySelector('.layoutTop > .cptHeader');
    if (!header) return;

    var ticking = false;
    function syncFixedHeader() {
        header.classList.toggle('-fixed', window.scrollY > 0);
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(syncFixedHeader);
    }, { passive: true });

    syncFixedHeader();
})();

/* 헤더 Mobile 햄버거 메뉴 : [data-menu-trigger] 클릭 시 가장 가까운 .cptHeader 안의 .hdMobileMenu 에 open 클래스 토글
   (.comTooltip과 동일한 패턴 - 바깥을 클릭하면 닫힌다). */
/* (2026-10-19 접근성, 사용자 지시) 모바일 메뉴도 모달과 동일하게 동작한다 - 열면 메뉴(대화상자)로 포커스를 옮기고,
   열려 있는 동안 Tab/Shift+Tab 포커스는 메뉴 안에서만 순환(아래 Tab 가두기 공통 처리), 닫기(X)·Esc로 닫으면
   메뉴를 열기 직전에 포커스가 있던 요소(보통 햄버거 버튼)로 포커스를 되돌린다. */
function openMobileMenu(menu, trigger) {
    menu._returnFocus = document.activeElement && document.activeElement !== document.body ? document.activeElement : trigger;
    menu.classList.add('open');
    document.querySelectorAll('.hdMenuBtn').forEach(function (el) { el.setAttribute('aria-expanded', 'true'); });
    if (!menu.hasAttribute('tabindex')) menu.setAttribute('tabindex', '-1');
    menu.focus();
}

function closeMobileMenu(menu, restoreFocus) {
    menu.classList.remove('open');
    document.querySelectorAll('.hdMenuBtn[aria-expanded="true"]').forEach(function (el) {
        el.setAttribute('aria-expanded', 'false');
    });
    if (restoreFocus && menu._returnFocus && document.contains(menu._returnFocus)) menu._returnFocus.focus();
    menu._returnFocus = null;
}

document.addEventListener('click', function (e) {
    var menuTrigger = e.target.closest('[data-menu-trigger]');
    if (menuTrigger) {
        var header = menuTrigger.closest('.cptHeader');
        var menu = header ? header.querySelector('.hdMobileMenu') : null;
        if (!menu) return;

        if (menu.classList.contains('open')) {
            // 메뉴 안의 닫기(X) 버튼 : 열기 전 위치로 포커스 복귀
            closeMobileMenu(menu, true);
        } else {
            openMobileMenu(menu, menuTrigger);
        }
        return;
    }

    if (!e.target.closest('.hdMobileMenu') && !e.target.closest('.hdMenuBtn')) {
        document.querySelectorAll('.hdMobileMenu.open').forEach(function (el) {
            closeMobileMenu(el, false);
        });
    }
});

/* 모달 : [data-modal-open]="아이디" 클릭 시 해당 id의 .modModal 을 열고, [data-modal-close] 클릭 시 닫음
   "오늘 하루 보지 않기"([data-modal-today] 체크박스)를 체크한 채 닫으면 localStorage에 오늘 날짜로 기록되고,
   기록된 날짜와 오늘이 같으면 data-modal-open 버튼을 눌러도 열리지 않는다. */
function modalTodayKey(id) {
    return 'modalDontShowToday_' + id;
}

function modalShouldSkipToday(id) {
    return localStorage.getItem(modalTodayKey(id)) === new Date().toDateString();
}

function closeModal(modal) {
    var todayCheck = modal.querySelector('[data-modal-today]');
    if (todayCheck) {
        if (todayCheck.checked) {
            localStorage.setItem(modalTodayKey(modal.id), new Date().toDateString());
        } else {
            localStorage.removeItem(modalTodayKey(modal.id));
        }
    }

    modal.classList.remove('open');
    document.body.classList.remove('noScrl');

    // (2026-10-19 접근성) 모달을 연 버튼으로 포커스를 되돌린다(키보드·스크린리더 사용자가 원래 위치를 잃지 않도록)
    if (modal._returnFocus && document.contains(modal._returnFocus)) modal._returnFocus.focus();
    modal._returnFocus = null;
}

/* (2026-10-19 접근성) 모달 포커스 관리 : 열리면 대화상자(.modalPanel)로 포커스를 옮겨 제목부터 읽히게 하고,
   열려 있는 동안 Tab/Shift+Tab 포커스가 모달 밖으로 나가지 않도록 가둔다. */
var MODAL_FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusModal(modal) {
    var panel = modal.querySelector('.modalPanel');
    if (!panel) return;
    if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1');
    panel.focus();
}

document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    // 모달이 우선, 없으면 열린 모바일 메뉴(.hdMobileMenu.open) 안에 포커스를 가둔다
    var modal = document.querySelector('.modModal.open');
    var panel = modal ? modal.querySelector('.modalPanel') : document.querySelector('.hdMobileMenu.open');
    if (!panel) return;

    var items = Array.prototype.filter.call(panel.querySelectorAll(MODAL_FOCUSABLE), function (el) {
        return el.offsetWidth > 0 || el.offsetHeight > 0;
    });
    if (!items.length) { e.preventDefault(); return; }

    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault(); last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        e.preventDefault(); first.focus();
    }
});

document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-modal-open]');
    if (opener) {
        // (2026-10-08) 폼 안의 submit 버튼(예 : 로그인 버튼)이 모달을 열 때는 폼 제출(페이지 새로고침)을 막는다 -
        // 입력칸에서 Enter를 눌러도 브라우저가 submit 버튼 click을 대신 발생시키므로 같은 처리로 함께 막힌다.
        if (opener.type === 'submit') e.preventDefault();
        var modalId = opener.getAttribute('data-modal-open');
        if (modalShouldSkipToday(modalId)) return;

        var modal = document.getElementById(modalId);
        if (modal) {
            modal._returnFocus = opener;
            modal.classList.add('open');
            document.body.classList.add('noScrl');
            modal.querySelectorAll('[data-modal-scroll-wrap]').forEach(setupModalScroll);
            focusModal(modal);
        }
        return;
    }

    var closer = e.target.closest('[data-modal-close]');
    if (closer) {
        var modal2 = closer.closest('.modModal');
        if (modal2) closeModal(modal2);
    }
});

document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;

    var openModals = document.querySelectorAll('.modModal.open');
    if (openModals.length) {
        openModals.forEach(function (el) { closeModal(el); });
        return;
    }

    // (2026-10-19 접근성) 모달이 없으면 열려 있는 툴팁·모바일 메뉴·드롭다운(작성항목/제출상태)을 Esc로 닫고,
    // 포커스가 그 안에 있었다면 연 버튼으로 되돌린다.
    var active = document.activeElement;
    function closeAndReturn(container, triggerSel, closeFn) {
        var trigger = container.querySelector(triggerSel) || document.querySelector(triggerSel);
        var hadFocus = container.contains(active);
        closeFn(container);
        if (hadFocus && trigger) trigger.focus();
    }
    document.querySelectorAll('.comTooltip.open').forEach(function (el) {
        closeAndReturn(el, '[data-tooltip-trigger]', function (t) { setTooltipOpen(t, false); });
    });
    document.querySelectorAll('.hdMobileMenu.open').forEach(function (el) {
        closeMobileMenu(el, true);
    });
    document.querySelectorAll('.comInPageNav.open').forEach(function (el) {
        closeAndReturn(el, '[data-nav-select-trigger]', closeNavSelect);
    });
    document.querySelectorAll('.comSubmitState.open').forEach(function (el) {
        closeAndReturn(el, '.stateBtn', function (s) {
            s.classList.remove('open');
            var b = s.querySelector('.stateBtn');
            if (b) b.setAttribute('aria-expanded', 'false');
        });
    });
});

/* 모달 스크롤바 : 화살표 버튼 없이 트랙(.modalScrollTrack)과 썸(.modalScrollThumb)만 있는 전용 스크롤바.
   .modalBody의 스크롤 위치에 맞춰 썸의 높이/위치를 계산하고, 썸을 드래그하면 본문이 스크롤된다. */
function setupModalScroll(wrap) {
    var body = wrap.querySelector('.modalBody');
    if (!body) return;

    var scrollEl = wrap.querySelector('.modalScroll');
    if (!scrollEl) {
        scrollEl = document.createElement('div');
        scrollEl.className = 'modalScroll';
        scrollEl.innerHTML = '<div class="modalScrollTrack"><div class="modalScrollThumb"></div></div>';
        wrap.appendChild(scrollEl);

        var thumb = scrollEl.querySelector('.modalScrollThumb');
        thumb.addEventListener('mousedown', function (e) {
            e.preventDefault();
            var startY = e.clientY;
            var startScrollTop = body.scrollTop;
            var trackHeight = scrollEl.querySelector('.modalScrollTrack').clientHeight;
            var thumbHeight = thumb.clientHeight;
            var scrollable = body.scrollHeight - body.clientHeight;

            function onMove(moveEvt) {
                var deltaY = moveEvt.clientY - startY;
                var ratio = scrollable / (trackHeight - thumbHeight || 1);
                body.scrollTop = startScrollTop + deltaY * ratio;
            }
            function onUp() {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        body.addEventListener('scroll', function () { updateModalScroll(wrap); });
        window.addEventListener('resize', function () { updateModalScroll(wrap); });
    }

    updateModalScroll(wrap);
}

function updateModalScroll(wrap) {
    var body = wrap.querySelector('.modalBody');
    var scrollEl = wrap.querySelector('.modalScroll');
    if (!body || !scrollEl) return;

    if (body.scrollHeight <= body.clientHeight) {
        scrollEl.classList.add('-hide');
        return;
    }
    scrollEl.classList.remove('-hide');

    var track = scrollEl.querySelector('.modalScrollTrack');
    var thumb = scrollEl.querySelector('.modalScrollThumb');
    var trackHeight = track.clientHeight;
    var ratio = body.clientHeight / body.scrollHeight;
    var thumbHeight = Math.max(24, ratio * trackHeight);
    var scrollable = body.scrollHeight - body.clientHeight;
    var thumbTop = scrollable > 0 ? (body.scrollTop / scrollable) * (trackHeight - thumbHeight) : 0;

    thumb.style.height = thumbHeight + 'px';
    thumb.style.top = thumbTop + 'px';
}

/* 인포박스 접기/펼치기 : [data-toggle-infobox] 클릭 시 가장 가까운 .comInfoBox.-collapsible 의 .open 토글,
   .infoBody는 hidden 속성으로 표시/숨김 (스크린리더가 접힌 내용을 읽지 않도록) */
document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-toggle-infobox]');
    if (!toggle) return;

    var box = toggle.closest('.comInfoBox');
    if (!box) return;

    var opened = box.classList.toggle('open');
    toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');

    var body = box.querySelector('.infoBody');
    if (body) body.hidden = !opened;
});

/* 개인정보 수집·이용 동의서 상세보기 접기/펼치기(myInfoPage.html) : [data-toggle-privacy] 클릭 시 가장 가까운
   .privacyConsent 의 .open 토글, .privacyConsentBody는 hidden 속성으로 표시/숨김. .comInfoBox -collapsible과 동일한 패턴. */
document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-toggle-privacy]');
    if (!toggle) return;

    var box = toggle.closest('.privacyConsent');
    if (!box) return;

    var opened = box.classList.toggle('open');
    toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');

    var body = box.querySelector('.privacyConsentBody');
    if (body) body.hidden = !opened;
});

/* In-Page-Navigation Mobile select 트리거 초기화 : 현재 선택된 항목(li.on)의 텍스트를 트리거 라벨에 그대로 반영하고,
   그 항목 링크에는 aria-current="page"를 붙인다(페이지마다 트리거 라벨을 따로 하드코딩하지 않기 위함). */
document.querySelectorAll('.comInPageNav').forEach(function (nav) {
    var activeLink = nav.querySelector('ul li.on > a');
    if (!activeLink) return;

    activeLink.setAttribute('aria-current', 'page');

    var trigger = nav.querySelector('.navSelect');
    var label = trigger && trigger.querySelector('span:first-child');
    var text = activeLink.querySelector('.navItemText');
    if (label && text) label.textContent = text.textContent.replace(/\s+/g, ' ').trim();
});

/* In-Page-Navigation Mobile select형 드롭다운 : [data-nav-select-trigger] 클릭 시 가장 가까운 .comInPageNav 에 open 클래스 토글
   (.comTooltip/.hdMobileMenu와 동일한 패턴 - 바깥을 클릭하거나 옵션을 선택하면 닫힌다).
   드롭다운(<ul>)은 아래 navFoot 등 콘텐츠를 밀어내지 않고 그 위를 덮어야 해서 position:absolute로 띄우는데,
   트리거 라벨 길이에 따라 1~2줄로 높이가 달라질 수 있어 CSS 고정값 대신 열릴 때마다 실제 좌표를 재서 top을 맞춘다. */
function closeNavSelect(nav) {
    nav.classList.remove('open');
    var btn = nav.querySelector('[data-nav-select-trigger]');
    if (btn) btn.setAttribute('aria-expanded', 'false');
}

function openNavSelect(nav, trigger) {
    var ul = nav.querySelector(':scope > ul');
    if (ul) {
        var navTop = nav.getBoundingClientRect().top;
        var triggerBottom = trigger.getBoundingClientRect().bottom;
        ul.style.top = (triggerBottom - navTop) + 'px';
    }

    nav.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
}

document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-nav-select-trigger]');
    if (trigger) {
        var nav = trigger.closest('.comInPageNav');
        if (!nav) return;

        var wasOpen = nav.classList.contains('open');

        document.querySelectorAll('.comInPageNav.open').forEach(closeNavSelect);

        if (!wasOpen) {
            openNavSelect(nav, trigger);
        }
        return;
    }

    if (!e.target.closest('.comInPageNav')) {
        document.querySelectorAll('.comInPageNav.open').forEach(closeNavSelect);
    }
});

window.addEventListener('resize', function () {
    document.querySelectorAll('.comInPageNav.open').forEach(function (nav) {
        var trigger = nav.querySelector('[data-nav-select-trigger]');
        if (trigger) openNavSelect(nav, trigger);
    });
});

/* 로그인 탭(보조사업자/평가위원) : 클릭한 탭에 on 클래스, 나머지는 해제 */
document.addEventListener('click', function (e) {
    var tab = e.target.closest('[data-login-tab]');
    if (!tab) return;
    e.preventDefault();

    var list = tab.closest('.modTab').querySelectorAll('li');
    list.forEach(function (li) {
        li.classList.remove('on');
        var a = li.querySelector('[data-login-tab]');
        if (a) a.removeAttribute('aria-current');
    });
    tab.closest('li').classList.add('on');
    // (2026-10-19 접근성) 선택된 이용자 구분을 스크린리더에 알린다(시각적 on 클래스만으로는 전달되지 않음)
    tab.setAttribute('aria-current', 'true');
});

document.querySelectorAll('.modTab li.on > [data-login-tab]').forEach(function (a) {
    a.setAttribute('aria-current', 'true');
});

/* 탭 패널 전환(현장 평가결과 회차 탭 등) : [data-tab-target]="패널아이디" 클릭 시 같은 .modTab 안에서 클릭한 탭에 on 클래스,
   같은 탭 목록의 다른 탭이 가리키는 패널은 hidden 처리하고 클릭한 탭의 패널만 보여준다. */
document.addEventListener('click', function (e) {
    var tab = e.target.closest('[data-tab-target]');
    if (!tab) return;
    e.preventDefault();

    activateTab(tab);
});

function activateTab(tab) {
    tab.closest('.modTab').querySelectorAll('[data-tab-target]').forEach(function (item) {
        var isActive = item === tab;
        var panel = document.getElementById(item.getAttribute('data-tab-target'));
        item.closest('li').classList.toggle('on', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
        // (2026-10-19 접근성) WAI-ARIA 탭 패턴 : 선택된 탭만 Tab 키로 들어오고(roving tabindex), 탭 사이 이동은 방향키로 한다
        item.setAttribute('tabindex', isActive ? '0' : '-1');
        if (panel) panel.hidden = !isActive;
    });
}

document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    list.querySelectorAll('[data-tab-target]').forEach(function (item) {
        item.setAttribute('tabindex', item.getAttribute('aria-selected') === 'true' ? '0' : '-1');
    });
});

/* (2026-10-19 접근성) 탭 키보드 조작 : ←/→ 이전·다음 탭, Home/End 처음·마지막 탭으로 이동하며 바로 전환한다. */
document.addEventListener('keydown', function (e) {
    var tab = e.target.closest('[role="tab"][data-tab-target]');
    if (!tab) return;
    var tabs = Array.prototype.slice.call(tab.closest('[role="tablist"]').querySelectorAll('[role="tab"][data-tab-target]'));
    var i = tabs.indexOf(tab), next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') next = tabs[0];
    else if (e.key === 'End') next = tabs[tabs.length - 1];
    if (!next) return;
    e.preventDefault();
    activateTab(next);
    next.focus();
});

/* 새 창 팝업 : [data-popup-open]="창이름" 링크 클릭 시 href를 지정 크기(data-popup-size="가로,세로", 기본 1200,800)의
   새 창으로 연다(같은 창이름이면 기존 창을 재사용). 팝업 차단 등으로 열리지 않으면 링크 기본 동작(target=_blank)을 그대로 둔다.
   [data-popup-close] 클릭 시 현재 창을 닫는다(팝업 페이지의 닫기 X / 확인 버튼). */
document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-popup-open]');
    if (opener) {
        var size = (opener.getAttribute('data-popup-size') || '1200,800').split(',');
        var width = Math.min(parseInt(size[0], 10), screen.availWidth);
        var height = Math.min(parseInt(size[1], 10), screen.availHeight);
        var left = Math.max(0, Math.round((screen.availWidth - width) / 2));
        var top = Math.max(0, Math.round((screen.availHeight - height) / 2));
        var popup = window.open(opener.href, opener.getAttribute('data-popup-open') || '_blank',
            'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',scrollbars=yes,resizable=yes');
        if (popup) {
            e.preventDefault();
            popup.focus();
        }
        return;
    }

    if (e.target.closest('[data-popup-close]')) {
        e.preventDefault();
        window.close();
    }
});

/* 체크박스 : data-indeterminate 속성이 있으면 부분선택(-) 상태로 초기화 */
document.querySelectorAll('.cptForm [data-indeterminate]').forEach(function (el) {
    el.indeterminate = true;
});

/* 텍스트 인풋 : 눈 모양 아이콘 클릭 시 비밀번호 표시/숨김 전환 */
document.addEventListener('click', function (e) {
    var eyeIco = e.target.closest('.iptText .box .ico');
    if (!eyeIco) return;

    var input = eyeIco.closest('.box').querySelector('input');
    if (!input || (input.type !== 'password' && input.type !== 'text')) return;

    var hidden = input.type === 'password';
    input.type = hidden ? 'text' : 'password';
    eyeIco.classList.toggle('-hide', hidden);
});

/* 텍스트 영역 : 입력 글자수 카운터 갱신 */
document.querySelectorAll('.cptForm .iptTextarea textarea').forEach(function (textarea) {
    var counterNum = textarea.closest('.iptTextarea').querySelector('.counter strong');
    if (!counterNum) return;

    textarea.addEventListener('input', function () {
        counterNum.textContent = textarea.value.length;
    });
});

/* 파일 업로드
   - 기본형 : [data-upload-list] 안에 파일들이 쌓이고, 맨 끝의 .uploadItem.-find(파일선택 CTA) 앞에 새 파일이 계속 삽입된다.
   - 슬롯형([data-upload-slots]) : 슬롯(.uploadSlot) 하나당 파일 1개. 파일을 선택하면 그 슬롯의 -find 행이 완료된 파일 행으로 바뀌고,
     그 슬롯이 마지막 슬롯이었다면 다음 번호의 빈 슬롯을 자동으로 추가한다.
   전체 파일 삭제 버튼으로 기본형 목록을 한번에 비울 수 있다(-find 행은 남긴다). */
// (2026-10-19) 파일 이름은 사용자가 정한 값이라 HTML로 해석되지 않도록 이스케이프한다(파일명에 태그가 들어있어도 글자 그대로 표시)
function escapeHtml(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function uploadFileRow(fileName) {
    var li = document.createElement('li');
    li.className = 'uploadItem';
    li.innerHTML = '<p class="fileName">' + escapeHtml(fileName) + '</p><span class="uploadSpinner"></span>';
    return li;
}

// (2026-10-19 접근성) "삭제" 버튼이 파일마다 같은 이름으로만 읽혀 어느 파일을 지우는지 알 수 없었다 -
// aria-label에 파일 이름을 붙여 "위임장.hwp 삭제"처럼 읽히게 한다(화면에 보이는 글자는 그대로 "삭제").
function uploadFileDoneMarkup(fileName) {
    var name = escapeHtml(fileName);
    return '<p class="fileName">' + name + '</p>' +
           '<div class="actions"><button type="button" class="-remove" aria-label="' + name + ' 삭제">삭제<span class="ico"></span></button></div>';
}

// 페이지에 미리 그려져 있는 파일 행의 "삭제" 버튼도 같은 방식으로 이름을 붙인다(.fileName 글자 기준)
document.querySelectorAll('.formUpload .uploadItem .-remove').forEach(function (btn) {
    if (btn.hasAttribute('aria-label')) return;
    var nameEl = btn.closest('.uploadItem').querySelector('.fileName');
    if (nameEl) btn.setAttribute('aria-label', nameEl.textContent.replace(/\s+/g, ' ').trim() + ' 삭제');
});

function uploadFindMarkup() {
    return '<li class="uploadItem -find"><button type="button" class="uploadFindBtn" data-upload-trigger><span class="ico"></span>파일선택</button></li>';
}

function addUploadSlot(slotsWrap) {
    var index = slotsWrap.querySelectorAll('.uploadSlot').length + 1;
    var slot = document.createElement('div');
    slot.className = 'uploadSlot';
    slot.setAttribute('data-upload-slot', '');
    slot.innerHTML = '<p class="slotLabel">첨부파일' + index + '</p>' +
                      '<ul class="uploadList" data-upload-list>' + uploadFindMarkup() + '</ul>' +
                      '<input type="file" hidden data-upload-input>';
    slotsWrap.appendChild(slot);
    return slot;
}

document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-upload-trigger]');
    if (trigger) {
        var scope = trigger.closest('.uploadSlot') || trigger.closest('.uploadGroup');
        var fileInput = scope && scope.querySelector('[data-upload-input]');
        if (fileInput) fileInput.click();
        return;
    }

    var removeBtn = e.target.closest('.formUpload .-remove');
    if (removeBtn) {
        var item = removeBtn.closest('.uploadItem');
        var slotOfItem = item && item.closest('.uploadSlot');
        if (item) item.remove();

        // 슬롯형에서 파일을 지우면 그 자리에 파일선택 CTA를 다시 채워 넣는다
        if (slotOfItem) {
            var slotList = slotOfItem.querySelector('[data-upload-list]');
            if (slotList && !slotList.querySelector('.uploadItem')) {
                slotList.insertAdjacentHTML('beforeend', uploadFindMarkup());
            }
        }
        return;
    }

    var clearAllBtn = e.target.closest('[data-upload-clear-all]');
    if (clearAllBtn) {
        var list = clearAllBtn.closest('.formUpload').querySelector('[data-upload-list]');
        if (list) {
            list.querySelectorAll('.uploadItem:not(.-find)').forEach(function (el) { el.remove(); });
        }
    }
});

document.addEventListener('change', function (e) {
    var fileInput = e.target.closest('[data-upload-input]');
    if (!fileInput) return;

    var slot = fileInput.closest('.uploadSlot');

    if (slot) {
        // 슬롯형 : 슬롯 하나당 파일 1개 - 선택한 파일로 -find 행을 대체한다
        var file = fileInput.files[0];
        if (!file) return;

        var slotList = slot.querySelector('[data-upload-list]');
        slotList.innerHTML = '';
        var row = uploadFileRow(file.name);
        slotList.appendChild(row);

        setTimeout(function () {
            row.innerHTML = uploadFileDoneMarkup(file.name);
        }, 900);

        // 파일을 담은 슬롯이 마지막 슬롯이면 다음 빈 슬롯을 추가한다
        var slotsWrap = slot.closest('[data-upload-slots]');
        var slots = slotsWrap.querySelectorAll('.uploadSlot');
        if (slots[slots.length - 1] === slot) {
            addUploadSlot(slotsWrap);
        }
    } else {
        // 기본형 : 맨 끝의 파일선택 CTA(.uploadItem.-find) 앞에 새 파일들을 계속 끼워 넣는다
        var list = fileInput.closest('.uploadGroup').querySelector('[data-upload-list]');
        var findRow = list.querySelector('.uploadItem.-find');

        Array.prototype.forEach.call(fileInput.files, function (file) {
            var row2 = uploadFileRow(file.name);
            if (findRow) list.insertBefore(row2, findRow); else list.appendChild(row2);

            setTimeout(function () {
                row2.innerHTML = uploadFileDoneMarkup(file.name);
            }, 900);
        });
    }

    fileInput.value = '';
});

/* 페이지 로더 : 실제 코드에서는 Loader.show()/Loader.hide()로 켜고 끈다.
   가이드에서는 [data-loader-open]="아이디" 버튼으로 데모를 확인할 수 있다. */
var Loader = {
    show: function (id) {
        var loader = id ? document.getElementById(id) : document.querySelector('.comLoader');
        if (loader) {
            loader.classList.add('open');
            document.body.classList.add('noScrl');
        }
    },
    hide: function (id) {
        var loader = id ? document.getElementById(id) : document.querySelector('.comLoader');
        if (loader) {
            loader.classList.remove('open');
            document.body.classList.remove('noScrl');
        }
    }
};

document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-loader-open]');
    if (opener) {
        var loaderId = opener.getAttribute('data-loader-open');
        Loader.show(loaderId);

        // data-loader-auto-hide(ms) : 가이드 데모에서 로딩이 끝나는 상황을 흉내내기 위한 것. 실제 사용시엔 필요 없다.
        var autoHide = opener.getAttribute('data-loader-auto-hide');
        if (autoHide) {
            setTimeout(function () { Loader.hide(loaderId); }, parseInt(autoHide, 10));
        }
        return;
    }

    var closer = e.target.closest('[data-loader-close]');
    if (closer) {
        Loader.hide(closer.getAttribute('data-loader-close'));
    }
});

// [보류] 평가사업 상세 In-Page-Navigation 탭 전환(JS show/hide) 스크립트.
// 기획 변경으로 우측 목록 항목(작성항목)마다 별도 페이지(business/detail01.html, detail02.html ...)로 분리하는 방식으로 바뀌어서
// 현재는 사용하지 않는다. 기획이 다시 "한 페이지 안에서 탭으로 전환"하는 방식으로 돌아올 수도 있어 삭제하지 않고 주석으로만 남겨둔다.
// (활성화하려면: .inputBox들을 다시 한 페이지 안에 hidden 속성과 함께 넣고 아래 주석을 해제하면 된다)
//
// document.querySelectorAll('.cptBusinessDetail').forEach(function (page) {
//     var nav = page.querySelector('.comInPageNav');
//     if (!nav) return;
//
//     var links = nav.querySelectorAll('a[href^="#"]');
//     var boxes = page.querySelectorAll('.bizContentMain > .inputBox');
//
//     function activate(id) {
//         boxes.forEach(function (box) {
//             box.hidden = box.id !== id;
//         });
//         links.forEach(function (link) {
//             var isActive = link.getAttribute('href') === '#' + id;
//             link.parentElement.classList.toggle('on', isActive);
//
//             // 현재 선택된 항목의 상태 아이콘만 체크(완료) 표시로 옮기고, 나머지는 원래(미작성) 상태로 되돌린다.
//             var status = link.querySelector('.navStatus');
//             if (status) status.classList.toggle('-done', isActive);
//         });
//     }
//
//     var initialLink = nav.querySelector('li.on > a[href^="#"]');
//     var initialId = initialLink ? initialLink.getAttribute('href').slice(1) : (boxes[0] && boxes[0].id);
//     if (initialId) activate(initialId);
//
//     links.forEach(function (link) {
//         link.addEventListener('click', function (e) {
//             e.preventDefault();
//             activate(link.getAttribute('href').slice(1));
//         });
//     });
// });

/* .dataTable 반복 행 추가/삭제 (예 : 평가사업 상세 - 예산집행계획의 비목/세목/세세목/금액 표)
   추가 : dataTableFoot의 버튼을 누르면 그 표의 마지막 .dataTableRow를 복제해서 새 행을 만든다(입력값은 비우고, id/label for는 새로 발급해서 중복을 피한다).
   삭제 : 행의 "행 삭제" 버튼을 누르면 그 행을 지운다. 단, 표에 행이 1개만 남았을 때는 지우지 않는다(빈 표 방지). */
document.addEventListener('click', function (e) {
    var addBtn = e.target.closest('.dataTable > .dataTableFoot .btn');
    if (addBtn) {
        e.preventDefault();

        var table = addBtn.closest('.dataTable');
        var rows = table.querySelectorAll(':scope > .dataTableRow');
        var lastRow = rows[rows.length - 1];
        if (!lastRow) return;

        var newRow = lastRow.cloneNode(true);
        var seq = 'r' + Date.now();
        newRow.querySelectorAll('.iptText, .iptTextarea').forEach(function (field, i) {
            var input = field.querySelector('input, textarea');
            var label = field.querySelector('label');
            if (!input) return;
            input.value = '';
            if (label) {
                var newId = seq + '_' + i;
                input.id = newId;
                label.setAttribute('for', newId);
            }
        });

        table.querySelector(':scope > .dataTableFoot').before(newRow);
        return;
    }

    var delBtn = e.target.closest('.dataTable > .dataTableRow .dataTableAction button[aria-label="행 삭제"]');
    if (delBtn) {
        e.preventDefault();

        var row = delBtn.closest('.dataTableRow');
        var ownerTable = row && row.closest('.dataTable');
        if (!ownerTable) return;

        var siblingRows = ownerTable.querySelectorAll(':scope > .dataTableRow');
        if (siblingRows.length <= 1) return;

        row.remove();
    }
});

/* 달력(Calendar) : common/js/tui-date-picker.js(TOAST UI DatePicker)로 실제 달력을 그린다.
   라이브러리 기본 헤더(제목 하나 + 이전/다음)는 감추고(_comCalendar.scss), 연도/월을 각각 따로 고를 수 있는
   드롭다운 헤더(.calHead)를 직접 만들어 얹는다 - .comInPageNav의 select형 드롭다운과 동일한 열기/닫기 패턴.
   [data-cal-init]가 붙은 .comCalendar마다 하나씩 인스턴스를 만들어 그 안의 [data-cal-body]에 그리고,
   인스턴스는 나중에 버튼 클릭 핸들러에서 다시 찾을 수 있도록 그 루트 엘리먼트에 보관해 둔다(el._datepicker). */
function calYearListMarkup(centerYear) {
    var html = '';
    for (var y = centerYear + 6; y >= centerYear - 6; y -= 1) {
        html += '<li><button type="button" data-cal-year="' + y + '">' + y + '년</button></li>';
    }
    return html;
}

function calMonthListMarkup() {
    var html = '';
    for (var m = 1; m <= 12; m += 1) {
        html += '<li><button type="button" data-cal-month="' + m + '">' + m + '월</button></li>';
    }
    return html;
}

function calSyncTitle(root, date) {
    var yearTxt = root.querySelector('[data-cal-select="year"] .txt');
    var monthTxt = root.querySelector('[data-cal-select="month"] .txt');
    if (yearTxt) yearTxt.textContent = date.getFullYear() + '년';
    if (monthTxt) monthTxt.textContent = (date.getMonth() + 1) + '월';

    // 연도 목록은 "현재 보이는 연도 ±6년" 범위라 달이 바뀌어도 상관없지만, 연도 자체가 바뀌면
    // 범위 전체를 다시 그려야 한다(그래야 새 기준 연도로 스크롤 없이 바로 보인다).
    var yearList = root.querySelector('[data-cal-select="year"] .calSelectList');
    if (yearList) {
        yearList.innerHTML = calYearListMarkup(date.getFullYear());
    }

    root.querySelectorAll('[data-cal-year]').forEach(function (btn) {
        btn.classList.toggle('on', parseInt(btn.getAttribute('data-cal-year'), 10) === date.getFullYear());
    });
    root.querySelectorAll('[data-cal-month]').forEach(function (btn) {
        btn.classList.toggle('on', parseInt(btn.getAttribute('data-cal-month'), 10) === date.getMonth() + 1);
    });
}

function calCloseSelects(scope) {
    scope.querySelectorAll('.calSelect.open').forEach(function (el) {
        el.classList.remove('open');
        var btn = el.querySelector('.calSelectBtn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    });
}

/* 인풋 + 팝오버 달력 : [data-cal-field]로 인풋(.iptDate, [data-cal-input])과 .comCalendar를 함께 묶어 두면
   인풋을 포커스/클릭했을 때 그 아래로 달력이 펼쳐진다(.calField에 open 클래스만 토글, 실제 표시는
   _comCalendar.scss의 ".calField .comCalendar"/"&.open .comCalendar"가 처리). */
function calOpenField(field) {
    if (!field) return;
    document.querySelectorAll('.calField.open').forEach(function (el) {
        if (el !== field) el.classList.remove('open');
    });

    // 팝오버 위치는 .calField 전체 높이(top:100%) 대신, 매번 인풋 박스(.box) 바로 아래 좌표를 다시 재서
    // px로 고정한다 - .comInPageNav의 navSelect 드롭다운(openNavSelect)과 동일한 이유·방식이다.
    // .box 아래 안내 메시지(.msg)는 포커스 여부에 따라 보였다 안 보였다 하며 .calField의 전체 높이를
    // 흔든다. top:100%로 두면 달력의 날짜를 클릭하는 바로 그 순간(mousedown이 인풋을 blur시켜 메시지가
    // 사라짐) 팝오버가 위로 튀어버려서, 뒤이은 mouseup/click 좌표가 엉뚱한 곳(td가 아니라 tbody 등)에
    // 떨어지는 문제가 있었다(실제로 겪은 버그 - 클릭해도 날짜가 선택되지 않았다).
    var calendar = field.querySelector('.comCalendar');
    var box = field.querySelector('.box');
    if (calendar && box) {
        var fieldTop = field.getBoundingClientRect().top;
        var boxBottom = box.getBoundingClientRect().bottom;
        calendar.style.top = (boxBottom - fieldTop + 8) + 'px';
    }

    field.classList.add('open');
}

function calCloseField(field) {
    if (field) field.classList.remove('open');
}

// "YYYY-MM-DD" / "YYYY.MM.DD" 형식의 문자열을 Date로 바꾼다 (확인 버튼이 인풋에 채워주는 형식과 동일 +
// 점(.) 구분 표기도 함께 지원). 형식이 안 맞으면 null.
function calParseDateValue(value) {
    var m = /^(\d{4})[-.](\d{2})[-.](\d{2})$/.exec(String(value || '').trim());
    if (!m) return null;

    var date = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    return isNaN(date.getTime()) ? null : date;
}

// 실 사용 페이지처럼 마크업이 처음부터 DOM에 있는 경우를 위한 초기화 함수.
// 퍼블리싱 가이드(guide.html)는 이 마크업을 jQuery.load()로 나중에 끼워 넣으므로(common.js는 그 전에
// 이미 한 번 실행이 끝난 상태) 아래 자동 실행 루프만으로는 잡히지 않는다 - 그래서 window에 노출해 두고,
// 가이드 페이지(comCalendar.html) 자신의 <script>가 삽입 직후 직접 한 번 더 불러준다(run()과 동일한 방식).
function initComCalendar(root) {
    if (root._datepicker) return; // 이미 초기화된 인스턴스는 다시 만들지 않는다

    var body = root.querySelector('[data-cal-body]');
    if (!body || !window.tui || !window.tui.DatePicker) return;

    // date 옵션은 일부러 안 준다 - 여기 주면 그 날짜가 "선택됨" 상태로도 잡혀서(tui.DatePicker#setDate와 동일),
    // 아무것도 고르지 않았는데 오늘 날짜에 파란 원이 미리 표시되고 인풋도 비어 있는데 확인을 누르면
    // 오늘 날짜가 그대로 들어가 버린다. date를 생략(=null)하면 선택 없이 달력 화면만 오늘이 속한 달로 뜬다
    // (내부 Calendar 컴포넌트 자체 기본값이 항상 오늘 달을 보여주기 때문).
    var datepicker = new tui.DatePicker(body, {
        language: 'ko',
        showToday: false,
        showJumpButtons: false,
        weekStartDay: 'Mon',
        showAlways: true
    });
    root._datepicker = datepicker;

    // 이 달력이 인풋(.calField)에 묶여 있고 그 인풋에 이미 값이 있으면(예: Completed 상태), 그 날짜를
    // 미리 선택된 상태로 시작한다 - silent(두 번째 인자 true)로 넘겨 'change' 이벤트는 터뜨리지 않는다.
    var field = root.closest('[data-cal-field]');
    var boundInput = field && field.querySelector('[data-cal-input]');
    if (boundInput && boundInput.value) {
        var initialDate = calParseDateValue(boundInput.value);
        if (initialDate) datepicker.setDate(initialDate, true);
    }

    var monthList = root.querySelector('[data-cal-select="month"] .calSelectList');
    if (monthList) monthList.innerHTML = calMonthListMarkup();

    calSyncTitle(root, datepicker._calendar.getDate());

    // prev/next 버튼, 연도/월 드롭다운 선택, 오늘 이동 등 화면이 다시 그려질 때마다 상단 라벨을 갱신한다
    // (달력 렌더 자체를 바꾸는 방법은 여러 갈래지만 갱신 지점은 이 draw 이벤트 하나로 전부 모인다).
    datepicker._calendar.on('draw', function (ev) {
        calSyncTitle(root, ev.date);
        calEnhanceGrid(root);
    });
    datepicker.on('change', function () { calEnhanceGrid(root); });
    calEnhanceGrid(root);
}

/* (20261022 감리대응 - 접근성, 사용자 지시) 달력 날짜 칸 키보드 조작 - TOAST UI가 그리는 날짜 칸은 <td>라 Tab 초점이 들어가지 않았다.
   WAI-ARIA 날짜 선택(그리드) 패턴으로 보완한다 :
   - Tab 초점은 날짜 칸 중 하나에만 들어간다(roving tabindex - 선택된 날 > 오늘 > 1일 순). 나머지 칸은 tabindex=-1.
   - ←/→ 하루, ↑/↓ 일주일, Home/End 그 주의 처음(월)/끝(일), PageUp/PageDown 이전/다음 달 같은 날. 달이 넘어가면 그 달을 그리고 이어서 초점 이동.
   - Enter/Space : 그 날짜 선택(마우스 클릭과 동일), Esc : 달력을 닫고 날짜 인풋으로 초점 복귀.
   - 각 칸에 "2026년 10월 15일 목요일(, 선택됨 / 오늘)" 이름을 붙여 화면낭독기가 읽게 한다. 이전·다음 달 칸(화면에 표시 안 됨)은 초점 대상에서 뺀다.
   달력은 월을 바꿀 때마다 칸을 새로 그리므로 draw/change 때마다 다시 적용한다. */
var CAL_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function calDateKey(date) {
    return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
}

function calCellDate(td) {
    return new Date(parseInt(td.getAttribute('data-timestamp'), 10));
}

function calEnhanceGrid(root) {
    var datepicker = root._datepicker;
    if (!datepicker) return;

    var shown = datepicker._calendar.getDate();
    var selected = datepicker.getDate();
    var today = new Date();
    var caption = root.querySelector('.tui-calendar-body-inner caption span');
    if (caption) caption.textContent = shown.getFullYear() + '년 ' + (shown.getMonth() + 1) + '월 날짜 선택';

    var cells = Array.prototype.slice.call(root.querySelectorAll('td.tui-calendar-date'));
    var focusKey = root._calFocusKey;
    var target = null, fallbackToday = null, fallbackFirst = null, fallbackSelected = null;

    cells.forEach(function (td) {
        var d = calCellDate(td);
        var other = td.classList.contains('tui-calendar-prev-month') || td.classList.contains('tui-calendar-next-month');
        td.setAttribute('tabindex', '-1');
        if (other) {
            td.removeAttribute('aria-label');
            td.setAttribute('aria-hidden', 'true');
            return;
        }
        td.removeAttribute('aria-hidden');
        var isSelected = selected && calDateKey(selected) === calDateKey(d);
        var isToday = calDateKey(today) === calDateKey(d);
        td.setAttribute('aria-label', d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + CAL_WEEKDAYS[d.getDay()] + '요일' + (isSelected ? ', 선택됨' : '') + (isToday ? ', 오늘' : ''));
        if (focusKey && focusKey === calDateKey(d)) target = td;
        if (isSelected) fallbackSelected = td;
        if (isToday) fallbackToday = td;
        if (d.getDate() === 1) fallbackFirst = td;
    });

    var rovingCell = target || fallbackSelected || fallbackToday || fallbackFirst;
    if (rovingCell) rovingCell.setAttribute('tabindex', '0');

    // 키보드 이동 중 달이 바뀌어 다시 그려진 경우 : 이어서 그 날짜 칸으로 초점을 옮긴다
    if (target) {
        root._calFocusKey = null;
        target.focus();
    }
}

document.addEventListener('keydown', function (e) {
    // Esc : 달력 안 어디에 초점이 있든(날짜 칸·이전/다음 달·확인 버튼 등) 달력을 닫고 날짜 인풋으로 초점을 돌려준다
    var openField = e.key === 'Escape' && e.target.closest && e.target.closest('.calField.open');
    if (openField && e.target.closest('.comCalendar')) {
        e.preventDefault();
        e.stopPropagation();
        var escInput = openField.querySelector('[data-cal-input]');
        if (escInput) escInput.focus();
        calCloseField(openField);   // 인풋 포커스(focusin)로 다시 열린 것까지 닫는다
        return;
    }

    var td = e.target.closest && e.target.closest('.comCalendar td.tui-calendar-date');
    if (!td) return;

    var root = td.closest('.comCalendar');
    var datepicker = root._datepicker;
    var d = calCellDate(td);
    var next = null;

    switch (e.key) {
        case 'ArrowLeft': next = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1); break;
        case 'ArrowRight': next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1); break;
        case 'ArrowUp': next = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7); break;
        case 'ArrowDown': next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7); break;
        case 'Home': next = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7)); break;   // 월요일 시작
        case 'End': next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + (6 - (d.getDay() + 6) % 7)); break;
        case 'PageUp':
        case 'PageDown': {
            var step = e.key === 'PageUp' ? -1 : 1;
            var lastDay = new Date(d.getFullYear(), d.getMonth() + step + 1, 0).getDate();
            next = new Date(d.getFullYear(), d.getMonth() + step, Math.min(d.getDate(), lastDay));
            break;
        }
        case 'Enter':
        case ' ':
            e.preventDefault();
            root._calFocusKey = calDateKey(d);   // 선택 후 다시 그려져도 같은 칸에 초점 유지
            datepicker.setDate(d);
            calEnhanceGrid(root);
            return;
        default: return;
    }

    e.preventDefault();
    var shown = datepicker._calendar.getDate();
    if (next.getFullYear() === shown.getFullYear() && next.getMonth() === shown.getMonth()) {
        var cell = Array.prototype.find.call(root.querySelectorAll('td.tui-calendar-date'), function (c) {
            return !c.classList.contains('tui-calendar-prev-month') && !c.classList.contains('tui-calendar-next-month') && calDateKey(calCellDate(c)) === calDateKey(next);
        });
        if (cell) {
            root.querySelectorAll('td.tui-calendar-date[tabindex="0"]').forEach(function (c) { c.setAttribute('tabindex', '-1'); });
            cell.setAttribute('tabindex', '0');
            cell.focus();
        }
    } else {
        root._calFocusKey = calDateKey(next);
        datepicker._calendar.draw({ date: new Date(next.getFullYear(), next.getMonth(), 1) });
    }
}, true);
window.initComCalendar = initComCalendar;

document.querySelectorAll('[data-cal-init]').forEach(initComCalendar);

/* 연도/월 드롭다운 열기/닫기 : .comInPageNav의 navSelect와 동일한 패턴(바깥을 클릭하면 닫힌다) */
document.addEventListener('click', function (e) {
    var selectBtn = e.target.closest('.calSelectBtn');
    if (selectBtn) {
        var select = selectBtn.closest('.calSelect');
        var root = select.closest('.comCalendar');
        var wasOpen = select.classList.contains('open');

        calCloseSelects(root);

        if (!wasOpen) {
            select.classList.add('open');
            selectBtn.setAttribute('aria-expanded', 'true');
        }
        return;
    }

    if (!e.target.closest('.calSelect')) {
        document.querySelectorAll('.comCalendar').forEach(calCloseSelects);
    }
});

/* (20261022 감리대응 - 사용자 지시) 숫자 입력 날짜 : [data-cal-input][data-cal-numeric] 인풋은 숫자만 입력되고(숫자 외 글자는 입력 즉시 제거),
   입력하는 대로 YYYY-MM-DD 형태로 자동 변환된다(2026 → 2026, 202610 → 2026-10, 20261015 → 2026-10-15).
   8자리가 다 들어오고 실제 있는 날짜이면(예 : 2026-02-30 같은 없는 날짜는 제외) 같은 필드의 달력에서도 그 날짜를 선택해 그 달을 보여준다.
   달력의 "확인"을 누르지 않아도 인풋 값은 이미 확정 형식(YYYY-MM-DD)이라 그대로 전송된다. */
function calFormatDigits(digits) {
    if (digits.length > 6) return digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6);
    if (digits.length > 4) return digits.slice(0, 4) + '-' + digits.slice(4);
    return digits;
}

document.addEventListener('input', function (e) {
    var input = e.target.closest('[data-cal-input][data-cal-numeric]');
    if (!input) return;

    var digits = input.value.replace(/\D/g, '').slice(0, 8);
    var formatted = calFormatDigits(digits);
    if (input.value !== formatted) input.value = formatted;

    if (digits.length !== 8) return;

    var date = calParseDateValue(formatted);
    // new Date(2026, 1, 30)은 3월 2일로 넘어가므로, 입력한 연·월·일이 그대로인지 확인해 없는 날짜는 걸러낸다
    var valid = date && date.getFullYear() === parseInt(digits.slice(0, 4), 10)
        && date.getMonth() + 1 === parseInt(digits.slice(4, 6), 10)
        && date.getDate() === parseInt(digits.slice(6, 8), 10);
    if (!valid) return;

    var field = input.closest('[data-cal-field]');
    var root = field && field.querySelector('.comCalendar');
    if (root && root._datepicker) {
        root._datepicker.setDate(date);
        calOpenField(field);
    }
});

/* 인풋을 포커스하면(클릭도 포커스를 동반하므로 이 하나로 "포커스/클릭 시 열기"가 모두 처리된다) 그 달력을 연다.
   focusin은 click과 달리 버블링되어 document에서 위임 처리할 수 있다. */
document.addEventListener('focusin', function (e) {
    var input = e.target.closest('[data-cal-input]');
    if (input) calOpenField(input.closest('[data-cal-field]'));
});

/* 달력 아이콘 등 [data-cal-open]을 클릭해도 열리고, 필드 바깥을 클릭하면 닫힌다
   (.comTooltip/.comInPageNav의 navSelect와 동일한 패턴). */
document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-cal-open]');
    if (opener) {
        calOpenField(opener.closest('[data-cal-field]'));
        return;
    }

    if (!e.target.closest('[data-cal-field]')) {
        document.querySelectorAll('.calField.open').forEach(calCloseField);
    }
});

/* 이전/다음 달, 연도/월 선택, 오늘/취소/확인 버튼 동작 */
document.addEventListener('click', function (e) {
    var root = e.target.closest('.comCalendar');
    if (!root || !root._datepicker) return;

    var datepicker = root._datepicker;

    if (e.target.closest('[data-cal-prev]')) {
        datepicker._calendar.drawPrev();
        return;
    }

    if (e.target.closest('[data-cal-next]')) {
        datepicker._calendar.drawNext();
        return;
    }

    var yearBtn = e.target.closest('[data-cal-year]');
    if (yearBtn) {
        var curForYear = datepicker._calendar.getDate();
        datepicker._calendar.draw({ date: new Date(parseInt(yearBtn.getAttribute('data-cal-year'), 10), curForYear.getMonth(), 1) });
        calCloseSelects(root);
        return;
    }

    var monthBtn = e.target.closest('[data-cal-month]');
    if (monthBtn) {
        var curForMonth = datepicker._calendar.getDate();
        datepicker._calendar.draw({ date: new Date(curForMonth.getFullYear(), parseInt(monthBtn.getAttribute('data-cal-month'), 10) - 1, 1) });
        calCloseSelects(root);
        return;
    }

    if (e.target.closest('[data-cal-today]')) {
        datepicker.setDate(new Date());
        return;
    }

    // 취소 : 선택을 되돌리지 않고(setNull 하지 않고) 달력 팝오버만 닫는다.
    if (e.target.closest('[data-cal-cancel]')) {
        calCloseField(root.closest('[data-cal-field]'));
        return;
    }

    // 확인 : 선택된 날짜가 있으면 그 값을 인풋에 채우고 팝오버를 닫는다.
    if (e.target.closest('[data-cal-confirm]')) {
        var field = root.closest('[data-cal-field]');
        var input = field && field.querySelector('[data-cal-input]');
        var picked = datepicker.getDate();

        if (input && picked) {
            var pad = function (n) { return (n < 10 ? '0' : '') + n; };
            input.value = picked.getFullYear() + '-' + pad(picked.getMonth() + 1) + '-' + pad(picked.getDate());
        }

        calCloseField(field);
    }
});

/* .bizGroupList 반복 그룹 추가/삭제 (예 : 평가사업 상세 - 사업추진계획/홍보계획/사업개선계획처럼 인풋 여러 개가 한 그룹으로 반복되는 화면)
   추가 : 그룹 안 "추가" 버튼을 누르면 마지막 .bizGroupItem을 복제해서 새 그룹을 만든다(입력값 비우고, id/label for는 새로 발급).
   삭제 : 그룹 안 "삭제" 버튼을 누르면 그 그룹을 지운다. 단, 그룹이 1개만 남았을 때는 지우지 않는다. */
document.addEventListener('click', function (e) {
    var actionBtn = e.target.closest('.bizGroupItem > .inputGroupActions .btn');
    if (!actionBtn) return;
    e.preventDefault();

    var group = actionBtn.closest('.bizGroupItem');
    var list = group && group.closest('.bizGroupList');
    if (!list) return;

    if (actionBtn.querySelector('.ico.-plus')) {
        var newGroup = group.cloneNode(true);
        var seq = 'g' + Date.now();
        newGroup.querySelectorAll('.iptText, .iptTextarea').forEach(function (field, i) {
            var control = field.querySelector('input, textarea');
            var label = field.querySelector('label');
            if (!control) return;
            control.value = '';
            if (label) {
                var newId = seq + '_' + i;
                control.id = newId;
                label.setAttribute('for', newId);
            }
        });
        list.append(newGroup);
        return;
    }

    if (actionBtn.querySelector('.ico.-delete')) {
        var groups = list.querySelectorAll(':scope > .bizGroupItem');
        if (groups.length <= 1) return;
        group.remove();
    }
});

/* 제출상태(.comSubmitState.-history) 드롭다운 : 값 버튼을 누르면 이력 목록이 펼쳐진다.
   .calSelect(comCalendar)/.navSelect(comInPageNav)와 동일한 패턴 - 바깥을 클릭하면 닫힌다. */
document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.comSubmitState.-history .stateBtn');
    if (trigger) {
        var state = trigger.closest('.comSubmitState');
        var wasOpen = state.classList.contains('open');

        document.querySelectorAll('.comSubmitState.open').forEach(function (el) {
            el.classList.remove('open');
            var btn = el.querySelector('.stateBtn');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });

        if (!wasOpen) {
            state.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
        }
        return;
    }

    if (!e.target.closest('.comSubmitState')) {
        document.querySelectorAll('.comSubmitState.open').forEach(function (el) {
            el.classList.remove('open');
            var btn = el.querySelector('.stateBtn');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
    }
});

/* 나의정보관리 - 비밀번호 확인(passwordCheck.html) : 비밀번호를 한 글자도 입력하지 않은 상태에선 "확인" 버튼이
   disabled이고, #pwCheckPw에 값이 한 글자라도 입력되면 활성화된다. */
document.addEventListener('input', function (e) {
    var pwInput = e.target.closest('#pwCheckPw');
    if (!pwInput) return;

    var submitBtn = pwInput.closest('form').querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = pwInput.value.length === 0;
});

/* 나의정보관리(myInfoPage.html/myInfoPage_bojo.html) : [data-myinfo-form] 안의 수정 가능한 입력(readonly 제외
   input/select/textarea - 체크박스·라디오는 선택 항목이라 제외)이 전부 채워지기 전까지 "회원정보 수정하기" 버튼은
   disabled로 둔다. 평가분야처럼 "추가" 버튼으로 행이 늘어나는 항목도 있어 매번 새로 조회해서 판단한다. */
function updateMyInfoFormState(form) {
    var submitBtn = form.querySelector('.myInfoButtons button[type="submit"]');
    if (!submitBtn) return;

    var fields = form.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    var filled = Array.prototype.every.call(fields, function (field) {
        return field.value.trim() !== '';
    });
    submitBtn.disabled = !filled;
}

document.querySelectorAll('[data-myinfo-form]').forEach(function (form) {
    updateMyInfoFormState(form);
});

document.addEventListener('input', function (e) {
    var form = e.target.closest('[data-myinfo-form]');
    if (form) updateMyInfoFormState(form);
});

document.addEventListener('change', function (e) {
    var form = e.target.closest('[data-myinfo-form]');
    if (form) updateMyInfoFormState(form);
});

/* 로그인(login.html) : 아이디/비밀번호를 둘 다 입력하기 전까지 "로그인" 버튼은 disabled로 두고, 둘 다 값이
   채워지면 활성화한다. */
function updateLoginFormState(form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    var id = form.querySelector('#loginId');
    var pw = form.querySelector('#loginPw');
    submitBtn.disabled = !(id && pw && id.value.trim() !== '' && pw.value !== '');
}

document.querySelectorAll('.loginForm form').forEach(function (form) {
    updateLoginFormState(form);
});

document.addEventListener('input', function (e) {
    var form = e.target.closest('.loginForm form');
    if (form) updateLoginFormState(form);
});

/* (2026-10-19 추가) 이용약관 동의(member/agreeTerms.html) : [data-terms-agree]("동의" 라디오)가 전부 선택되어야
   "동의" 버튼을 활성화한다. 하나라도 "미동의"면 다시 disabled. */
function updateTermsFormState(form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    var agrees = form.querySelectorAll('[data-terms-agree]');
    var allAgreed = agrees.length > 0 && Array.prototype.every.call(agrees, function (input) { return input.checked; });
    submitBtn.disabled = !allAgreed;
}

document.querySelectorAll('[data-terms-form]').forEach(function (form) {
    updateTermsFormState(form);
});

document.addEventListener('change', function (e) {
    var form = e.target.closest('[data-terms-form]');
    if (form) updateTermsFormState(form);
});

/* (2026-09-15 추가) 개인정보동의(material/survey detail02.html) "(주관) 성명" (20261026 사용자 지시 : "(시행) 성명"도 추가) : 왼쪽 인풋에 입력한 이름을 오른쪽 회색 박스
   (.privacyNameTag)에 실시간으로 그대로 보여준다(손글씨 느낌 폰트는 -filled 클래스로 SCSS에서 적용).
   입력값이 비면 박스는 원래 placeholder 문구(data-placeholder, "성명")로 되돌아간다. */
document.addEventListener('input', function (e) {
    var input = e.target.closest('[data-name-preview-source]');
    if (!input) return;

    var target = document.getElementById(input.getAttribute('data-name-preview-target'));
    if (!target) return;

    var name = input.value.trim();
    target.textContent = name || target.getAttribute('data-placeholder') || '';
    target.classList.toggle('-filled', name !== '');
});

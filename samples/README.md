# SEIS 퍼블리싱 샘플 (정답지)

AI(바이브코딩)로 직접 퍼블리싱할 때 비교해볼 기준 자료예요. 출처는 https://seis.pub.openbricks.kr 이고, 2026-11-17 기준 원본을 그대로 가져왔어요.

## 구성

| 구분 | 마크업 | 화면 |
|---|---|---|
| 퍼블리싱 가이드 (컴포넌트 27종) | `guide/guide.html` + `guide/Module/*`, `guide/Common/*`, `guide/Forms/*` | – |
| 로그인 | `html/member/login.html` | `screenshots/01_login.png` |
| 게시판 상세 (공지사항) | `html/board/view.html` | `screenshots/02_board_view.png` |
| 목록 (평가사업 목록) | `html/applicant/business/list.html` | `screenshots/03_business_list.png` |
| 신청하기 (성과계획서 작성) | `html/applicant/business/detail.html` | `screenshots/04_business_detail_1~3.png` |
| 공통 스타일·스크립트 | `common/css/style.css`, `common/js/common.js` | – |

## 가이드 컴포넌트 목록

- **Module**: tab, modal
- **Common**: icon, page_title, content_title, content_message, badge, table, paging, bread_crumb, in_page_navigation, text_list, button, text_button, tooltip, info_box, spinner, loader, comCalendar
- **Forms**: radio, checkbox, select, date_input, text_input, text_area, search, file_upload

## 참고

- 화면 캡처는 1920px 브라우저 기준이에요. 신청하기 화면은 상단 헤더와 우측 작성항목이 따라다녀서(sticky) 이어 붙이지 않고 3장으로 나눴어요.
- 외부 라이브러리(swiper, tui-date-picker 등)와 이미지·아이콘 파일은 포함하지 않았어요. 그래서 이 폴더의 HTML을 바로 열면 이미지와 일부 기능이 빠져 보일 수 있어요.
- 전체 화면 목록과 폴더 구조는 `../docs/seis-publishing-filelist.md`에 있어요.

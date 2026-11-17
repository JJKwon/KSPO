# SEIS 퍼블리싱 파일리스트 정리 (바이브코딩 참고용)

- 출처: https://seis.pub.openbricks.kr/guide/filelist.html
- 퍼블리싱 가이드: https://seis.pub.openbricks.kr/guide/guide.html
- 정리일: 2026-11-17
- 현황: **전체 76 / 완료 76 / 미완료 0 / 기타 0**
- 파일 경로는 filelist 기준 상대경로(`../html/...`) → 실제 URL은 `https://seis.pub.openbricks.kr/html/...`

---

## 1. 폴더 구조 요약

```
html/
├─ member/        로그인·회원 (로그인, 약관동의, 아이디/비밀번호 찾기)
├─ board/         공지사항 (list, view)
├─ applicant/     평가사업 - 보조사업자
│  ├─ business/      성과계획서 (list, detail, detail01~11, preview, reject)
│  ├─ material/      현장평가 사전자료 (detail01~10, preview)
│  ├─ survey/        만족도조사 사전자료 (detail01~04, preview)
│  ├─ report/        성과보고서
│  ├─ document/      제출서류 (detail01~05)
│  ├─ doc_result/    서면 평가결과
│  └─ field_result/  현장 평가결과
├─ committee/     평가사업 - 평가위원
│  ├─ business/      목록, 서면평가(평가/총평), 팝업 2종
│  ├─ field/         현장평가 (detail01~05)
│  ├─ plan/          성과계획서
│  ├─ material/      현장평가 사전자료 통합 미리보기 (_in 내장형 / _out 새창형)
│  ├─ field_result/  현장평가 결과
│  ├─ survey/        만족도조사 사전자료 통합 미리보기 (_in / _out)
│  ├─ report/        성과보고서
│  └─ document/      제출서류
├─ mypage/        나의정보관리
└─ etc/           오류페이지, 메일폼
_ejs/             공통 include (header.ejs, footer.ejs, memberLeft.ejs)
```

### 파일 네이밍 규칙
| 패턴 | 의미 |
|---|---|
| `list.html` | 목록 |
| `view.html` / `detail.html` | 상세 / 상세 골조(레이아웃 틀) |
| `detailNN.html` | 상세 내 작성항목(탭·스텝) 순번 |
| `detail_preview.html` | 미리보기 |
| `detail_reject.html` | 반려 상태 화면 |
| `detailNN_in.html` / `_out.html` | 내장형 / 새창 팝업형 |
| `popup_*.html` | 팝업 |
| `mailformNN.html` | 이메일 폼 |

---

## 2. 로그인 (member)

| 2차 | 3차 | 파일경로 | 수정일 |
|---|---|---|---|
| 로그인 | | `html/member/login.html` | 2026-11-11 |
| 이용약관 동의 | | `html/member/agreeTerms.html` | 2026-11-11 |
| 아이디 찾기 | | `html/member/findId.html` | 2026-10-20 |
| 아이디 찾기 | 결과 | `html/member/findIdResult.html` | 2026-10-19 |
| 비밀번호 찾기 | | `html/member/findPw.html` | 2026-10-20 |
| 비밀번호 찾기 | 인증번호 확인 | `html/member/findPwCode.html` | 2026-10-20 |
| 비밀번호 찾기 | 새 비밀번호 입력 | `html/member/resetPw.html` | 2026-10-20 |

## 3. 공지사항 (board)

| 2차 | 3차 | 파일경로 | 수정일 |
|---|---|---|---|
| 공지사항 | 목록 | `html/board/list.html` | 2026-11-11 |
| 공지사항 | 상세 | `html/board/view.html` | 2026-10-21 |

## 4. 평가사업 – 보조사업자 (applicant)

> 2026-09-17: 원본 `business/detail12.html`은 삭제되고 `document/detail01.html`로 이동.

| 2차 | 3차 | 4차 | 파일경로 | 수정일 |
|---|---|---|---|---|
| 목록 | | | `html/applicant/business/list.html` | 2026-11-11 |
| 상세(골조) | | | `html/applicant/business/detail.html` | 2026-10-22 |
| 상세(성과계획서) | 사업목적 | | `html/applicant/business/detail01.html` | 2026-10-21 |
| | 사업내용 | | `html/applicant/business/detail02.html` | 2026-10-21 |
| | 전체 예산집행 계획(기금) | | `html/applicant/business/detail03.html` | 2026-10-30 |
| | 당해 예산집행 계획(기금) | | `html/applicant/business/detail04.html` | 2026-10-30 |
| | 예산집행 계획(지방비 등) | | `html/applicant/business/detail05.html` | 2026-10-30 |
| | 사업추진 계획 | | `html/applicant/business/detail06.html` | 2026-10-21 |
| | 홍보계획 | | `html/applicant/business/detail07.html` | 2026-10-21 |
| | 성과지표 | | `html/applicant/business/detail08.html` | 2026-10-21 |
| | 사업개선계획 | | `html/applicant/business/detail09.html` | 2026-10-21 |
| | 사업성과 제고 방안 | | `html/applicant/business/detail10.html` | 2026-10-21 |
| | 기대효과 | | `html/applicant/business/detail11.html` | 2026-10-21 |
| | 미리보기 | | `html/applicant/business/detail_preview.html` | 2026-10-19 |
| | 사업계획서 첨부 (반려 상태) | | `html/applicant/business/detail_reject.html` | 2026-10-22 |
| 현장평가 사전자료 | 담당자 연락처 | | `html/applicant/material/detail01.html` | 2026-10-21 |
| | 개인정보 동의 | | `html/applicant/material/detail02.html` | 2026-11-11 |
| | 희망일정 | | `html/applicant/material/detail03.html` | 2026-10-22 |
| | 사업추진계획 | | `html/applicant/material/detail04.html` | 2026-10-21 |
| | 대상선정기준 | | `html/applicant/material/detail05.html` | 2026-10-21 |
| | 예산집행계획 | | `html/applicant/material/detail06.html` | 2026-10-21 |
| | 홍보계획 | | `html/applicant/material/detail07.html` | 2026-10-21 |
| | 운영준비 | | `html/applicant/material/detail08.html` | 2026-10-21 |
| | 사업개선계획 | | `html/applicant/material/detail09.html` | 2026-10-21 |
| | 안전관리노력 | | `html/applicant/material/detail10.html` | 2026-10-21 |
| | 미리보기 | | `html/applicant/material/detail_preview.html` | 2026-11-11 |
| 만족도조사 사전자료 | 담당자 연락처 | | `html/applicant/survey/detail01.html` | 2026-10-21 |
| | 개인정보동의 | | `html/applicant/survey/detail02.html` | 2026-11-11 |
| | 희망일정 | | `html/applicant/survey/detail03.html` | 2026-10-22 |
| | 사업정보 | | `html/applicant/survey/detail04.html` | 2026-10-21 |
| | 미리보기 | | `html/applicant/survey/detail_preview.html` | 2026-11-11 |
| 성과보고서 | | | `html/applicant/report/detail01.html` | 2026-10-22 |
| 제출서류 | 사업계획서 첨부 | | `html/applicant/document/detail01.html` | 2026-10-22 |
| | 성과개선계획서 | | `html/applicant/document/detail02.html` | 2026-10-22 |
| | 가점보고서 | | `html/applicant/document/detail03.html` | 2026-10-22 |
| | 부패·비리·인권침해 | | `html/applicant/document/detail04.html` | 2026-10-22 |
| | 증빙자료 | | `html/applicant/document/detail05.html` | 2026-10-22 |
| 서면 평가결과 | | | `html/applicant/doc_result/detail01.html` | 2026-10-21 |
| 현장 평가결과 | | | `html/applicant/field_result/detail01.html` | 2026-10-21 |

## 5. 평가사업 – 평가위원 (committee)

| 2차 | 3차 | 4차 | 파일경로 | 수정일 |
|---|---|---|---|---|
| 목록 | | | `html/committee/business/list.html` | 2026-11-11 |
| 서면평가 | 평가 | | `html/committee/business/detail01.html` | 2026-10-21 |
| | 총평 | | `html/committee/business/detail02.html` | 2026-10-21 |
| | 사업별 서면평가 조회 | 팝업 | `html/committee/business/popup_eval.html` | 2026-10-30 |
| | 인터페이스 통계 조회 | 팝업 | `html/committee/business/popup_static.html` | 2026-10-30 |
| 현장평가 | 사업담당자 의견 | | `html/committee/field/detail01.html` | 2026-10-26 |
| | 주요내용(요약) | | `html/committee/field/detail02.html` | 2026-10-21 |
| | 현장평가 문항지 | | `html/committee/field/detail03.html` | 2026-10-30 |
| | 평가의견 | | `html/committee/field/detail04.html` | 2026-10-21 |
| | 사진자료 | | `html/committee/field/detail05.html` | 2026-10-22 |
| 성과계획서 | | | `html/committee/plan/detail01.html` | 2026-10-29 |
| 현장평가 사전자료 | 통합 미리보기 | 내장형 | `html/committee/material/detail01_in.html` | 2026-11-11 |
| | 통합 미리보기 | 새창 팝업형 | `html/committee/material/detail01_out.html` | 2026-10-19 |
| 현장평가 결과 | | | `html/committee/field_result/detail01.html` | 2026-10-29 |
| 만족도조사 사전자료 | 통합 미리보기 | 내장형 | `html/committee/survey/detail01_in.html` | 2026-11-11 |
| | 통합 미리보기 | 새창 팝업형 | `html/committee/survey/detail01_out.html` | 2026-10-19 |
| 성과보고서 | | | `html/committee/report/detail01.html` | 2026-10-29 |
| 제출서류 | | | `html/committee/document/detail01.html` | 2026-10-29 |

## 6. 나의정보관리 (mypage)

| 2차 | 3차 | 파일경로 | 수정일 |
|---|---|---|---|
| 나의정보관리 | 비밀번호 확인 | `html/mypage/passwordCheck.html` | 2026-10-21 |
| | 나의정보(평가위원) | `html/mypage/myInfoPage.html` | 2026-10-21 |
| | 나의정보(보조사업자) | `html/mypage/myInfoPage_bojo.html` | 2026-10-21 |

## 7. 공통

| 항목 | 유형 | 파일 / 위치 | 비고 | 수정일 |
|---|---|---|---|---|
| 헤더/모바일 메뉴 | include | `_ejs/header.ejs` | 로그인 페이지 제외 전 페이지 공통. 확인 예: list.html | 2026-10-30 |
| 작성항목(In-Page-Navigation) | 공용 컴포넌트 | `_comInPageNav.scss` | 우측 작성항목 목록이 있는 모든 상세 페이지. 예: detail01.html | 2026-10-30 |
| 탭메뉴(모듈 탭 `.-box`) | 공용 컴포넌트 | `_modTab.scss` | 평가유형 탭이 있는 모든 상세 페이지. 예: material/detail01.html | 2026-10-19 |
| 접근성(감리 대응) | 전체 공통 | `common.js`, `_formBasic.scss`, `_modModal.scss`, `header/footer/memberLeft.ejs` | | 2026-11-11 |
| 오류페이지 | | `html/etc/error.html` | | 2026-10-19 |
| 최초 비밀번호 설정 안내 | 이메일 | `html/etc/mailform01.html` | | 2026-08-31 |
| 비밀번호 찾기 인증번호 안내 | 이메일 | `html/etc/mailform02.html` | | 2026-08-31 |

---

## 8. 퍼블리싱 가이드 컴포넌트 목록 (guide.html)

- **Module**: Tab, Modal
- **Common**: Icon, Page Title, Content Title, Content Message, Badge, Table, Paging, Bread Crumb, In-Page Navigation, Text List, Button, Text Button, Tool-Tip, Info Box, Spinner, Loader, Calendar
- **Forms**: Radio, Checkbox, Select, Date Input, Text Input, Text Area, Search, File Upload

### 클래스 네이밍 컨벤션 (Badge 예시)
접두사(`com` 공통 / `mod` 모듈) + 하이픈 수식어(`-스타일 -상태 -사이즈`) 조합.

```html
<!-- 스타일: -line | -fill
     상태:   -primary | -secondary | -tertiary | -success | -error | -gray
     사이즈: -medium | -large -->
<div class="comBadge -line -primary -medium"><span>Label</span></div>
<div class="comBadge -fill -error -large"><span>Label</span></div>
```

SCSS 파일도 같은 규칙: `_com*.scss`(공통 컴포넌트), `_mod*.scss`(모듈), `_form*.scss`(폼).

---

## 9. 바이브코딩 시 활용 팁

1. 새 화면을 만들 땐 **같은 유형의 기존 파일을 템플릿으로 지정** (예: 작성형 상세 → `applicant/business/detail01.html`, 목록 → `applicant/business/list.html`, 팝업 → `committee/business/popup_eval.html`).
2. 상세 화면은 `detail.html`(골조) + `detailNN.html`(항목별) 구조이고, 우측 In-Page-Navigation과 평가유형 탭(`.-box`)은 공용 컴포넌트를 재사용.
3. 헤더/푸터/좌측(`memberLeft`)은 `_ejs` include로 처리되므로 개별 HTML에 직접 넣지 말 것.
4. 접근성(감리 대응)은 `common.js`·`_formBasic.scss`·`_modModal.scss`에 공통 반영되어 있으니 폼·모달은 기존 마크업 구조를 그대로 따를 것.
5. 클래스는 `comXxx -modifier` 패턴 유지, 신규 컴포넌트도 같은 규칙으로 명명.

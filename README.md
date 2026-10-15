# AI기반 데이터 저널리스트 양성과정 강의자료

빌드 없이 동작하는 정적 사이트입니다. (HTML + CSS + 바닐라 JS)

## GitHub Pages 배포
1. 새 저장소를 만들고 이 폴더의 **모든 파일**(`.nojekyll` 포함)을 저장소 루트에 올립니다.
2. Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / `(root)` → Save
3. 1–2분 뒤 `https://<계정>.github.io/<저장소>/` 에서 열립니다.

## 내용 수정
- `assets/js/data-weeks.js` — 16주 강의 내용 (제목·목표·주제·실습·자료 목록)
- `assets/js/data-capstones.js` — 캡스톤 3종
- `assets/js/data-mcp.js` — Claude × MCP 연결 가이드
- 자료 목록에 링크를 걸려면 `docs`의 문자열을 `{ name: "파일명", href: "https://..." }` 로 바꾸세요.
- 사진 교체: `assets/img/instructor.jpg`
- 색상·폰트: `assets/css/style.css` 맨 위 `:root`

딥링크: `…/#week-7` 처럼 주차 번호를 붙이면 해당 주차 상세가 바로 열립니다.

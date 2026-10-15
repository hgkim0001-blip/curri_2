/* Claude × MCP 연결 가이드 데이터 */
window.MCP_FLOW = ["Claude Desktop", "MCP 서버", "연결 방식(패널·COM·소켓)", "Adobe / C4D"];

window.MCP_COMMON = [
  ["Claude Desktop 앱 필수", "웹 claude.ai에서는 로컬 MCP를 쓸 수 없다. 로그인된 데스크톱 앱에서만 연결된다."],
  ["Node.js 또는 Python 설치", "Premiere·AE·Photoshop·Illustrator는 Node.js(20 이상), Cinema 4D는 Python 3.10 이상."],
  ["설정 파일은 mcpServers 안에", "설정 > 개발자 > 구성 편집. 기존 내용을 지우지 말고, 앞 항목 뒤에 쉼표를 붙여 추가한다. 경로의 \\ 는 \\\\ 두 개."],
  ["저장 후 ‘완전 종료’", "창의 X는 트레이에 남는다. 트레이 아이콘 우클릭 > 종료 후 재실행해야 반영된다."],
  ["‘실행 중’ 확인", "설정 > 개발자에서 서버가 실행 중인지 본다. 실패면 로그 보기 → 경로 오타·JSON 문법부터."],
  ["읽기 전용으로 먼저", "처음 요청은 ‘아무것도 바꾸지 마’를 붙인다. 중요한 파일은 복사본으로 테스트한다."],
  ["영문 이름 규칙", "시퀀스·클립·컴포지션·폴더는 영문으로. 한글 Windows에서 스크립트 기능이 조용히 실패하는 사례가 반복됐다."]
];

window.MCP_TOOLS = [
  {
    id: "premiere", name: "Premiere Pro", short: "PR", color: "blue",
    summary: "369개 도구. 타임라인 점검·편집 기획·프레임 캡처. 계획을 보여주고 승인받는 방식.",
    meta: [["서버", "premiere-pro-mcp v1.15.1 (leancoderkavy, MIT)"], ["지원", "Premiere 2020~2026"], ["방식", "npm 설치 + 설정 파일 등록 + CEP 커넥터"], ["필수", "Node.js 20.19+, Media Encoder(같은 버전)"]],
    structure: "Claude Desktop → MCP 서버(Node.js) → 임시 폴더(.jsx/.json) → CEP 커넥터 → Premiere",
    steps: [
      ["이전 Premiere MCP 끄기", "설정 파일에서 premiere-pro 항목 제거 후 Claude 완전 종료. 비슷한 도구 500개 이상이 동시에 보이면 엉뚱한 쪽을 고른다."],
      ["서버 설치", "명령 프롬프트에서 npm install -g premiere-pro-mcp@1.15.1"],
      ["상태 점검", "premiere-pro-mcp --doctor 로 서버·Node.js가 Ready인지 확인"],
      ["커넥터 설치", "Premiere를 완전히 종료한 뒤 premiere-pro-mcp --install-cep"],
      ["설정 등록", "아래 JSON을 mcpServers에 추가. PREMIERE_MCP_PROTOCOL_MODE는 legacy로 고정"],
      ["패널 열기", "Premiere → 창 > 확장 > MCP for Adobe Premiere Pro, 초록 ‘Running’ 확인 (테스트용 복사본 프로젝트로)"],
      ["Media Encoder", "프리미어와 같은 버전 설치 + PNG_Still 프리셋 (프레임 캡처·내보내기에 필수)"]
    ],
    config: String.raw`"premiere-pro-v2": {
  "command": "node",
  "args": ["C:\\Users\\<사용자>\\AppData\\Roaming\\npm\\node_modules\\premiere-pro-mcp\\dist\\index.js"],
  "env": { "PREMIERE_MCP_PROTOCOL_MODE": "legacy" }
}`,
    commands: [
      ["설치", "npm install -g premiere-pro-mcp@1.15.1"],
      ["점검", "premiere-pro-mcp --doctor"],
      ["커넥터", "premiere-pro-mcp --install-cep"]
    ],
    tests: [
      "verify_premiere_connection으로 프리미어 연결만 확인해줘. 아무것도 바꾸지 마.",
      "현재 프로젝트와 활성 시퀀스 정보를 알려줘. 아무것도 바꾸지 마.",
      "audit_timeline_health로 현재 시퀀스를 점검해줘. 수정하지 마.",
      "1920x1080 30fps 시퀀스 TEST_EDIT 만들고 첫 클립을 V1에 올려줘"
    ],
    trouble: [
      ["이전 서버가 목록에 남음", "Claude가 트레이에 실행 중 → 작업 관리자에서 모두 종료 후 재실행"],
      ["Server disconnected (.mcpb 번들)", "내장 Node.js·연결 협상 불일치 → npm 방식 + legacy 모드로 전환"],
      ["Needs attention: Premiere Connector", "커넥터 미설치 → Premiere 종료 후 --install-cep"],
      ["capture_frame / 내보내기 실패", "Media Encoder 미설치·버전 불일치, 한글 시퀀스 이름(추정)"],
      ["클립 속도 변경 실패", "Premiere 스크립트 API 한계 → 속도/지속 시간 창에서 직접"]
    ],
    notes: ["AI는 편집 도구를 조작할 수 있지만 영상을 보고 판단하는 것은 여전히 편집자의 몫이다.", "클립 이름에 내용을 담고(예: INT_CEO_01) 대본·샷 리스트를 텍스트로 주면 정확도가 크게 올라간다."]
  },
  {
    id: "ae", name: "After Effects", short: "AE", color: "lime",
    summary: "47개 도구. 컴포지션·텍스트·키프레임·렌더. 렌더한 프레임을 Claude가 직접 보고 수정한다.",
    meta: [["서버", "after-effects-mcp v1.13.0 (a-y-ibrahim)"], ["방식", "ZIP 다운로드 + npm install + 브리지 패널"], ["필수", "Node.js LTS, AE 스크립트 파일 쓰기 허용"], ["특징", "UI 언어와 무관 — 한글판 AE에서도 안정"]],
    structure: "Claude → MCP 서버(build/index.js) → 명령·결과 JSON 파일 → AE 안의 브리지 패널(mcp-bridge-auto.jsx)",
    steps: [
      ["다운로드", "GitHub a-y-ibrahim/after-effects-mcp → Code → Download ZIP. 경로에 한글·공백 없는 곳에 압축 해제 (예: D:\\aemcp)"],
      ["npm install", "압축 푼 폴더에서 cmd를 열고 npm install (build 폴더가 생겨야 정상)"],
      ["브리지 설치", "npm run install-bridge. 2025·2026 버전이 안 보이면 해당 AE를 한 번 실행했다 끄고 재시도하거나 ScriptUI Panels 폴더에 수동 복사"],
      ["설정 등록", "구성 편집에서 아래 JSON 추가. 흔한 실수: 파일 끝에 중괄호 덩어리를 통째로 붙여넣기 → mcpServers가 이미 있으면 그 안에 추가"],
      ["AE 환경설정", "편집 > 환경 설정 > 스크립팅 및 표현식 > ‘스크립트가 파일을 쓰고 네트워크에 액세스하도록 허용’ 체크 후 재시작"],
      ["브리지 패널", "창 메뉴 맨 아래 mcp-bridge-auto.jsx 열기, Auto-run 체크. 작업 내내 열어둔다"]
    ],
    config: String.raw`"AfterEffectsMCP": {
  "command": "node",
  "args": ["D:\\aemcp\\after-effects-mcp-main\\build\\index.js"]
}`,
    commands: [["설치", "npm install"], ["브리지", "npm run install-bridge"]],
    tests: [
      "After Effects 브리지 확인해줘",
      "지금 열려 있는 프로젝트의 컴포지션 목록 알려줘",
      "1920x1080, 30fps, 10초짜리 컴포지션 ‘TEST’ 만들어줘",
      "가운데에 ‘HELLO’ 텍스트 넣고 1초 동안 페이드인 되게 해줘",
      "TEST 컴포지션 2초 지점 프레임 보여줘",
      "하단 자막용 로우어서드 만들어줘. 이름은 홍길동, 직함은 방송 PD"
    ],
    trouble: [
      ["창 메뉴에 브리지 패널이 없음", "쓰는 AE 버전 폴더에 설치되지 않음 → 수동 복사"],
      ["설정 파일에 빨간 오류", "JSON 문법: 덩어리 2개, 쉼표 누락, \\ 하나만 씀"],
      ["Claude 명령에 AE가 반응 없음", "브리지 패널이 닫혔거나 스크립트 허용 설정 꺼짐"],
      ["권한 오류(EPERM)", "명령 프롬프트를 관리자 권한으로 실행"]
    ],
    notes: ["각 명령은 AE에서 실행 취소 1번으로 되돌릴 수 있다.", "개인이 만든 오픈소스이므로 중요한 프로젝트는 백업 후 테스트."]
  },
  {
    id: "ps", name: "Photoshop", short: "PS", color: "white",
    summary: "설정 파일 한 줄이면 끝. 패널 설치 없이 포토샵만 켜두면 된다. 배경 제거·보정·내보내기는 ‘레시피’로.",
    meta: [["서버", "@alisaitteke/photoshop-mcp (비공식, MIT)"], ["방식", "npx 실행 + OS 자동화(COM/AppleScript)로 ExtendScript 실행"], ["필수", "Node.js"], ["주의", "뉴럴 필터는 불가(UXP 브리지 별도), 생성형 채우기는 Adobe 계정·크레딧"]],
    structure: "Claude ↔ MCP 서버 ↔ COM 자동화(macOS는 AppleScript) ↔ Photoshop — 패널이 필요 없다",
    steps: [
      ["Node.js 확인", "node -v 로 버전이 나오는지 확인"],
      ["설정 파일 백업", "%APPDATA%\\Claude\\claude_desktop_config.json 복사"],
      ["항목 추가", "mcpServers 안에 아래 photoshop 블록을 추가 (앞 블록 쉼표 확인)"],
      ["완전 종료 후 재실행", "첫 실행은 npx가 패키지를 받느라 1분쯤 걸릴 수 있다"],
      ["포토샵 먼저 실행", "ping은 포토샵을 대신 켜주지 않는다"]
    ],
    config: String.raw`"photoshop": {
  "command": "npx",
  "args": ["-y", "@alisaitteke/photoshop-mcp"],
  "env": { "LOG_LEVEL": "1", "ANALYTICS_DISABLED": "1" }
}`,
    commands: [],
    tests: [
      "포토샵에 ping 보내고 버전을 알려줘.",
      "1920x1080 RGB 문서를 만들고, 가운데에 ‘TEST’를 72pt 흰색으로 넣어줘.",
      "활성 레이어의 배경을 레시피로 제거해줘",
      "warm_film 프리셋으로 컬러 그레이드를 조정 레이어로 적용해줘"
    ],
    trouble: [
      ["서버 목록에 photoshop이 없음", "쉼표·중괄호 누락 → 백업으로 되돌린 뒤 다시 추가"],
      ["서버 상태 failed", "Node.js 미설치 또는 npx 실행 실패"],
      ["ping 실패", "포토샵이 꺼져 있음"],
      ["포토샵을 찾지 못함", "env에 PHOTOSHOP_PATH로 설치 경로 지정"],
      ["extendscript_timeout", "열린 대화상자 닫고 ping 재시도"]
    ],
    notes: ["레시피: 배경 제거 · 인물 보정 · 닷지&번 · 주파수 분리 · 컬러 그레이딩 · SNS 규격 내보내기 · 캐러셀 분할 · 일괄 워터마크. 실행 취소 한 번으로 전체가 되돌려진다.", "npx -y는 실행할 때마다 패키지를 받아오고 업데이트가 잦다 — 수업 직전에 한 번 확인."]
  },
  {
    id: "ai", name: "Illustrator", short: "AI", color: "blue",
    summary: "60개가 넘는 도구. 도형·텍스트·레이어 정리·내보내기. 리깅용 캐릭터 레이어 분리에 강하다.",
    meta: [["서버", "illustrator-mcp-server (ie3jp, MIT)"], ["방식", "npx 실행 + PowerShell COM으로 JSX 실행"], ["필수", "Node.js 20+, Illustrator 2024(v28) 이상 검증"], ["대안", "GitHub Releases의 .mcpb 확장 (자동 업데이트 안 됨)"]],
    structure: "Claude → MCP 서버(Node.js) → ExtendScript(JSX) → PowerShell COM → Illustrator → JSON 결과",
    steps: [
      ["설정 백업", "claude_desktop_config.json 복사"],
      ["항목 추가", "mcpServers에 아래 illustrator 블록 추가, 앞 항목 뒤 쉼표"],
      ["완전 종료 후 재실행", "설정 > 개발자에서 실행 중 확인"],
      ["문서 열기", "Illustrator를 켜고 문서 하나를 연다"],
      ["연결 확인", "‘현재 문서 정보 알려줘’ — 크기·색상 모드·아트보드 수가 돌아오면 성공"]
    ],
    config: String.raw`"illustrator": {
  "command": "npx",
  "args": ["-y", "illustrator-mcp-server"]
}`,
    commands: [],
    tests: [
      "현재 문서 정보 알려줘",
      "illustrator라는 글씨를 아트보드 중앙에 써줘",
      "화면의 캐릭터를 부위별 레이어로 분리해서 리깅용으로 수정해줘",
      "이 캐릭터를 지정 폴더에 .ai 파일로 저장해줘"
    ],
    trouble: [
      ["패스 자르기·패스파인더가 필요함", "해당 도구 없음 → 일러스트레이터에서 직접"],
      ["호출이 4분 뒤 실패", "승인 대기 창이나 열린 대화상자 확인, 계속되면 Claude 재시작"],
      ["엉뚱한 문서가 수정됨", "항상 활성 문서에 작업 → 작업 중 문서 탭을 바꾸지 않는다"],
      ["npx를 찾지 못함", "Node.js 20+ 확인, 버전 관리 도구 사용 시 npx 전체 경로 입력"]
    ],
    notes: ["리깅 예: 여성 캐릭터를 24개 최상위 레이어로 분리 → AE에서 ‘컴포지션 - 레이어 크기 유지’로 가져와 Head → Neck → Torso 순으로 부모 연결.", "납품용 파일은 사람이 마지막에 확인한다."]
  },
  {
    id: "c4d", name: "Cinema 4D", short: "C4D", color: "lime",
    summary: "큐브 하나부터 모그라프·리깅·카메라·렌더까지 대화로. 2026.4 이상은 공식 MCP 내장.",
    meta: [["서버", "cinema4d-mcp v0.1.2 (ttiimmaacc)"], ["방식", "Python MCP 서버 ↔ 포트 5555 소켓 플러그인"], ["필수", "C4D 2024.0+, Python 3.10+, mcp<2"], ["공식", "C4D 2026.4 이상: Preferences > MCP에서 활성화 (2026 구독 필요, 이 가이드에서는 미검증)"]],
    structure: "Claude → Python MCP 서버(main.py) → 소켓(127.0.0.1:5555) → C4D 안의 Socket Server 플러그인",
    steps: [
      ["저장소 받기", "GitHub ttiimmaacc/cinema4d-mcp ZIP. 한글·공백 없는 경로"],
      ["패키지 설치", "작업 폴더에서 pip install -e ."],
      ["mcp를 1.x로 내리기", "pip install \"mcp<2\" — 2.x면 서버가 바로 꺼진다 (가장 흔한 실패 원인)"],
      ["플러그인 복사", "C4D Edit > Preferences > Open Preferences Folder → plugins에 mcp_server_plugin.pyp 복사 후 재시작"],
      ["소켓 서버 시작", "Extensions > Socket Server Plugin > Start Server — Online, 127.0.0.1:5555 확인. C4D를 켤 때마다 다시 시작"],
      ["Claude에 등록", "아래 JSON 추가 후 완전 종료·재실행"]
    ],
    config: String.raw`"cinema4d": {
  "command": "python",
  "args": ["D:\\mcp\\cinema4d-mcp\\cinema4d-mcp-main\\main.py"]
}`,
    commands: [["패키지", "pip install -e ."], ["버전 고정", "pip install \"mcp<2\""], ["단독 점검", "python main.py   (Successfully connected to Cinema 4D socket! 이면 정상)"]],
    tests: [
      "시네마4D에 큐브 하나 만들어줘",
      "큐브를 클로너로 5x5 배열하고 랜덤 이펙터와 재질을 적용해줘",
      "오비트 카메라 샷을 만들어줘",
      "프로젝트 복사본을 저장하고 Render Queue로 MP4 렌더해줘"
    ],
    trouble: [
      ["cinema4d ‘실패’, Server disconnected", "mcp 2.x 설치됨 → pip install \"mcp<2\""],
      ["서버는 실행 중인데 명령이 안 먹음", "C4D에서 Start Server를 누르지 않음"],
      ["연결 오류", "방화벽이 5555 포트 차단"],
      ["Extensions에 플러그인이 없음", "Open Preferences Folder로 연 폴더의 plugins에 넣었는지 확인"]
    ],
    notes: ["한계: 단순 작업 외에는 Python 스크립트 실행에 의존, 내장 렌더 미리보기 실패 가능, Claude는 뷰포트를 직접 보지 못한다 → 작은 해상도 렌더를 뽑아 확인.", "수정은 복사본에서. 긴 렌더 중에는 C4D가 응답하지 않는다."]
  }
];

/* Premiere × AE 영상 워크플로우 */
window.MCP_WORKFLOW = {
  intro: "새 채팅에서 워크플로우 가이드를 먼저 주고 ‘이 가이드대로 작업해줘’라고 요청하면, 제작 흐름·역할 분담·컷 길이·파일 규칙을 매번 다시 설명하지 않아도 된다. 시작 전에는 verify_premiere_connection과 check-bridge로 두 연결을 확인한다.",
  flow: ["OK컷", "가편집", "본편집(자막·색·믹싱)", "납품 검수"],
  roles: [
    ["OK컷", "테이크 판정 (연기·초점·흔들림)", "빈 정리, 대표 프레임 캡처, 컬러 라벨·마커, 서브클립"],
    ["가편집", "컷 순서(콘티)·문장별 컷 지정", "시퀀스 조립, 무음 분석으로 문장 경계 마커, 원고 문장↔타임코드 연결, 비트 분석"],
    ["자막·합성", "에펙 보내기, 디자인 결정", "컴포지션 읽기, 자막 레이어 작업 보조, 프레임 캡처로 잘림·안전영역 확인"],
    ["색보정", "세밀한 그레이딩, 최종 룩", "파형·RGB 퍼레이드 측정, 튀는 컷 목록, Lumetri·LUT 적용"],
    ["오디오 믹싱", "음색·밸런스를 귀로 판단", "트랙 레벨 정리, 나레이션 구간 음악 더킹, 효과음 배치"],
    ["납품 검수", "최종 승인", "플래시 프레임·빈 구간·오프라인 미디어·LUFS·자막 안전영역 점검"]
  ],
  cuts: [["광고", 2], ["정보 프로그램", 4], ["다큐멘터리", 4], ["뉴스", 4]],
  cutsNote: "정보·다큐·뉴스는 3~5초(대표값 4초), 광고는 약 2초. 12초 문장이면 다큐에서 컷 3~4개.",
  rules: [
    "연출적 판단은 사람이, 정리·배치·측정·검수는 Claude가.",
    "자막·합성은 에펙에서 만들고 동적 링크로 보낸다 — 보내기는 사람이 직접(우클릭 > After Effects 컴포지션으로 바꾸기).",
    "컴포지션 이름은 영문 역할+컷 번호 (Title_Cut05).",
    "Claude는 소리를 듣지 못한다 → 라우드니스는 수치로 (유튜브 −14 LUFS, 방송 −24 LUFS).",
    "‘MM:SS 스틸 만들어줘’ → 캡처 → PNG 저장 → 프로젝트 패널 가져오기까지 한 번에.",
    "Undo가 지원되지 않으니 큰 변경 전 저장·백업.",
    "무료 음원은 곡마다 출처·라이선스(CC-BY, 상업 사용, Content ID)를 기록."
  ],
  manual: ["동적 링크로 에펙 보내기", "클립 속도 변경·역재생", "캡션(자막 트랙) 생성", "소스에 붙은 마커 삭제"]
};

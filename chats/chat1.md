# 웨딩버틀러 홈페이지 디자인

_Started 2026-09-09 13:21 UTC_

---

## User

웨딩버틀러라는 서비스명을 가진 축의대 대행 서비스 홈페이지를 만들고 싶어.

홈페이지에서 소개도하고 예약도 받고 결제까지 가능하게 하려고해 모든게 온라인상에서 가능하도록

타겟은 결혼식을 준비하는 예비부부들이고
그리고 가독성 좋은 서식으로 내용 작성해줘
첨부파일이랑 비슷하게 디자인 만들어줘 사용될 이미지도 같이 첨부했어 적절한 애니메이션도 넣어줘
요금제는 3가지 요금제로 제공하고, 날짜와 시간을 선택해서 서비스를 예약할 수 있도록 할거야

01. 스몰케어

* 가격: 39만원
* 하객 200명 이하
* 추가 하객 1명당 2,000원
* 웨딩버틀러 2명

02. 스탠다드

* 가격: 45만원
* 하객 200명 이상 ~ 300명 이하
* 추가 하객 1명당 2,000원
* 웨딩버틀러 2명
* 추가 버틀러 1명: 10만원

03. 프리미엄 양가

* 가격: 80만원부터
* 양가 하객 각 200명 기준
* 추가 하객 1명당 2,000원
* 웨딩버틀러 4명
* 추가 버틀러 1명: 10만원

모두 부가세 포함

## User

웨딩버틀러라는 서비스명을 가진 축의대 대행 서비스 홈페이지를 만들고 싶어.

홈페이지에서 소개도하고 예약도 받고 결제까지 가능하게 하려고해 모든게 온라인상에서 가능하도록

타겟은 결혼식을 준비하는 예비부부들이고
그리고 가독성 좋은 서식으로 내용 작성해줘
첨부파일이랑 비슷하게 디자인 만들어줘 사용될 이미지도 같이 첨부했어 적절한 애니메이션도 넣어줘
요금제는 3가지 요금제로 제공하고, 날짜와 시간을 선택해서 서비스를 예약할 수 있도록 할거야

01. 스몰케어

* 가격: 39만원
* 하객 200명 이하
* 추가 하객 1명당 2,000원
* 웨딩버틀러 2명

02. 스탠다드

* 가격: 45만원
* 하객 200명 이상 ~ 300명 이하
* 추가 하객 1명당 2,000원
* 웨딩버틀러 2명
* 추가 버틀러 1명: 10만원

03. 프리미엄 양가

* 가격: 80만원부터
* 양가 하객 각 200명 기준
* 추가 하객 1명당 2,000원
* 웨딩버틀러 4명
* 추가 버틀러 1명: 10만원

모두 부가세 포함

## Assistant

_[tool: list_files]_

_[tool: copy_files]_

_[tool: dc_write]_

_[tool: show_html]_

_[tool: ready_for_verification]_

웨딩버틀러 홈페이지를 만들었습니다. 첨부하신 이미지를 히어로·예약 섹션·CTA 배경으로 사용했고, 아이보리+골드 톤에 스크롤 등장 애니메이션을 넣었습니다.

- 요금제 3종은 카드 클릭 시 아래 예약서에 바로 반영되고, 하객 수·추가 버틀러에 따라 총액이 실시간 계산됩니다.
- 예약은 달력에서 날짜 → 시간 → 예식 정보 → 결제 수단 순으로 진행되며, 결제하면 예약번호가 발급되는 확정 화면이 나옵니다.

연락처·사업자 정보와 후기는 임시 문구이니 실제 내용 주시면 바꿔드릴게요.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

스크롤 등장 애니메이션을 고쳤습니다 — 앵커 클릭으로 건너뛰거나 빠르게 스크롤해도 지나친 요소가 항상 표시됩니다.

## User

#E9CAD1 #F3E9EB 메인색상이랑 배경색상을 이 색상으로 바꿔줘
사업자정보는 아래 내용 확인해줘
웨딩버틀러
대표자: 이강
사업자등록번호: 677-08-03502
주소: 경기 성남시 분당구 운중로 124 8층 804-S80호
이메일: cs@weddingbutler.co.kr

## Assistant

_[tool: run_script]_

_[tool: copy_files]_

_[tool: run_script]_

_[tool: copy_files]_

_[tool: ready_for_verification]_

로즈 팔레트로 전체 교체했습니다 — 배경 #F3E9EB, 포인트 면 #E9CAD1, 버튼·링크는 가독성을 위해 같은 계열의 진한 로즈(#A9647E)를 썼습니다. 푸터 사업자 정보도 주신 내용으로 반영했습니다.

## User

분홍색으로 그라데이션이 들어간거 같은데 검정이나 회색으로 그라데이션 넣어줘

## Assistant

_[tool: dc_html_str_replace]_

히어로 오버레이를 중성 블랙·그레이 그라데이션으로 바꿨습니다.

## User

분홍색 그라데이션 말고 검정이나 회색 그라데이션으로 변경해줘

## Assistant

_[tool: dc_html_str_replace]_

CTA 섹션 배경도 블랙·그레이 그라데이션으로 바꿨습니다.

## User

그리고 온라인 예약 결제 영역은 메인 페이지에서 제거하고 예약하기 버튼을 눌렀을때 레이어로 뜨면 좋겠어
온라인 예약 결제 영역의 배경은 price 영역 배경으로 들어가면 좋겠어 
그리고 이 배경에 뒤 이미지가 잘 보이도록 투명도 조절해줘

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: read_file]_

_[tool: dc_html_str_replace]_

_[tool: read_file]_

_[tool: dc_html_str_replace]_

_[tool: read_file]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

예약·결제 영역을 페이지에서 빼고 모달 레이어로 바꿨습니다. 상단 내비, 히어로, 요금제 하단, 하단 CTA, 푸터의 예약 버튼 모두 이 레이어를 엽니다(배경 클릭·× 로 닫힘). 예약 섹션에 쓰던 홀 이미지는 요금제 섹션 배경으로 옮기고 오버레이 투명도를 낮춰 사진이 비치도록 했습니다.

## User

how it work, faq영역을 배경을 아이보리색으로 변경해줘

## Assistant

_[tool: grep]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

진행과정(HOW IT WORKS)과 FAQ 섹션 배경을 아이보리(#F7F3EA)로 바꿨습니다.

## User

이대로 일단 저장해줘

## Assistant

현재 상태 그대로 저장돼 있습니다 — `웨딩버틀러.dc.html`에 모든 변경(로즈 팔레트, 사업자 정보, 예약 모달, 아이보리 섹션)이 반영된 상태입니다. 추가 수정 필요하면 말씀해 주세요.

## User

price 영역 내 카드에 금액과 버튼 제거해줘
그리고 프리미엄 양가라는 명칭에서 양가 텍스트만 제거해줘
요금제 자세히보기 버튼을 클릭하면 요금제 메뉴 페이지로 이동해야해

## Assistant

_[tool: read_file]_

_[tool: dc_write]_

Now updating the home page cards.

_[tool: run_script]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

메인 요금제 카드에서 금액과 선택 버튼을 뺐고, "프리미엄 양가"는 "프리미엄"으로 바꿨습니다. "요금제 자세히보기"는 새로 만든 `요금제.dc.html` 상세 페이지로 이동하며, 그 페이지의 예약 버튼들은 메인으로 돌아와 예약 레이어를 자동으로 엽니다.

## User

Found issues — fixing…

## User

Found issues — fixing…

## User

GNB영역의 메뉴는 스크롤 이동이 아니고 클릭하면 해당 페이지로 이동하는걸로 하고싶어
그래서 진행과정, 후기, FAQ 제거하고 문의하기 메뉴 넣어줘

PRICE 영역 하단에 서비스 지역 영역 넣어서 
서울 전체, 경기 전체 가능하다는 내용 넣어줘 지도 인포그래픽 같은거 넣어줘도 되고 어울리는걸로 넣어줘
그리고 거리에 따라 비용이 추가될 수 있다는 내용도 작게 넣어줘

## Assistant

_[tool: dc_write]_

_[tool: dc_write]_

Now the home nav and the service-area section.

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

GNB를 서비스 / 요금제 / 문의하기 3개 페이지 이동 방식으로 바꿨습니다. 새로 만든 `서비스.dc.html`(서비스 범위 + 진행과정)과 `문의하기.dc.html`(문의 폼 + 연락처)이 추가됐고, 기존 진행과정·후기·FAQ 섹션은 메인에 그대로 남아 있습니다. PRICE 하단에는 서울 전역·경기 전역 서비스 지역 섹션과 거리별 출장비 추가 안내 문구를 넣었습니다.

## User

홈화면이랑 gnb가 다른데 홈이랑 동일하게 변경해줘

## Assistant

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

요금제 페이지의 GNB를 홈과 동일하게 서비스 / 요금제 / 문의하기로 맞췄습니다.

## User

요금제 페이지에 블로그 후기 이벤트로 후기 작성하면 10프로 페이백 해준다는 내용 추가해줘
그리고 예약할때 50프로만 선결제하고 식 종료 후 잔금 결제 하면 된다는 내용도 추가해줘

## Assistant

_[tool: dc_html_str_replace]_

Aligning the booking modal with the 50% deposit policy:

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

요금제 페이지에 블로그 후기 10% 페이백 이벤트와 50% 선결제 / 예식 후 잔금 결제 안내를 나란히 추가했습니다. 예약 레이어의 결제 문구·버튼도 "50% 선결제"로 맞췄습니다(총액과 잔금 함께 표시).

## User

배경색을 #FFFFFF 투명도 75%로 변경해줘

## Assistant

_[tool: grep]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

"한눈에 비교하기" 섹션 배경을 흰색 75% 투명도로 바꿨습니다.

## User

버튼 클릭 시 해당 페이지에서 예약 레이어 띄움

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: dc_write]_

Now wiring it into the 요금제 page.

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

요금제 페이지의 예약 버튼(각 카드 · GNB · 하단 CTA)이 페이지 이동 없이 그 자리에서 예약 레이어를 띄우도록 바꿨습니다. 레이어는 공용 컴포넌트 `예약레이어.dc.html`로 분리했고, 카드별 요금제가 선택된 상태로 열립니다.

참고: 사용량 한도(90%)에 도달했습니다. 홈 화면의 예약 레이어는 아직 기존 내장 버전을 쓰고 있어, 원하시면 다음에 공용 컴포넌트로 통일하겠습니다.

## User

지역문의로 텍스트 변경

## Assistant

_[tool: dc_js_str_replace]_

문의 유형의 "예약 변경"을 "지역 문의"로 바꿨습니다.

## User

버튼 삭제

## Assistant

_[tool: dc_js_str_replace]_

"양가 진행" 버튼을 삭제했습니다.

## User

카카오로 문의하기 영역으로 변경, 카카오 아이콘 및 버튼 노출

## Assistant

_[tool: dc_html_str_replace]_

## User

11:00 ~ 19:00 까지 30분 단위로 선택가능하도록 해줘

## Assistant

_[tool: dc_js_str_replace]_


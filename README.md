# TICKETFLOW Server

Supabase와 연동한 공연 관리 API 서버입니다. Node.js와 Express로 만들었고 Render에 배포합니다.

## 기술 스택

JavaScript, Node.js, Express, Supabase(PostgreSQL), @supabase/supabase-js, Render

## 실행 방법

```bash
npm install
cp .env.example .env   # .env에 본인 값 입력
npm run dev            # http://localhost:3001
```

`.env`에 들어가는 값은 다음과 같습니다.

| 이름 | 설명 |
|---|---|
| `PORT` | 로컬 포트 (기본 3001) |
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서버 전용 키 |
| `ADMIN_API_KEY` | 등록·수정·삭제 API용 관리자 키 |

관리자 키는 `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`로 만들 수 있습니다.

## API

| Method | URL | 기능 | 관리자 키 |
|---|---|---|---|
| GET | `/` | 서버 상태 확인 | |
| GET | `/performances` | 공연 목록 조회 (id 오름차순) | |
| POST | `/performances` | 공연 등록 | 필요 |
| PATCH | `/performances/:id` | 공연 수정 (보낸 항목만) | 필요 |
| DELETE | `/performances/:id` | 공연 삭제 | 필요 |

관리자 키는 요청 헤더 `x-admin-key`에 넣어 보냅니다.

## 응답 상태 코드

| 코드 | 상황 |
|---|---|
| 200 / 201 | 조회·수정·삭제 성공 / 등록 성공 |
| 400 | 필수값 누락, 잘못된 값, 잘못된 공연 ID |
| 401 | 관리자 키가 없거나 틀림 |
| 404 | 없는 공연 |
| 409 | 좌석 등 연결된 데이터가 있어 삭제 불가 |
| 500 / 503 | 서버 오류 / 서버 설정 미완료 |

## 폴더 구조

```
src/
├── app.js                          # 서버 설정, 라우터 연결, 공통 에러 처리
├── lib/supabase.js                 # Supabase 클라이언트
├── middleware/requireAdminKey.js   # 관리자 키 확인
├── routes/performanceRoutes.js     # /performances 라우터
└── controllers/performanceController.js  # 공연 CRUD 구현
```

`ticketflow.postman_collection.json`을 Postman에서 Import하면 테스트 요청을 바로 쓸 수 있습니다.

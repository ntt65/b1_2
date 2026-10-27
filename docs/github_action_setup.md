# GitHub Actions 자동 PR 설정 가이드

push → 자동으로 `nttkor/b1_2`에 PR이 생성되도록 하는 설정 방법.

---

## 1. PAT(Personal Access Token) 발급

> 기존 토큰을 찾을 수 없으면 새로 발급한다. PAT는 재조회가 불가능하므로 발급 직후 반드시 복사해둔다.

1. GitHub 로그인 → 우측 상단 프로필 클릭
2. **Settings** 클릭
3. 좌측 하단 **Developer settings** 클릭
4. **Personal access tokens** → **Tokens (classic)** 클릭
5. **Generate new token** → **Generate new token (classic)** 클릭
6. 설정:
   - **Note**: `nttkor-pr-token` (구분용 이름)
   - **Expiration**: 원하는 기간 선택 (90 days 권장)
   - **Scopes**: `public_repo` 체크 ✅
7. 하단 **Generate token** 클릭
8. 생성된 토큰(`ghp_...`) **즉시 복사** — 창을 닫으면 다시 볼 수 없음

---

## 2. Repo Secret 등록

> 복사한 PAT를 `ntt65/b1_2` 저장소의 Actions 시크릿으로 등록한다.

1. `github.com/ntt65/b1_2` 접속
2. **Settings** 탭 클릭
3. 좌측 **Secrets and variables** → **Actions** 클릭
4. **New repository secret** 클릭
5. 입력:
   - **Name**: `UPSTREAM_PAT` (정확히 이 이름이어야 함)
   - **Secret**: 1단계에서 복사한 토큰 붙여넣기
6. **Add secret** 클릭

---

## 3. 동작 확인

설정 완료 후 `main` 브랜치에 push하면 자동 실행된다.

1. `github.com/ntt65/b1_2` → **Actions** 탭 클릭
2. **Auto PR to upstream** 워크플로 클릭
3. 최근 실행 클릭 → 로그 확인

```
✅ PR #XX already open — skipping   ← 이미 PR이 있으면 스킵
✅ PR created: https://github.com/nttkor/b1_2/pull/XX  ← 새로 생성됨
```

---

## 4. 워크플로 파일 위치

```
.github/workflows/auto-pr.yml
```

트리거: `main` 브랜치 push
동작: `nttkor/b1_2`에 열린 PR(`ntt65:main → main`)이 없으면 생성, 있으면 스킵

---

## 5. PAT 만료 시

PAT는 설정한 기간(기본 90일)이 지나면 만료된다.
만료되면 워크플로가 `401 Unauthorized`로 실패한다.

→ 1단계부터 다시 진행해 새 토큰을 발급하고,
  2단계에서 기존 시크릿을 **Update**해서 교체한다.

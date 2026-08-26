import { Layout } from "../../components/Layout";
import { ColorBlock, Eyebrow, LinkButton, MetricGrid, MetricTile } from "../../components/ui";

export default function UserHome() {
  return (
    <Layout area="user" page="user">
      <section className="py-10">
        <div className="container-page">
          <Eyebrow>사용자 정보 · 데모 프로필</Eyebrow>
          <h1 className="mt-2">
            사용자 정보를
            <br />
            한곳에서.
          </h1>
        </div>
      </section>

      <section className="py-6">
        <div className="container-page">
          <ColorBlock tone="surface">
            <span className="inline-flex min-h-8 items-center rounded-full bg-paper px-2.5 text-xs font-semibold uppercase tracking-wide">인증 API 미구현 · 데모 사용자</span>
            <div className="mt-4 flex items-center gap-4">
              <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-ink text-xl font-bold text-white">김</span>
              <div>
                <h2>김하늘 님</h2>
                <p className="text-ink-muted">반려생활을 꼼꼼하게 기록하는 PetCoupon 회원</p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-hairline pt-4 text-sm">
              <div>
                <dt className="text-ink/60">이메일</dt>
                <dd className="font-medium">haneul.kim@example.com</dd>
              </div>
              <div>
                <dt className="text-ink/60">휴대전화</dt>
                <dd className="font-medium">010-27**-84**</dd>
              </div>
              <div>
                <dt className="text-ink/60">가입일</dt>
                <dd className="font-medium">2026년 3월 12일</dd>
              </div>
              <div>
                <dt className="text-ink/60">사용자 번호</dt>
                <dd className="font-medium">#1</dd>
              </div>
            </dl>
            <LinkButton to="/user/my-coupons" variant="secondary" className="mt-6 !bg-ink !text-white !border-ink hover:!bg-ink-muted">
              보유 쿠폰 보기
            </LinkButton>
          </ColorBlock>
        </div>
      </section>

      <section className="py-14">
        <div className="container-page">
          <h2>쿠폰 활동 예시</h2>
          <div className="mt-6">
            <MetricGrid cols={3}>
              <MetricTile label="사용 가능" value="2장" hint="이번 주 만료 1장" />
              <MetricTile label="사용 완료" value="1장" hint="최근 사용 7월 22일" />
              <MetricTile label="누적 절약" value="24,800원" hint="올해 기준" />
            </MetricGrid>
          </div>
        </div>
      </section>
    </Layout>
  );
}

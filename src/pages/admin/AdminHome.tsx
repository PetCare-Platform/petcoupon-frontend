import { ArrowRight } from "@phosphor-icons/react";
import { Layout } from "../../components/Layout";
import { Card, ColorBlock, Eyebrow, LinkButton, MetricGrid, MetricTile } from "../../components/ui";

export default function AdminHome() {
  return (
    <Layout area="admin" page="admin">
      <section className="py-10">
        <div className="container-page grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-start">
          <div>
            <Eyebrow>관리자 홈</Eyebrow>
            <h1 className="mt-2">
              이벤트와 쿠폰을
              <br />
              한 곳에서 관리하세요.
            </h1>
            <p className="mt-3 text-[18px] text-ink/70">이벤트 일정과 쿠폰 재고, 최근 변경 사항을 한 흐름으로 관리하세요.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton to="/admin/event-form">이벤트 만들기</LinkButton>
              <LinkButton to="/admin/coupon-form" variant="secondary">쿠폰 만들기</LinkButton>
            </div>
          </div>
          <ColorBlock tone="surface">
            <span className="text-xs font-semibold uppercase tracking-wide">운영 메모</span>
            <strong className="mt-2 block text-xl">예정 이벤트 점검</strong>
            <p className="mt-2">건강검진 데이 오픈 전 쿠폰 수량과 발급 기간을 확인해 주세요.</p>
          </ColorBlock>
        </div>
      </section>

      <section className="py-8">
        <div className="container-page">
          <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
            <div className="flex items-center justify-between">
              <h2>운영 요약</h2>
              <span className="text-sm text-ink-muted">2026.08.21</span>
            </div>
            <div className="mt-6">
              <MetricGrid cols={4}>
                <MetricTile label="진행 이벤트" value="2" hint="예정 2개" compact />
                <MetricTile label="활성 쿠폰" value="5" hint="총 재고 1,212장" compact />
                <MetricTile label="오늘 발급" value="216" hint="전일 대비 +18%" compact />
                <MetricTile label="확인 필요" value="3" hint="실패/정합성 항목" compact />
              </MetricGrid>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <Eyebrow>바로가기</Eyebrow>
          <h2 className="mt-2">운영 바로가기</h2>
          <div className="mt-6 grid items-start gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { to: "/admin/events", tag: "이벤트", title: "이벤트 목록", desc: "일정과 상태 관리" },
              { to: "/admin/event-form", tag: "이벤트", title: "이벤트 등록", desc: "새 일정 만들기" },
              { to: "/admin/coupons", tag: "쿠폰", title: "쿠폰 목록", desc: "혜택과 재고 관리" },
              { to: "/admin/coupon-form", tag: "쿠폰", title: "쿠폰 등록", desc: "새 혜택 만들기" },
            ].map((item) => (
              <Card key={item.to} href={item.to} className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/60">{item.tag}</span>
                <div>
                  <strong className="block text-lg">{item.title}</strong>
                  <span className="inline-flex items-center gap-1 text-ink/60">
                    {item.desc}
                    <ArrowRight weight="bold" className="h-3 w-3 flex-none" aria-hidden="true" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <div className="flex items-end justify-between">
            <div>
              <h2>곧 확인할 이벤트</h2>
            </div>
            <LinkButton to="/admin/events" variant="text">전체 이벤트 보기</LinkButton>
          </div>
          <div className="mt-6 overflow-x-auto rounded-block border border-hairline">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-hairline text-ink/60">
                <tr>
                  <th className="p-4 font-medium">이벤트</th>
                  <th className="p-4 font-medium">일정</th>
                  <th className="p-4 font-medium">쿠폰</th>
                  <th className="p-4 font-medium">작업</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["건강검진 데이", "8.24 - 9.07", "1개"],
                  ["가을 입맛 찾기", "9.01 - 9.14", "2개"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-hairline-soft last:border-0">
                    <td className="p-4 font-medium">{row[0]}</td>
                    <td className="p-4">{row[1]}</td>
                    <td className="p-4">{row[2]}</td>
                    <td className="p-4">
                      <LinkButton to="/admin/event-form" variant="text" className="!text-[16px]">
                        수정
                      </LinkButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Layout>
  );
}

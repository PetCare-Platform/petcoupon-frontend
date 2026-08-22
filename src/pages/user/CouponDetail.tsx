import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Eyebrow, StatusPill } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

const CODE = "PET-7K3M-82QD";

export default function CouponDetail() {
  const { showToast } = useToast();
  const [used, setUsed] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(CODE);
      showToast("클립보드에 복사했습니다.");
    } catch {
      showToast("복사하지 못했습니다.");
    }
  }

  return (
    <Layout area="user" page="coupon-detail">
      <section className="py-10">
        <div className="container-page">
          <Link to="/user/my-coupons" className="mb-7 inline-flex min-h-11 items-center gap-2 underline underline-offset-4">
            ← 내 쿠폰
          </Link>
          <Eyebrow>COUPON ISSUE / 1042</Eyebrow>
          <h1 className="mt-2">여름 정률 쿠폰</h1>
          <p className="mt-2 text-ink/70">반려동물 여름 케어 위크 · 미용과 목욕 서비스에 사용할 수 있어요.</p>
        </div>
      </section>

      <section className="py-4">
        <div className="container-page">
          <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
            <StatusPill tone={used ? "closed" : "open"}>{used ? "사용 완료" : "사용 가능"}</StatusPill>
            <h2 className="mt-4">
              결제 전에
              <br />
              이 코드를 보여주세요.
            </h2>
            <div className="mt-6 rounded-control bg-paper p-5">
              <span className="font-mono text-xs uppercase tracking-wide text-ink/60">COUPON CODE</span>
              <p className="mt-2 font-mono text-3xl font-bold tracking-wide">{CODE}</p>
              <button
                type="button"
                onClick={copyCode}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[16px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626]"
              >
                코드 복사
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <h2>혜택과 조건</h2>
          <Link to="/event-detail/1" className="mt-2 inline-block underline underline-offset-4">
            연결 이벤트 보기
          </Link>
          <div className="mt-6 rounded-block border border-hairline p-6">
            <h3 className="text-lg font-semibold">할인 정보</h3>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-ink/60">할인율</dt>
                <dd className="text-xl font-semibold">20%</dd>
              </div>
              <div>
                <dt className="text-ink/60">최대 할인</dt>
                <dd className="text-xl font-semibold">10,000원</dd>
              </div>
              <div>
                <dt className="text-ink/60">최소 구매</dt>
                <dd className="font-medium">30,000원</dd>
              </div>
              <div>
                <dt className="text-ink/60">사용 기한</dt>
                <dd className="font-medium">2026.08.28 23:59</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
            <Eyebrow>COUPON ACTION</Eyebrow>
            <h2 className="mt-2">
              사용 상태를
              <br />
              정확하게 남겨주세요.
            </h2>
            <p className="mt-2">결제가 확정된 뒤 사용 처리하세요. 잘못 처리했다면 사용 취소 이력도 함께 남길 수 있습니다.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setUsed(true);
                  showToast("여름 정률 쿠폰을 사용 완료로 표시했습니다.");
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-white transition-all active:scale-[0.97] hover:bg-ink-muted"
              >
                쿠폰 사용
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsed(false);
                  showToast("쿠폰 사용 취소 요청을 기록했습니다.");
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink px-5 text-[18px] font-medium transition-all active:scale-[0.97] hover:bg-white/40"
              >
                사용 취소
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

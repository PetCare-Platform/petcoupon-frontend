import { Link } from "react-router-dom";
import { panel } from "./shared";
import { StatusPill } from "../ui";
import type { CouponIssueDlqPageResponse } from "../../types/api";

export function FailureTable({
  dlq,
  loading,
}: {
  dlq: CouponIssueDlqPageResponse | null;
  loading: boolean;
}) {
  const rows = dlq?.content ?? [];

  return (
    <article className={panel}>
      <div className="mb-3 flex justify-between">
        <div>
          <h2>최근 실패 메시지</h2>
          <p className="mt-1 text-ink/55 dark:text-ops-muted">DLQ 최신 {rows.length}건</p>
        </div>
        <Link to="/internal/failures" className="text-sm underline underline-offset-4">
          전체 보기
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] text-left text-[13px]">
          <thead className="text-ink/55 dark:text-ops-muted">
            <tr>
              <th className="pb-2">ID</th>
              <th className="pb-2">상태</th>
              <th className="pb-2">오류</th>
              <th className="pb-2 text-right">시각</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 5).map((v) => (
              <tr key={v.messageId} className="border-t border-hairline-soft dark:border-ops-border-soft">
                <td className="py-2 font-mono">#{v.messageId}</td>
                <td className="py-2">
                  <StatusPill tone="danger">DLQ</StatusPill>
                </td>
                <td className="max-w-[9rem] truncate py-2 font-mono text-[11px]">{v.lastError}</td>
                <td className="py-2 text-right text-ink/50 dark:text-ops-muted">
                  {new Date(v.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </td>
              </tr>
            ))}
            {!loading && !rows.length ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-ink/50">
                  DLQ 메시지가 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
  );
}

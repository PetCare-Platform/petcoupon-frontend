import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Layout } from "../../components/Layout";
import { Eyebrow, EmptyState, FilterBar, StatusPill } from "../../components/ui";
import { GITHUB_REPO } from "../../routes";

interface GithubLabel {
  id: number;
  name: string;
  color: string;
}

interface GithubIssue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  created_at: string;
  comments: number;
  user: { login: string; avatar_url: string } | null;
  labels: GithubLabel[];
  pull_request?: unknown;
}

type LoadState = "loading" | "ready" | "error" | "not-found";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return "오늘";
  if (days === 1) return "1일 전";
  if (days < 30) return `${days}일 전`;
  const months = Math.floor(days / 30);
  return `${months}개월 전`;
}

export default function RepoIssues() {
  const [issues, setIssues] = useState<GithubIssue[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [filter, setFilter] = useState<"all" | "open" | "closed">("open");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues?state=all&per_page=50`, {
          signal: controller.signal,
          headers: { Accept: "application/vnd.github+json" },
        });
        if (res.status === 404) {
          setStatus("not-found");
          return;
        }
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const data = (await res.json()) as GithubIssue[];
        // GitHub's issues endpoint also returns pull requests — filter those out.
        setIssues(data.filter((item) => !item.pull_request));
        setStatus("ready");
      } catch (err) {
        if ((err as Error).name !== "AbortError") setStatus("error");
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const visible = useMemo(() => {
    if (filter === "all") return issues;
    return issues.filter((issue) => issue.state === filter);
  }, [issues, filter]);

  const openCount = issues.filter((i) => i.state === "open").length;
  const closedCount = issues.filter((i) => i.state === "closed").length;

  return (
    <Layout area="internal">
      <section className="py-8">
        <div className="container-page flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>내부 운영 · GitHub 이슈</Eyebrow>
            <h1 className="mt-2">저장소 이슈</h1>
            <p className="mt-2 text-[18px] text-ink/70 dark:text-ops-muted">
              <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                {GITHUB_REPO}
              </a>
              의 실제 GitHub Issues를 가져옵니다.
            </p>
          </div>
          <FilterBar
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: `전체 ${issues.length}` },
              { value: "open", label: `열림 ${openCount}` },
              { value: "closed", label: `닫힘 ${closedCount}` },
            ]}
          />
        </div>
      </section>

      <section className="py-4 pb-16 animate-reveal-up">
        <div className="container-page">
          {status === "loading" ? (
            <div className="grid gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-block border border-hairline bg-surface-soft dark:border-ops-border dark:bg-ops-surface" />
              ))}
            </div>
          ) : null}

          {status === "not-found" ? (
            <EmptyState
              title="저장소를 찾을 수 없어요."
              description={`${GITHUB_REPO} 저장소가 아직 없거나 비공개예요. 저장소를 만들고 푸시한 뒤 다시 확인해 주세요.`}
            />
          ) : null}

          {status === "error" ? (
            <EmptyState
              title="이슈를 불러오지 못했어요."
              description="GitHub API 요청이 실패했어요 (네트워크 문제 또는 시간당 요청 한도 초과일 수 있어요). 잠시 후 새로고침해 주세요."
            />
          ) : null}

          {status === "ready" && visible.length === 0 ? (
            <EmptyState
              title={issues.length === 0 ? "등록된 이슈가 없어요." : "조건에 맞는 이슈가 없어요."}
              description={issues.length === 0 ? "이 저장소에는 아직 이슈가 없어요. GitHub에서 새 이슈를 만들면 여기에 나타나요." : "다른 상태를 선택해 보세요."}
              action={
                issues.length === 0 ? (
                  <a
                    href={`https://github.com/${GITHUB_REPO}/issues/new`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper hover:bg-[#262626] dark:border-ops-ink dark:bg-ops-ink dark:text-ops-bg"
                  >
                    GitHub에서 이슈 만들기
                  </a>
                ) : undefined
              }
            />
          ) : null}

          {status === "ready" && visible.length > 0 ? (
            <div className="grid gap-3">
              {visible.map((issue) => (
                <a
                  key={issue.id}
                  href={issue.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-wrap items-start justify-between gap-3 rounded-control border border-hairline p-3.5 no-underline transition-all duration-200 ease-fluid hover:-translate-y-0.5 hover:border-ink dark:border-white/[0.14] dark:bg-ops-surface dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-white/30"
                >
                  <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <StatusPill tone={issue.state === "open" ? "open" : "closed"}>{issue.state === "open" ? "OPEN" : "CLOSED"}</StatusPill>
                      <span className="font-mono text-xs text-ink/50 dark:text-ops-muted">#{issue.number}</span>
                      {issue.labels.map((label) => (
                        <span
                          key={label.id}
                          className="inline-flex min-h-6 items-center rounded-full border px-2 text-[11px] font-medium"
                          style={{ borderColor: `#${label.color}`, color: `#${label.color}` }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                    <h3 className="truncate text-base font-semibold">{issue.title}</h3>
                    <p className="mt-1 text-sm text-ink/60 dark:text-ops-muted">
                      {issue.user?.login ?? "unknown"} · {timeAgo(issue.created_at)} · 댓글 {issue.comments}
                    </p>
                  </div>
                  <span className="inline-flex flex-none items-center gap-1 text-sm underline underline-offset-4">
                    GitHub에서 보기
                    <ArrowRight weight="bold" className="h-3 w-3 flex-none" aria-hidden="true" />
                  </span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </Layout>
  );
}

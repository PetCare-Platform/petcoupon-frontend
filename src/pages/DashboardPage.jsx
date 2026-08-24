import { IconRefresh, IconPointFilled } from '@tabler/icons-react'
import StatCard from '../components/dashboard/StatCard.jsx'
import TrendChart from '../components/dashboard/TrendChart.jsx'
import StatusDonut from '../components/dashboard/StatusDonut.jsx'
import FailureTable from '../components/dashboard/FailureTable.jsx'
import SystemStatusPanel from '../components/dashboard/SystemStatusPanel.jsx'
import styles from './DashboardPage.module.css'

// TODO: 목업 데이터. 관리자 대시보드 API 붙으면 교체.
const STATS = [
  { label: '오늘 발급', value: '3,214', tone: 'brand' },
  { label: '사용 완료', value: '1,982', tone: 'sub' },
  { label: '만료 처리', value: '412', tone: 'accent' },
  { label: '배치 대기열', value: '7건', tone: 'care' },
  { label: '락 대기 발생', value: '2건', tone: 'neutral' },
  { label: '정합성 성공률', value: '99.97%', tone: 'surface' },
]

const TREND_SERIES = [
  { label: '발급', color: '#D4356E', points: [30, 32, 35, 40, 72, 77, 62, 67, 64] },
  { label: '사용', color: '#6E4FA3', points: [17, 18, 20, 24, 32, 37, 34, 40, 42] },
  { label: '만료', color: '#E8785A', points: [8, 8, 9, 10, 13, 15, 17, 19, 21] },
]

const TREND_X_LABELS = ['03:00', '09:00', '15:00', '21:00', '01:00']

const STATUS_SEGMENTS = [
  { label: '발급', color: '#ED93B1', value: 47 },
  { label: '사용', color: '#AFA9EC', value: 35 },
  { label: '만료', color: '#F0997B', value: 18 },
]

const FAILURE_ROWS = [
  { couponId: '65551', type: 'FAILED', reason: 'Lock wait timeout', time: '01:57' },
  { couponId: '58024', type: 'FAILED', reason: '중복 이력 감지', time: '01:58' },
  { couponId: '48913', type: 'RETRY', reason: 'Redis 캐시 미스', time: '01:59' },
]

const SYSTEM_ITEMS = [
  { name: 'MySQL', status: 'HEALTHY' },
  { name: 'Redis', status: 'HEALTHY' },
  { name: 'Kafka Consumer', status: 'UP' },
  { name: '만료 배치 스케줄러', status: 'UP' },
]

function DashboardPage() {
  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>쿠폰 운영 대시보드</h1>
          <p className={styles.pageSubtitle}>2026년 8월 21일 · 5초 전 갱신</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} type="button">
            <IconRefresh size={14} stroke={1.75} />
            새로고침
          </button>
          <span className={styles.liveBadge}>
            <IconPointFilled size={14} />
            실시간 연결됨
          </span>
        </div>
      </header>

      <div className={styles.statGrid}>
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className={styles.chartGrid}>
        <TrendChart
          title="24시간 발급/사용/만료 추이"
          series={TREND_SERIES}
          xLabels={TREND_X_LABELS}
        />
        <StatusDonut
          title="쿠폰 상태 분포"
          segments={STATUS_SEGMENTS}
          totalValue="61.8K"
          totalLabel="전체 발급"
        />
      </div>

      <div className={styles.bottomGrid}>
        <FailureTable title="최근 배치/정합성 실패" rows={FAILURE_ROWS} />
        <SystemStatusPanel title="시스템 상태" items={SYSTEM_ITEMS} />
      </div>
    </div>
  )
}

export default DashboardPage

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import styles from './EmotionalProgress.module.css'

export const FEELINGS = [
  { id: 'hooked',   label: '🔥 Enganchado' },
  { id: 'stressed', label: '😤 Agobiado'   },
  { id: 'relaxed',  label: '😌 Relajado'   },
  { id: 'excited',  label: '😱 Emocionado' },
  { id: 'bored',    label: '😴 Aburrido'   },
  { id: 'sad',      label: '😢 Triste'     },
]

const FEELING_VALUE = {
  hooked: 5, excited: 4, relaxed: 3, bored: 2, stressed: 1, sad: 1,
}

export const FEELING_COLORS = {
  hooked: '#22c55e', excited: '#f59e0b', relaxed: '#3b82f6',
  bored: '#6b7280', stressed: '#ef4444', sad: '#8b5cf6',
}

export default function EmotionalProgress({ sessionHistory, currentFeeling }) {
  const chartData = sessionHistory
    .filter(s => s.feeling)
    .map(s => ({
      date: new Date(s.start_date).toLocaleDateString('es', { day: '2-digit', month: 'short' }),
      value: FEELING_VALUE[s.feeling] ?? 3,
      feeling: s.feeling,
      label: FEELINGS.find(f => f.id === s.feeling)?.label ?? s.feeling,
    }))

  const total = sessionHistory.filter(s => s.feeling).length
  const distribution = FEELINGS.map(f => ({
    ...f,
    count: sessionHistory.filter(s => s.feeling === f.id).length,
    pct: total ? Math.round(sessionHistory.filter(s => s.feeling === f.id).length / total * 100) : 0,
  })).filter(f => f.count > 0).sort((a, b) => b.count - a.count)

  if (chartData.length === 0) return (
    <div className={styles.empty}>
      Registra sesiones con estado emocional para ver tu historial aquí.
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.current}>
        <div className={styles.currentIcon}>
          {FEELINGS.find(f => f.id === currentFeeling)?.label?.split(' ')[0] ?? '🎮'}
        </div>
        <div>
          <div className={styles.currentLabel}>Estado actual</div>
          <div className={styles.currentName}>
            {FEELINGS.find(f => f.id === currentFeeling)?.label ?? 'Sin registrar'}
          </div>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.lineWrap}>
          <div className={styles.chartTitle}>Tu estado emocional en el tiempo</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} />
              <YAxis domain={[0, 6]} hide />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className={styles.tooltip}>
                    {payload[0].payload.label}
                  </div>
                )
              }} />
              <Line type="monotone" dataKey="value"
                stroke="var(--accent)" strokeWidth={2}
                dot={{ fill: 'var(--accent)', r: 4 }}
                activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.dist}>
          <div className={styles.chartTitle}>Distribución</div>
          {distribution.map(f => (
            <div key={f.id} className={styles.distRow}>
              <span className={styles.distLabel}>{f.label}</span>
              <div className={styles.distBar}>
                <div className={styles.distFill}
                  style={{ width: `${f.pct}%`, background: FEELING_COLORS[f.id] ?? 'var(--accent)' }} />
              </div>
              <span className={styles.distPct}>{f.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
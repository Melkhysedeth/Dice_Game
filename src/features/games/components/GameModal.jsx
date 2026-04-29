// GameModal.jsx
// Modal unificado para los 3 estados: 'library' | 'in_progress' | 'hall_of_fame'
// Uso: <GameModal game={game} mode="library" onClose={() => {}} onAction={handler} />

import { useState } from "react";
import styles from "./GameModal.module.css";

// ─── Iconos SVG inline (sin dependencias) ───────────────────────────────────
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconStar = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#F5C518" : "none"} stroke="#F5C518" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconDev = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
);
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const IconMonitor = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
);
const IconTrophy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 9a6 6 0 0 0 12 0" /><path d="M12 15v4" /><path d="M8 21h8" /><path d="M6 2H2v4a4 4 0 0 0 4 4" /><path d="M18 2h4v4a4 4 0 0 1-4 4" /></svg>
);
const IconFlag = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
);
const IconThumbsUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);
const IconDots = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
);
const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
);
const IconHeart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
);
const IconNote = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
);
const IconBarChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
);
const IconRefresh = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
);

// ─── Componente de estrellas ──────────────────────────────────────────────────
function StarRating({ value, max = 5, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(null);
  const display = hovered ?? value;
  return (
    <div className={styles.stars} style={{ cursor: interactive ? "pointer" : "default" }}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          onMouseEnter={() => interactive && setHovered(i + 1)}
          onMouseLeave={() => interactive && setHovered(null)}
          onClick={() => interactive && onChange?.(i + 1)}
        >
          <IconStar filled={i < display} />
        </span>
      ))}
    </div>
  );
}

// ─── Barra de progreso ────────────────────────────────────────────────────────
function ProgressBar({ value, color = "#22c55e", showLabel = true }) {
  return (
    <div className={styles.progressWrap}>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${value}%`, background: color }} />
      </div>
      {showLabel && <span className={styles.progressLabel} style={{ color }}>{value}%</span>}
    </div>
  );
}

// ─── TAB: Resumen (En Progreso) ───────────────────────────────────────────────
function TabResumen({ game }) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.statsGrid2}>
        <div className={styles.statCard}>
          <div className={styles.statCardIcon}><IconCalendar /></div>
          <div>
            <div className={styles.statCardLabel}>Empezado el</div>
            <div className={styles.statCardValue}>{game.startDate ?? '—'}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statCardIcon}><IconUsers /></div>
          <div>
            <div className={styles.statCardLabel}>Sesiones</div>
            <div className={styles.statCardValue}>{game.sessions ?? 0} sesiones</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statCardIcon}><IconTrophy /></div>
          <div>
            <div className={styles.statCardLabel}>Logros desbloqueados</div>
            <div className={styles.statCardValue}>
              {game.achievements?.unlocked ?? 0} / {game.achievements?.total ?? 0}
            </div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statCardIcon} style={{ color: '#22c55e' }}>G</div>
          <div>
            <div className={styles.statCardLabel}>Puntos de logro</div>
            <div className={styles.statCardValue}>
              {game.achievements?.points ?? 0} / {game.achievements?.maxPoints ?? 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal BIBLIOTECA ─────────────────────────────────────────────────────────
function ModalLibrary({ game, onClose, onAction }) {
  const genres = game.genres || [];
  const gallery = game.gallery || [];

  return (
    <div className={styles.modalInner}>
      {/* Header */}
      <div className={styles.modalHeader}>
        <button className={styles.closeBtn} onClick={onClose}><IconX /></button>
      </div>

      {/* Top section */}
      <div className={styles.topSection}>
        <div className={styles.coverWrap}>
          <img src={game.cover || "/placeholder-cover.jpg"} alt={game.title} className={styles.cover} />
        </div>
        <div className={styles.topInfo}>
          <h2 className={styles.gameTitle}>{game.title}</h2>
          <div className={styles.statusBadge} data-status="pending">
            <span className={styles.statusDot} />
            Pendiente
          </div>
          <div className={styles.ratingRow}>
            <StarRating value={Math.round(game.rating || 0)} />
            <span className={styles.ratingValue}>{game.rating}</span>
            <span className={styles.ratingCount}>({game.ratingCount?.toLocaleString()})</span>
          </div>
          <div className={styles.genrePills}>
            {genres.map((g, i) => <span key={i} className={styles.genrePill}>{g}</span>)}
          </div>
          <p className={styles.description}>{game.description}</p>
        </div>
      </div>

      {/* Meta grid */}
      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}><IconDev /> Desarrolladora</div>
          <div className={styles.metaValue}>{game.developer}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}><IconDev /> Distribuidora</div>
          <div className={styles.metaValue}>{game.publisher || game.developer}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}><IconCalendar /> Lanzamiento</div>
          <div className={styles.metaValue}>{game.releaseDate}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}><IconMonitor /> Plataforma</div>
          <div className={styles.metaValue}>{game.platforms?.join(" · ") || "PC"}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}><IconClock /> Duración estimada</div>
          <div className={styles.metaValue}>{game.duration || "—"}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}><IconUsers /> Jugadores</div>
          <div className={styles.metaValue}>{game.players || "1 jugador"}</div>
        </div>
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className={styles.gallerySection}>
          <div className={styles.sectionRow}>
            <span className={styles.sectionTitle}>Galería</span>
            <button className={styles.linkBtn}>Ver más →</button>
          </div>
          <div className={styles.galleryRow}>
            {gallery.slice(0, 3).map((img, i) => (
              <div key={i} className={styles.galleryThumb}>
                <img src={img} alt="" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={styles.modalFooter}>
        <button className={styles.btnSecondary} onClick={() => onAction?.("favorite")}>
          <IconHeart /> Añadir a favoritos
        </button>
        <button className={styles.btnPrimary} onClick={() => onAction?.("start")}>
          <IconPlay /> Empezar a jugar
        </button>
      </div>
    </div>
  );
}

// ─── Modal EN PROGRESO ────────────────────────────────────────────────────────
function ModalInProgress({ game, onClose, onAction }) {
  const [activeTab, setActiveTab] = useState("resumen");
  const tabs = ["resumen", "logros", "estadísticas", "notas"];
  const progressValue = game.progress || 65;

  return (
    <div className={styles.modalInner}>
      <div className={styles.modalHeader}>
        <button className={styles.closeBtn} onClick={onClose}><IconX /></button>
      </div>

      <div className={styles.topSection}>
        <div className={styles.coverWrap}>
          <img src={game.cover || "/placeholder-cover.jpg"} alt={game.title} className={styles.cover} />
        </div>
        <div className={styles.topInfo}>
          <h2 className={styles.gameTitle}>{game.title}</h2>
          <div className={styles.statusBadge} data-status="in_progress">
            <span className={styles.statusDot} />
            En progreso
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressHeaderRow}>
              <span className={styles.progressTitle}>Progreso general</span>
              <span className={styles.progressPercent} style={{ color: "#22c55e" }}>{progressValue}%</span>
            </div>
            <ProgressBar value={progressValue} color="#22c55e" showLabel={false} />
          </div>

          <div className={styles.miniStats}>
            <div className={styles.miniStat}>
              <IconClock />
              <div>
                <div className={styles.miniStatValue}>{game.playtime || "0h"}</div>
                <div className={styles.miniStatLabel}>Tiempo jugado</div>
              </div>
            </div>
            <div className={styles.miniStatDivider} />
            <div className={styles.miniStat}>
              <IconCalendar />
              <div>
                <div className={styles.miniStatValue}>{game.lastSession || "—"}</div>
                <div className={styles.miniStatLabel}>Última sesión</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        {tabs.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${activeTab === t ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.tabBody}>
        {activeTab === "resumen" && <TabResumen game={game} />}
        {activeTab !== "resumen" && (
          <div className={styles.emptyTab}>
            <span>Sin datos aún para <strong>{activeTab}</strong></span>
          </div>
        )}
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.btnGhost} onClick={() => onAction?.("note")}>
          <IconNote /> Añadir nota
        </button>
        <button className={styles.btnGreen} onClick={() => onAction?.("continue")}>
          <IconPlay /> Continuar jugando
        </button>
        <button className={styles.btnIcon} onClick={() => onAction?.("more")}>
          <IconDots />
        </button>
      </div>
    </div>
  );
}

// ─── Modal SALÓN DE LA FAMA ───────────────────────────────────────────────────
function ModalHallOfFame({ game, onClose, onAction }) {
  const [personalRating, setPersonalRating] = useState(game.personalRating || 0);
  const genres = game.genres || [];

  return (
    <div className={styles.modalInner}>
      <div className={styles.modalHeader}>
        <button className={styles.closeBtn} onClick={onClose}><IconX /></button>
      </div>

      <div className={styles.topSection}>
        <div className={styles.coverWrap} style={{ position: "relative" }}>
          <img src={game.cover || "/placeholder-cover.jpg"} alt={game.title} className={styles.cover} />
          <div className={styles.completedBadge}>
            <IconTrophy />
            COMPLETADO
          </div>
        </div>
        <div className={styles.topInfo}>
          <h2 className={styles.gameTitle}>{game.title}</h2>
          <div className={styles.statusBadge} data-status="completed">
            <IconTrophy /> Completado
          </div>
          <div className={styles.ratingRow}>
            <StarRating value={Math.round(game.rating || 0)} />
            <span className={styles.ratingValue}>{game.rating}</span>
            <span className={styles.ratingCount}>({game.ratingCount?.toLocaleString()})</span>
          </div>
          <div className={styles.genrePills}>
            {genres.map((g, i) => <span key={i} className={styles.genrePill}>{g}</span>)}
          </div>
          <div className={styles.completionDates}>
            <div className={styles.dateItem}>
              <div className={styles.metaLabel}><IconCalendar /> Completado el</div>
              <div className={styles.metaValue}>{game.completedDate || "—"}</div>
            </div>
            <div className={styles.dateItem}>
              <div className={styles.metaLabel}><IconClock /> Tiempo total</div>
              <div className={styles.metaValue}>{game.totalPlaytime || "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hall stats */}
      <div className={styles.hallStats}>
        <div className={styles.hallStat}>
          <div className={styles.hallStatIcon} style={{ color: "#a78bfa" }}><IconUsers /></div>
          <div className={styles.hallStatValue}>{game.playCount || 1}</div>
          <div className={styles.hallStatLabel}>Partidas completadas</div>
        </div>
        <div className={styles.hallStat}>
          <div className={styles.hallStatIcon} style={{ color: "#22c55e" }}><IconFlag /></div>
          <div className={styles.hallStatValue}>{game.endings?.unlocked || 0} / {game.endings?.total || 0}</div>
          <div className={styles.hallStatLabel}>Finales desbloqueados</div>
        </div>
        <div className={styles.hallStat}>
          <div className={styles.hallStatIcon} style={{ color: "#f5c518" }}><IconTrophy /></div>
          <div className={styles.hallStatValue}>{game.achievements?.unlocked || 0} / {game.achievements?.total || 0}</div>
          <div className={styles.hallStatLabel}>Logros obtenidos</div>
        </div>
      </div>

      {/* Personal rating & review */}
      <div className={styles.reviewSection}>
        <div className={styles.reviewBlock}>
          <div className={styles.reviewLabel}>Calificación personal</div>
          <div className={styles.personalRatingRow}>
            <StarRating value={personalRating} max={10} interactive onChange={setPersonalRating} />
            <span className={styles.personalRatingNum}>{personalRating} / 10</span>
          </div>
        </div>
        <div className={styles.reviewBlock}>
          <div className={styles.reviewLabel}>¿Lo recomendarías?</div>
          <div className={styles.recommendRow}>
            <IconThumbsUp />
            <span>{game.recommend || "Sí, totalmente"}</span>
          </div>
        </div>
      </div>

      {game.review && (
        <div className={styles.reflectionBlock}>
          <div className={styles.reflectionHeader}>
            <span className={styles.sectionTitle}>Reflexión del jugador</span>
            <button className={styles.btnIcon} onClick={() => onAction?.("editReview")}><IconEdit /></button>
          </div>
          <p className={styles.reflectionText}>"{game.review}"</p>
        </div>
      )}

      <div className={styles.modalFooter}>
        <button className={styles.btnGhost} onClick={() => onAction?.("stats")}>
          <IconBarChart /> Ver estadísticas
        </button>
        <button className={styles.btnPrimary} onClick={() => onAction?.("replay")}>
          <IconRefresh /> Jugar de nuevo
        </button>
        <button className={styles.btnIcon} onClick={() => onAction?.("more")}>
          <IconDots />
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal exportado ──────────────────────────────────────────
export default function GameModal({ game, mode = "library", onClose, onAction }) {
  if (!game) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={styles.modal}>
        {mode === "library" && <ModalLibrary game={game} onClose={onClose} onAction={onAction} />}
        {mode === "in_progress" && <ModalInProgress game={game} onClose={onClose} onAction={onAction} />}
        {mode === "hall_of_fame" && <ModalHallOfFame game={game} onClose={onClose} onAction={onAction} />}
      </div>
    </div>
  );
}

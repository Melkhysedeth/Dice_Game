import styles from './StartView.module.css';
import LoginModal from '../../../components/ui/LoginModal';
import { useState } from 'react'
import { Library, BarChart3, Trophy, Gamepad2, Cloud } from 'lucide-react';

const NAV_LINKS = ['Características', 'Cómo funciona', 'Beneficios', 'Precios', 'Blog'];
const FEATURES = [
    { icon: <Library size={35} />, title: 'Biblioteca Inteligente', desc: 'Organiza todos tus juegos en un solo lugar. Nunca pierdas el control de tu colección.' },
    { icon: <BarChart3 size={35} />, title: 'Seguimiento de Progreso', desc: 'Registra tu progreso, tiempo jugado y logros obtenidos en cada aventura.' },
    { icon: <Trophy size={35} />, title: 'Logros y Estadísticas', desc: 'Desbloquea logros y visualiza tus estadísticas para ver tu evolución como gamer.' },
    { icon: <Gamepad2 size={35} />, title: 'Sagas y Colecciones', desc: 'Sigue tus sagas favoritas y completa colecciones épicas de juegos.' },
    { icon: <Cloud size={35} />, title: 'Sincroniza en la Nube', desc: 'Accede a tu biblioteca desde cualquier dispositivo. Tu información siempre contigo.' },
];
const STATS = [
    { val: '10K+', label: 'Gamers unidos' },
    { val: '25K+', label: 'Juegos registrados' },
    { val: '75K+', label: 'Logros desbloqueados' },
    { val: '1M+', label: 'Horas de juego registradas' },
];
const AVATARS = [1, 2, 3, 4];

export default function StartView({ onLogin }) {
    const [showLogin, setShowLogin] = useState(false)
    return (
        <div className={styles.page}>
            {/* NAVBAR */}
            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <img
                            src="/src/assets/vault-logo2.png"
                            alt="logo"
                            style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '50%' }}
                        />
                    </div>
                    <div className={styles.logoText}>
                        <span className={styles.logoMy}>My</span>
                        <span className={styles.logoGame}> Game_</span>
                        <span className={styles.logoVault}>Vault</span>
                    </div>
                </div>
                <ul className={styles.navLinks}>
                    {NAV_LINKS.map(l => <li key={l}><a href="#">{l}</a></li>)}
                </ul>
                <div className={styles.navActions}>
                    <button className={styles.btnGhost} onClick={() => setShowLogin(true)}>Iniciar sesión</button>
                    <button className={styles.btnPrimary}>Crear cuenta →</button>
                </div>
            </nav>

            {/* HERO */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <p className={styles.heroTag}>TU UNIVERSO GAMER, ORGANIZADO</p>
                    <h1 className={styles.heroTitle}>
                        Todos tus juegos.<br />
                        Todas tus historia.<br />
                        <span className={styles.accent}>...Tu legado.</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        My Game Vault es el lugar donde tus aventuras cobran vida.
                        Organiza tus juegos, lleva tu progreso y construye tu historia
                        gamer en un solo lugar.
                    </p>
                    <div className={styles.heroBtns}>
                        <button className={styles.btnPrimary} onClick={() => setShowLogin(true)}>Comienza gratis →</button>
                        <button className={styles.btnOutline}>▶ Ver cómo funciona</button>
                    </div>
                    <div className={styles.heroSocial}>
                        <div className={styles.avatars}>
                            {AVATARS.map(i => (
                                <div key={i} className={styles.avatar} style={{ backgroundImage: `url(/avatars/${i}.jpg)` }} />
                            ))}
                        </div>
                        <div>
                            <div className={styles.stars}>★★★★★ <strong>4.9/5</strong></div>
                            <p className={styles.socialText}>Más de 10,000 gamers ya confían en nosotros</p>
                        </div>
                    </div>
                </div>
                <div className={styles.heroBanner}>
                    <img src="/src/assets/Start-baner2.png" alt="App preview" className={styles.bannerImg} />
                </div>
            </section>

            {/* FEATURES */}
            <section className={styles.features}>
                <p className={styles.sectionTag}>TODO LO QUE NECESITAS</p>
                <h2 className={styles.sectionTitle}>Un hogar para cada juego que amas</h2>
                <p className={styles.sectionSub}>Diseñado por gamers, para gamers.</p>
                <div className={styles.featureGrid}>
                    {FEATURES.map(f => (
                        <div key={f.title} className={styles.featureCard}>
                            <span className={styles.featureIcon}>{f.icon}</span>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* STATS */}
            <section className={styles.stats}>
                {STATS.map(s => (
                    <div key={s.val} className={styles.statItem}>
                        <span className={styles.statVal}>{s.val}</span>
                        <span className={styles.statLabel}>{s.label}</span>
                    </div>
                ))}
            </section>
            {showLogin && (
                <LoginModal
                    onClose={() => setShowLogin(false)}
                    onLogin={() => { setShowLogin(false); onLogin() }}
                />
            )}
        </div>
    );
}
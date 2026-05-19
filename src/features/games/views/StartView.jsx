import styles from './StartView.module.css';
import LoginModal from '../../../components/ui/LoginModal';
import { useState } from 'react'
import { Library, BarChart3, Users2, Gamepad2, Clock, Star, Dices, Trophy } from 'lucide-react';

const NAV_LINKS = ['Características', 'Cómo funciona', 'Beneficios', 'Precios', 'Blog'];
const FEATURES = [
  { icon: <Dices size={35} />, title: 'Elige al azar', desc: 'Nuestro sistema elige un juego para ti en segundos.' },
  { icon: <Library size={35} />, title: 'Organiza tu biblioteca', desc: 'Ten todos tus juegos en un solo lugar, siempre ordenados.' },
  { icon: <BarChart3 size={35} />, title: 'Controla tu progreso', desc: 'Sigue tus partidas, logros y el tiempo que realmente juegas.' },
  { icon: <Trophy size={35} />, title: 'Desafíos y logros', desc: 'Completa retos y presume tus logros ante la comunidad.' },
  { icon: <Gamepad2 size={35} />, title: 'Comunidad gamer', desc: 'Comparte, recomienda y descubre con otros jugadores.' },
]
const STATS = [
    { val: '10K+', label: 'Gamers unidos' },
    { val: '25K+', label: 'Juegos registrados' },
    { val: '75K+', label: 'Logros desbloqueados' },
    { val: '1M+', label: 'Horas de juego registradas' },
];
const AVATARS = [1, 2, 3, 4];

export default function StartView({ onLoginWithEmail, onLoginWithOAuth, onRegisterWithEmail, onResetPassword }) {
    const [showLogin, setShowLogin] = useState(false)
    const [authError, setAuthError] = useState(null)
    const [initialMode, setInitialMode] = useState('login')

    return (
        <div className={styles.page}>
            {/* NAVBAR */}
            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <img
                            src="/src/assets/vault-logo.png"
                            alt="logo"
                            style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                        />
                    </div>
                    <div className={styles.logoText}>
                        <span className={styles.logoMy}>My</span>
                        <span className={styles.logoGame}> Game_</span>
                        <span className={styles.logoVault}>Quest</span>
                    </div>
                </div>
                <ul className={styles.navLinks}>
                    {NAV_LINKS.map(l => <li key={l}><a href="#">{l}</a></li>)}
                </ul>
                <div className={styles.navActions}>
                    <button className={styles.btnGhost} onClick={() => { setShowLogin(true); setInitialMode('login') }}>
                        Iniciar sesión
                    </button>
                    <div className={styles.navActions}>
                        <button className={styles.btnPrimary} onClick={() => { setShowLogin(true); setInitialMode('register') }}>
                            Crear cuenta →
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <p className={styles.heroTag}>EL SISTEMA QUE DECIDE QUÉ JUGAR POR TI</p>
                    <h1 className={styles.heroTitle}>
                        Deja que el destino<br />
                        elija tu proxima.<br />
                        <span className={styles.accent}>...aventura 🎲</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        Organiza tu biblioteca, descubre joyas ocultas y nunca <br/>
                        más perderás tiempo decidiendo qué jugar.
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
                    <img src="/src/assets/Start_Baner.png" alt="App preview" className={styles.bannerImg} />
                </div>
            </section>

            {/* STATS + FEATURES combinados */}
            <section className={styles.featuresNew}>

                {/* Barra de stats */}
                <div className={styles.statsBar}>
                    <div className={styles.statBarItem}>
                        <Gamepad2 size={25} className={styles.statBarIcon} />
                        <span className={styles.statBarVal}>15,000+</span>
                        <span className={styles.statBarLabel}>Juegos agregados</span>
                    </div>
                    <div className={styles.statBarItem}>
                        <Users2 size={25} className={styles.statBarIcon} />
                        <span className={styles.statBarVal}>10,000+</span>
                        <span className={styles.statBarLabel}>Gamers activos</span>
                    </div>
                    <div className={styles.statBarItem}>
                        <Clock size={25} className={styles.statBarIcon} />
                        <span className={styles.statBarVal}>250,000+</span>
                        <span className={styles.statBarLabel}>Horas de juego registradas</span>
                    </div>
                    <div className={styles.statBarItem}>
                        <Star size={25} color='#fbb740' className={styles.statBarIcon} />
                        <span className={styles.statBarVal}>4.9/5</span>
                        <span className={styles.statBarLabel}>Calificación de la comunidad</span>
                    </div>
                </div>

                {/* Título */}
                <h2 className={styles.featuresNewTitle}>
                    Más que un organizador, tu compañero gamer ✨
                </h2>

                {/* Cards */}
                <div className={styles.featureRowNew}>
                    {FEATURES.map((f, i) => (
                        <div key={f.title} className={styles.featureCardNew} style={{ '--i': i }}>
                            <span className={styles.featureIconNew}>{f.icon}</span>
                            <h3 className={styles.featureCardTitle}>{f.title}</h3>
                            <p className={styles.featureCardDesc}>{f.desc}</p>
                        </div>
                    ))}
                </div>

            </section>
            {showLogin && (
                <LoginModal
                    onClose={() => { setShowLogin(false); setAuthError(null) }}
                    onLoginWithEmail={onLoginWithEmail}
                    onLoginWithOAuth={onLoginWithOAuth}
                    onRegisterWithEmail={onRegisterWithEmail}
                    error={authError}
                    onError={setAuthError}
                    onResetPassword={onResetPassword}
                    initialMode={initialMode}
                />
            )}
        </div>
    );
}
import { useState } from 'react'
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { FaGoogle, FaDiscord, FaSteam, FaXbox } from 'react-icons/fa'
import logoImg from '../../assets/vault-logo2.png'
import styles from './LoginModal.module.css'

const OAUTH = [
    { id: 'google', Icon: FaGoogle, label: 'Google' },
    { id: 'discord', Icon: FaDiscord, label: 'Discord' },
    { id: 'steam', Icon: FaSteam, label: 'Steam' },
    { id: 'xbox', Icon: FaXbox, label: 'Xbox' },
]

export default function LoginModal({ onClose, onLogin }) {
    const [showPass, setShowPass] = useState(false)
    const [email, setEmail] = useState('')
    const [pass, setPass] = useState('')

    const handleSubmit = () => {
        // TODO: reemplazar con supabase.auth.signInWithPassword
        onLogin()
    }

    const handleOAuth = (provider) => {
        // TODO: reemplazar con supabase.auth.signInWithOAuth({ provider })
        onLogin()
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                {/* CLOSE */}
                <button className={styles.close} onClick={onClose}><X size={18} /></button>

                {/* LOGO CENTRADO */}
                <div className={styles.logoWrap}>
                    <img
                        src="/src/assets/vault-logo2.png" // O usa el import si prefieres
                        alt="logo"
                        className={styles.mainLogo}
                    />
                </div>

                {/* HEADER */}
                <h2 className={styles.title}>Bienvenido de vuelta</h2>
                <p className={styles.sub}>Inicia sesión para continuar tu aventura</p>

                {/* EMAIL */}
                <label className={styles.label}>Correo electrónico</label>
                <div className={styles.inputWrap}>
                    <Mail size={16} className={styles.inputIcon} />
                    <input
                        className={styles.input}
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>

                {/* PASSWORD */}
                <label className={styles.label}>Contraseña</label>
                <div className={styles.inputWrap}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input
                        className={styles.input}
                        type={showPass ? 'text' : 'password'}
                        placeholder="Ingresa tu contraseña"
                        value={pass}
                        onChange={e => setPass(e.target.value)}
                    />
                    <button className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                <div className={styles.forgot}>
                    <a href="#">¿Olvidaste tu contraseña?</a>
                </div>

                {/* SUBMIT */}
                <button className={styles.btnLogin} onClick={handleSubmit}>
                    Iniciar sesión <span>→</span>
                </button>

                {/* DIVIDER */}
                <div className={styles.divider}><span>o continúa con</span></div>

                {/* OAUTH */}
                <div className={styles.oauthGrid}>
                    {OAUTH.map(({ id, Icon, label }) => (
                        <button key={id} className={styles.oauthBtn} onClick={() => handleOAuth(id)} title={label}>
                            <Icon size={22} />
                        </button>
                    ))}
                </div>

                {/* REGISTER */}
                <p className={styles.register}>
                    ¿No tienes cuenta? <a href="#">Crear cuenta</a>
                </p>

            </div>
        </div>
    )
}
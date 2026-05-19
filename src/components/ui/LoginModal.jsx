import { useState } from 'react'
import { X, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { FaGoogle, FaDiscord, FaSteam, FaXbox } from 'react-icons/fa'
import styles from './LoginModal.module.css'

const OAUTH = [
  { id: 'google', Icon: FaGoogle, label: 'Google' },
  { id: 'discord', Icon: FaDiscord, label: 'Discord' },
  { id: 'steam', Icon: FaSteam, label: 'Steam', disabled: true },
  { id: 'xbox', Icon: FaXbox, label: 'Xbox', disabled: true },
]

export default function LoginModal({ onClose, onLoginWithEmail, onLoginWithOAuth, onRegisterWithEmail, onResetPassword, error, onError, initialMode  }) {
  const [mode, setMode] = useState(initialMode || 'login')   // 'login' | 'register'
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [forgotMode, setForgotMode] = useState(false)

  function switchMode(next) {
    setMode(next)
    setForgotMode(false) 
    setEmail(''); setPass(''); setConfirm(''); setUsername('')
    onError?.(null)
    setSuccessMsg(null)
  }

  // ── Login ──────────────────────────────────────────────
  async function handleLogin() {
    if (!email || !pass) { onError?.('Completa todos los campos.'); return }
    setLoading(true)
    try {
      await onLoginWithEmail(email, pass)
      onClose()
    } catch (err) {
      onError?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Registro ───────────────────────────────────────────
  async function handleRegister() {
    if (!email || !pass || !confirm) { onError?.('Completa todos los campos.'); return }
    if (pass !== confirm) { onError?.('Las contraseñas no coinciden.'); return }
    if (pass.length < 6) { onError?.('La contraseña debe tener al menos 6 caracteres.'); return }

    setLoading(true)
    try {
      await onRegisterWithEmail(email, pass, username)
      setSuccessMsg('¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.')
      onError?.(null)
    } catch (err) {
      onError?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── OAuth ──────────────────────────────────────────────
  async function handleOAuth(provider) {
    try {
      await onLoginWithOAuth(provider)
    } catch (err) {
      onError?.(err.message)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <button className={styles.close} onClick={onClose}><X size={18} /></button>

        {/* LOGO */}
        <div className={styles.logoWrap}>
          <div className={styles.logoHex}>⬡</div>
        </div>

        {/* TOGGLE */}
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleBtn} ${isLogin ? styles.toggleActive : ''}`}
            onClick={() => switchMode('login')}
          >
            Iniciar sesión
          </button>
          <button
            className={`${styles.toggleBtn} ${!isLogin ? styles.toggleActive : ''}`}
            onClick={() => switchMode('register')}
          >
            Crear cuenta
          </button>
        </div>

        {forgotMode ? (
          <>
            <p className={styles.sub}>Te enviaremos un link para restablecer tu contraseña</p>
            {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
            {error && !successMsg && <div className={styles.errorMsg}>{error}</div>}
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
            <button
              className={styles.btnLogin}
              disabled={loading}
              onClick={async () => {
                setLoading(true)
                try {
                  await onResetPassword(email)
                  setSuccessMsg('Revisa tu correo — te enviamos el link.')
                  setForgotMode(false)
                } catch (err) {
                  onError?.(err.message)
                } finally {
                  setLoading(false)
                }
              }}
            >
              {loading ? 'Enviando...' : 'Enviar link →'}
            </button>
            <p className={styles.register}>
              <a href="#" onClick={e => { e.preventDefault(); setForgotMode(false); onError?.(null) }}>
                ← Volver al login
              </a>
            </p>
          </>
        ) : (
          <>
            {/* SUBTÍTULO */}
            <p className={styles.sub}>
              {isLogin ? 'Inicia sesión para continuar tu aventura' : 'Crea tu cuenta y empieza tu legado'}
            </p>

            {/* MENSAJE DE ÉXITO */}
            {successMsg && <div className={styles.successMsg}>{successMsg}</div>}

            {/* ERROR */}
            {error && !successMsg && <div className={styles.errorMsg}>{error}</div>}

            {/* USERNAME (solo registro) */}
            {!isLogin && (
              <>
                <label className={styles.label}>Nombre de usuario</label>
                <div className={styles.inputWrap}>
                  <User size={16} className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Tu nombre de gamer"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
              </>
            )}

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
                onKeyDown={e => e.key === 'Enter' && isLogin && handleLogin()}
              />
            </div>

            {/* PASSWORD */}
            <label className={styles.label}>Contraseña</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                className={styles.input}
                type={showPass ? 'text' : 'password'}
                placeholder={isLogin ? 'Ingresa tu contraseña' : 'Mínimo 6 caracteres'}
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && isLogin && handleLogin()}
              />
              <button className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* CONFIRMAR PASSWORD (solo registro) */}
            {!isLogin && (
              <>
                <label className={styles.label}>Confirmar contraseña</label>
                <div className={styles.inputWrap}>
                  <Lock size={16} className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  />
                  <button className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </>
            )}

            {/* FORGOT (solo login) */}
            {isLogin && (
              <div className={styles.forgot}>
                <a href="#" onClick={e => { e.preventDefault(); setForgotMode(true); onError?.(null) }}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            )}

            {/* SUBMIT */}
            <button
              className={styles.btnLogin}
              onClick={isLogin ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading
                ? (isLogin ? 'Entrando...' : 'Creando cuenta...')
                : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')}
              {!loading && <span>→</span>}
            </button>

            {/* DIVIDER + OAUTH */}
            <div className={styles.divider}><span>o continúa con</span></div>
            <div className={styles.oauthGrid}>
              {OAUTH.map(({ id, Icon, label, disabled }) => (
                <button
                  key={id}
                  className={styles.oauthBtn}
                  onClick={() => !disabled && handleOAuth(id)}
                  title={label}
                  disabled={disabled}
                  style={{ opacity: disabled ? 0.3 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                >
                  <Icon size={22} />
                </button>
              ))}
            </div>

            {/* SWITCH MODE */}
            <p className={styles.register}>
              {isLogin
                ? <>¿No tienes cuenta? <a href="#" onClick={e => { e.preventDefault(); switchMode('register') }}>Crear cuenta</a></>
                : <>¿Ya tienes cuenta? <a href="#" onClick={e => { e.preventDefault(); switchMode('login') }}>Iniciar sesión</a></>
              }
            </p>
          </>
        )}
      </div>
    </div>
  )
}
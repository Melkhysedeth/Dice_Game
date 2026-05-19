import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Lock, EyeOff, Eye } from 'lucide-react'
import styles from './ResetPasswordModal.module.css'

export default function ResetPasswordModal() {
    const [pass, setPass] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    const handleReset = async () => {
        if (pass.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
        if (pass !== confirm) return setError('Las contraseñas no coinciden')

        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.updateUser({ password: pass })

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
            setTimeout(() => navigate('/'), 2000)
        }
        setLoading(false)
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>Nueva contraseña</h2>
                <p className={styles.sub}>Ingresa tu nueva contraseña</p>

                {error && <div className={styles.errorMsg}>{error}</div>}
                {success && <div className={styles.successMsg}>¡Contraseña actualizada! Redirigiendo...</div>}

                <label className={styles.label}>Nueva contraseña</label>
                <div className={styles.inputWrap}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input
                        className={styles.input}
                        type={showPass ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={pass}
                        onChange={e => setPass(e.target.value)}
                    />
                    <button className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                <label className={styles.label}>Confirmar contraseña</label>
                <div className={styles.inputWrap}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input
                        className={styles.input}
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Repite tu contraseña"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleReset()}
                    />
                    <button className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                <button
                    className={styles.btnLogin}
                    onClick={handleReset}
                    disabled={loading || success}
                >
                    {loading ? 'Guardando...' : 'Guardar contraseña →'}
                </button>
            </div>
        </div>
    )
}
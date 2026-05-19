import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { useAuthContext } from '../../../context/AuthContext'
import {
    User, Mail, Calendar, Camera, Lock, Trash2,
    Check, AlertTriangle, Gamepad2, Trophy, LayoutDashboard,
    LogOut, BookOpen, Swords, Shield, ArrowLeft,
    Star
} from 'lucide-react'
import styles from './ProfileView.module.css'

const SIDEBAR_ITEMS = [
    { id: 'profile', label: 'Perfil de usuario', icon: User },
    { id: 'password', label: 'Seguridad', icon: Lock },
]

export default function ProfileView({ onLogout, inProgressGames = [], completedGames = [], libraryGames = [] }) {
    const navigate = useNavigate()
    const { user, userName } = useAuthContext()

    const [fullName, setFullName] = useState('')
    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [bannerFile, setBannerFile] = useState(null)
    const [bannerPreview, setBannerPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState(null)
    const [error, setError] = useState(null)
    const [section, setSection] = useState('profile')
    const [newPass, setNewPass] = useState('')
    const [confirmPass, setConfirmPass] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState('')
    const avatarRef = useRef()
    const bannerRef = useRef()

    const email = user?.email || ''
    const username = user?.user_metadata?.username || email.split('@')[0]
    const createdAt = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
        : ''

    const initials = (fullName || userName || 'GX')
        .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

    const totalGames = libraryGames.length + inProgressGames.length + completedGames.length

    useEffect(() => {
        if (!user?.id) return
        supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
                if (data?.full_name) setFullName(data.full_name)
                if (data?.avatar_url) setAvatarPreview(data.avatar_url)
            })
    }, [user?.id])

    function handleAvatarChange(e) {
        const file = e.target.files[0]
        if (!file) return
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    function handleBannerChange(e) {
        const file = e.target.files[0]
        if (!file) return
        setBannerFile(file)
        setBannerPreview(URL.createObjectURL(file))
    }

    async function handleSaveProfile() {
        setLoading(true); setError(null); setSuccessMsg(null)
        try {
            let avatar_url = null
            if (avatarFile) {
                const ext = avatarFile.name.split('.').pop()
                const path = `${user.id}/avatar.${ext}`
                const { error: uploadError } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
                if (uploadError) throw uploadError
                const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
                avatar_url = publicUrl
            }
            const updates = { full_name: fullName }
            if (avatar_url) updates.avatar_url = avatar_url
            const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', user.id)
            if (profileError) throw profileError
            await supabase.auth.updateUser({ data: { full_name: fullName } })
            setSuccessMsg('Perfil actualizado correctamente')
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    async function handleChangePassword() {
        if (newPass.length < 6) return setError('Mínimo 6 caracteres')
        if (newPass !== confirmPass) return setError('Las contraseñas no coinciden')
        setLoading(true); setError(null); setSuccessMsg(null)
        try {
            const { error } = await supabase.auth.updateUser({ password: newPass })
            if (error) throw error
            setSuccessMsg('Contraseña actualizada correctamente')
            setNewPass(''); setConfirmPass('')
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    async function handleDeleteAccount() {
        if (deleteConfirm !== email) return setError('El correo no coincide')
        setLoading(true)
        try {
            await supabase.from('library_entries').delete().eq('user_id', user.id)
            await supabase.from('profiles').delete().eq('id', user.id)
            await supabase.auth.signOut()
            onLogout?.()
        } catch (err) { setError(err.message); setLoading(false) }
    }

    const recentGames = [
        ...completedGames.slice(0, 2).map(g => ({ ...g, status: 'completed' })),
        ...inProgressGames.slice(0, 2).map(g => ({ ...g, status: 'playing' })),
    ].slice(0, 4)

    return (
        <div className={styles.page}>

            {/* ── SIDEBAR ── */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTop}>
                    <p className={styles.sidebarSection}>AJUSTES</p>
                    {SIDEBAR_ITEMS.map(item => {
                        const Icon = item.icon
                        return (
                            <button
                                key={item.id}
                                className={`${styles.sidebarItem} ${section === item.id ? styles.sidebarItemActive : ''}`}
                                onClick={() => { setSection(item.id); setError(null); setSuccessMsg(null) }}
                            >
                                <Icon size={16} /> {item.label}
                            </button>
                        )
                    })}
                    <button
                        className={`${styles.sidebarItem} ${styles.sidebarDangerItem} ${section === 'danger' ? styles.sidebarDangerActive : ''}`}
                        onClick={() => { setSection('danger'); setError(null); setSuccessMsg(null) }}
                    >
                        <Trash2 size={16} /> Eliminar cuenta
                    </button>
                </div>

                <div className={styles.sidebarBottom}>
                    <button className={styles.sidebarLogout} onClick={onLogout}>
                        <LogOut size={16} /> Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <main className={styles.main}>

                {/* BANNER */}
                <div
                    className={styles.banner}
                    style={{ backgroundImage: `url(${bannerPreview || '/src/assets/profile_baner.png'})` }}
                >
                    <div className={styles.bannerOverlay} />

                    <button className={styles.changeBannerBtn} onClick={() => bannerRef.current.click()}>
                        <Camera size={13} /> Cambiar banner
                    </button>
                    <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} />

                    {/* Avatar + nombre */}
                    <div className={styles.heroInfo}>
                        <div className={styles.avatarWrap} onClick={() => avatarRef.current.click()}>
                            {avatarPreview
                                ? <img src={avatarPreview} alt="avatar" className={styles.avatarImg} />
                                : <div className={styles.avatarInitials}>{initials}</div>
                            }
                            <div className={styles.avatarOverlay}><Camera size={16} /></div>
                        </div>
                        <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />

                        <div className={styles.heroText}>
                            <button className={styles.backBtn} onClick={() => navigate('/')}>
                                <ArrowLeft size={16} /> Volver al inicio
                            </button>
                            <h1 className={styles.displayName}>{userName}</h1>
                            <div className={styles.heroMeta}>
                                <span><Calendar size={12} /> Se unió el {createdAt}</span>
                                <span><User size={12} /> {username}</span>
                            </div>
                        </div>
                    </div>

                    {/* STATS LIQUID GLASS */}
                    <div className={styles.statsGlass}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Biblioteca</span>
                            <div className={styles.statBottom}>
                                <LayoutDashboard size={22} className={styles.statIcon} />
                                <span className={styles.statValue}>{libraryGames.length}</span>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>En progreso</span>
                            <div className={styles.statBottom}>
                                <Gamepad2 size={22} className={styles.statIcon} />
                                <span className={styles.statValue}>{inProgressGames.length}</span>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Completados</span>
                            <div className={styles.statBottom}>
                                <Trophy size={22} className={styles.statIcon} />
                                <span className={styles.statValue}>{completedGames.length}</span>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Total</span>
                            <div className={styles.statBottom}>
                                <Star size={22} className={styles.statIcon} />
                                <span className={styles.statValue}>{totalGames}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTENIDO */}
                <div className={styles.content}>

                    {/* Formulario */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            {section === 'profile' && 'Información personal'}
                            {section === 'password' && 'Cambiar contraseña'}
                            {section === 'danger' && 'Eliminar cuenta'}
                        </h3>

                        {successMsg && <div className={styles.successMsg}><Check size={14} /> {successMsg}</div>}
                        {error && <div className={styles.errorMsg}><AlertTriangle size={14} /> {error}</div>}

                        {section === 'profile' && (
                            <div className={styles.formSection}>
                                <div className={styles.fieldRow}>
                                    <span className={styles.fieldIcon}><User size={14} /></span>
                                    <span className={styles.fieldLabel}>Nombre completo</span>
                                    <input className={styles.fieldInput} type="text" placeholder="Tu nombre" value={fullName} onChange={e => setFullName(e.target.value)} />
                                    <button className={styles.editBtn} onClick={handleSaveProfile} disabled={loading}>{loading ? '...' : 'Guardar'}</button>
                                </div>
                                <div className={styles.fieldRow}>
                                    <span className={styles.fieldIcon}><User size={14} /></span>
                                    <span className={styles.fieldLabel}>Usuario</span>
                                    <span className={styles.fieldValue}>{username}</span>
                                    <span className={styles.fieldHint}>No editable</span>
                                </div>
                                <div className={styles.fieldRow}>
                                    <span className={styles.fieldIcon}><Mail size={14} /></span>
                                    <span className={styles.fieldLabel}>Correo electrónico</span>
                                    <span className={styles.fieldValue}>{email}</span>
                                    <span className={styles.fieldHint}>No editable</span>
                                </div>
                                <div className={styles.fieldRow}>
                                    <span className={styles.fieldIcon}><Calendar size={14} /></span>
                                    <span className={styles.fieldLabel}>Miembro desde</span>
                                    <span className={styles.fieldValue}>{createdAt}</span>
                                    <span className={styles.fieldHint}>&nbsp;</span>
                                </div>
                            </div>
                        )}

                        {section === 'password' && (
                            <div className={styles.formSection}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Nueva contraseña</label>
                                    <div className={styles.inputWrap}>
                                        <Lock size={14} className={styles.inputIcon} />
                                        <input className={styles.input} type="password" placeholder="Mínimo 6 caracteres" value={newPass} onChange={e => setNewPass(e.target.value)} />
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Confirmar contraseña</label>
                                    <div className={styles.inputWrap}>
                                        <Lock size={14} className={styles.inputIcon} />
                                        <input className={styles.input} type="password" placeholder="Repite tu contraseña" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                                    </div>
                                </div>
                                <button className={styles.btnPrimary} onClick={handleChangePassword} disabled={loading}>
                                    {loading ? 'Actualizando...' : 'Cambiar contraseña →'}
                                </button>
                            </div>
                        )}

                        {section === 'danger' && (
                            <div className={styles.formSection}>
                                <div className={styles.dangerBox}>
                                    <AlertTriangle size={18} />
                                    <p>Esta acción es <strong>irreversible</strong>. Se eliminarán todos tus juegos, sagas y datos asociados.</p>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Escribe tu correo para confirmar</label>
                                    <div className={styles.inputWrap}>
                                        <Mail size={14} className={styles.inputIcon} />
                                        <input className={styles.input} type="email" placeholder={email} value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} />
                                    </div>
                                </div>
                                <button className={styles.btnDanger} onClick={handleDeleteAccount} disabled={loading || deleteConfirm !== email}>
                                    {loading ? 'Eliminando...' : 'Eliminar mi cuenta permanentemente'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Actividad reciente */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Actividad reciente</h3>
                        <div className={styles.activityList}>
                            {recentGames.length === 0 && (
                                <p className={styles.emptyActivity}>Sin actividad aún. ¡Empieza a jugar!</p>
                            )}
                            {recentGames.map(game => (
                                <div key={game.id} className={styles.activityItem}>
                                    <div className={styles.activityCover}>
                                        {game.cover
                                            ? <img src={game.cover} alt={game.title} />
                                            : <div className={styles.activityCoverFallback}><Gamepad2 size={18} /></div>
                                        }
                                    </div>
                                    <div className={styles.activityInfo}>
                                        <span className={styles.activityTitle}>{game.title}</span>
                                        <span className={`${styles.activityStatus} ${game.status === 'completed' ? styles.statusCompleted : styles.statusPlaying}`}>
                                            {game.status === 'completed' ? '🏆 Completado' : '🎮 En progreso'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* ZONA DE PELIGRO — al fondo */}
                <div className={styles.dangerZone}>
                    <div>
                        <p className={styles.dangerZoneTitle}>Zona de peligro</p>
                        <p className={styles.dangerZoneSub}>Las siguientes acciones son permanentes y no se pueden deshacer.</p>
                    </div>
                    <button className={styles.btnDangerOutline} onClick={() => setSection('danger')}>
                        <Trash2 size={14} /> Eliminar cuenta
                    </button>
                </div>

            </main>
        </div>
    )
}
import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { User, Mail, Calendar, Camera, Lock, Trash2, X, Check, AlertTriangle } from 'lucide-react'
import styles from './ProfileModal.module.css'

export default function ProfileModal({ user, userName, onClose, onLogout, onProfileUpdated }) {
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [error, setError] = useState(null)
  const [section, setSection] = useState('profile') // 'profile' | 'password' | 'danger'
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const fileRef = useRef()

  const email = user?.email || ''
  const username = user?.user_metadata?.username || email.split('@')[0]
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  const initials = (fullName || userName || 'GX')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarUrl(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSaveProfile() {
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      let avatar_url = null

      if (avatarUrl) {
        const ext = avatarUrl.name.split('.').pop()
        const path = `${user.id}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarUrl, { upsert: true })
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = publicUrl
      }

      const updates = { full_name: fullName }
      if (avatar_url) updates.avatar_url = avatar_url

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
      if (profileError) throw profileError

      await supabase.auth.updateUser({ data: { full_name: fullName } })

      localStorage.setItem('gq_profileName', fullName)
      onProfileUpdated?.(fullName)
      setSuccessMsg('Perfil actualizado correctamente')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword() {
    if (newPass.length < 6) return setError('Mínimo 6 caracteres')
    if (newPass !== confirmPass) return setError('Las contraseñas no coinciden')
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) throw error
      setSuccessMsg('Contraseña actualizada correctamente')
      setNewPass('')
      setConfirmPass('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== email) return setError('El correo no coincide')
    setLoading(true)
    try {
      await supabase.from('library_entries').delete().eq('user_id', user.id)
      await supabase.from('profiles').delete().eq('id', user.id)
      await supabase.auth.signOut()
      onLogout?.()
      onClose()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* HEADER */}
        <div className={styles.header}>
          <h2 className={styles.title}>Mi perfil</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {/* AVATAR + INFO BÁSICA */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrap} onClick={() => fileRef.current.click()}>
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" className={styles.avatarImg} />
              : <div className={styles.avatarInitials}>{initials}</div>
            }
            <div className={styles.avatarOverlay}><Camera size={18} /></div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          <div className={styles.userInfo}>
            <p className={styles.userDisplayName}>{userName}</p>
            <p className={styles.userEmail}>{email}</p>
            <p className={styles.userSince}><Calendar size={12} /> Miembro desde {createdAt}</p>
          </div>
        </div>

        {/* TABS */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${section === 'profile' ? styles.tabActive : ''}`} onClick={() => { setSection('profile'); setError(null); setSuccessMsg(null) }}>
            <User size={14} /> Editar perfil
          </button>
          <button className={`${styles.tab} ${section === 'password' ? styles.tabActive : ''}`} onClick={() => { setSection('password'); setError(null); setSuccessMsg(null) }}>
            <Lock size={14} /> Contraseña
          </button>
          <button className={`${styles.tab} ${section === 'danger' ? styles.tabDanger : ''}`} onClick={() => { setSection('danger'); setError(null); setSuccessMsg(null) }}>
            <Trash2 size={14} /> Eliminar cuenta
          </button>
        </div>

        {/* MENSAJES */}
        {successMsg && <div className={styles.successMsg}><Check size={14} />{successMsg}</div>}
        {error && <div className={styles.errorMsg}><AlertTriangle size={14} />{error}</div>}

        {/* SECCIÓN: EDITAR PERFIL */}
        {section === 'profile' && (
          <div className={styles.section}>
            <label className={styles.label}>Nombre completo</label>
            <div className={styles.inputWrap}>
              <User size={15} className={styles.inputIcon} />
              <input className={styles.input} type="text" placeholder="Tu nombre" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>

            <label className={styles.label}>Usuario</label>
            <div className={styles.inputWrap} style={{ opacity: 0.5 }}>
              <Mail size={15} className={styles.inputIcon} />
              <input className={styles.input} type="text" value={username} disabled />
            </div>
            <p className={styles.hint}>El usuario no se puede modificar</p>

            <label className={styles.label}>Correo electrónico</label>
            <div className={styles.inputWrap} style={{ opacity: 0.5 }}>
              <Mail size={15} className={styles.inputIcon} />
              <input className={styles.input} type="email" value={email} disabled />
            </div>
            <p className={styles.hint}>El correo no se puede modificar</p>

            <button className={styles.btnPrimary} onClick={handleSaveProfile} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios →'}
            </button>
          </div>
        )}

        {/* SECCIÓN: CONTRASEÑA */}
        {section === 'password' && (
          <div className={styles.section}>
            <label className={styles.label}>Nueva contraseña</label>
            <div className={styles.inputWrap}>
              <Lock size={15} className={styles.inputIcon} />
              <input className={styles.input} type="password" placeholder="Mínimo 6 caracteres" value={newPass} onChange={e => setNewPass(e.target.value)} />
            </div>

            <label className={styles.label}>Confirmar contraseña</label>
            <div className={styles.inputWrap}>
              <Lock size={15} className={styles.inputIcon} />
              <input className={styles.input} type="password" placeholder="Repite tu contraseña" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChangePassword()} />
            </div>

            <button className={styles.btnPrimary} onClick={handleChangePassword} disabled={loading}>
              {loading ? 'Actualizando...' : 'Cambiar contraseña →'}
            </button>
          </div>
        )}

        {/* SECCIÓN: ELIMINAR CUENTA */}
        {section === 'danger' && (
          <div className={styles.section}>
            <div className={styles.dangerBox}>
              <AlertTriangle size={20} className={styles.dangerIcon} />
              <p>Esta acción es <strong>irreversible</strong>. Se eliminarán todos tus juegos, sagas y datos asociados.</p>
            </div>
            <label className={styles.label}>Escribe tu correo para confirmar</label>
            <div className={styles.inputWrap}>
              <Mail size={15} className={styles.inputIcon} />
              <input className={styles.input} type="email" placeholder={email} value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} />
            </div>
            <button className={styles.btnDanger} onClick={handleDeleteAccount} disabled={loading || deleteConfirm !== email}>
              {loading ? 'Eliminando...' : 'Eliminar mi cuenta permanentemente'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
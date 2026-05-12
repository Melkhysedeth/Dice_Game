import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escucha cambios: login, logout, token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loginWithEmail(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function registerWithEmail(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: username }
      }
    })
    if (error) throw error

    if (data.user) {
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          username: data.user.email,
          full_name: username
        })
    }
  }

  async function loginWithOAuth(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) throw error
  }

  return { user, loading, loginWithEmail, registerWithEmail, loginWithOAuth, logout, resetPassword }
}
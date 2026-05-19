import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profileName, setProfileName] = useState(() => {
        return localStorage.getItem('gq_profileName') || null
    })
    const [loading, setLoading] = useState(false)

    // Escuchar cambios de sesión
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (!session) {
                setProfileName(null)
                localStorage.removeItem('gq_profileName')  // 👈 aquí
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    // Cargar perfil cuando hay usuario
    useEffect(() => {
        if (!user?.id) return
        supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
                const name = data?.full_name || data?.username || null
                setProfileName(name)
                if (name) localStorage.setItem('gq_profileName', name)
            })
    }, [user?.id])

    const userName = profileName
        ?? user?.user_metadata?.full_name
        ?? user?.email?.split('@')[0]
        ?? 'Jugador'

    return (
        <AuthContext.Provider value={{ user, userName, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    return useContext(AuthContext)
}
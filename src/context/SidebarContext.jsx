import { createContext, useContext, useState } from 'react'

/**
 * Modos del sidebar:
 *  'collapsed' → siempre 64px, sin hover
 *  'hover'     → 64px en reposo, se expande al pasar el mouse (comportamiento anterior)
 *  'expanded'  → siempre 300px, pinned
 */
const SidebarContext = createContext(null)

export function SidebarProvider({ children }) {
  const [sidebarMode, setSidebarMode] = useState('expanded') // estado inicial

  return (
    <SidebarContext.Provider value={{ sidebarMode, setSidebarMode }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used inside SidebarProvider')
  return ctx
}
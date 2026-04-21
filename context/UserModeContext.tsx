"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { LS_USER_MODE, LS_INVESTOR_ID, type UserMode } from "@/types/analysis"

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserModeContextValue {
  mode: UserMode | null
  investorId: string | null
  setMode: (mode: UserMode) => void
  clearMode: () => void
  isLoaded: boolean
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UserModeContext = createContext<UserModeContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

function generateInvestorId() {
  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function UserModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<UserMode | null>(null)
  const [investorId, setInvestorId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedMode = localStorage.getItem(LS_USER_MODE) as UserMode | null
    const validModes: UserMode[] = ["founder", "investor"]
    if (storedMode && validModes.includes(storedMode)) {
      setModeState(storedMode)
    }

    // Ensure a stable investor ID exists
    let id = localStorage.getItem(LS_INVESTOR_ID)
    if (!id) {
      id = generateInvestorId()
      localStorage.setItem(LS_INVESTOR_ID, id)
    }
    setInvestorId(id)
    setIsLoaded(true)
  }, [])

  const setMode = useCallback((newMode: UserMode) => {
    localStorage.setItem(LS_USER_MODE, newMode)
    setModeState(newMode)
  }, [])

  const clearMode = useCallback(() => {
    localStorage.removeItem(LS_USER_MODE)
    setModeState(null)
  }, [])

  return (
    <UserModeContext.Provider value={{ mode, investorId, setMode, clearMode, isLoaded }}>
      {children}
    </UserModeContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUserMode(): UserModeContextValue {
  const ctx = useContext(UserModeContext)
  if (!ctx) {
    throw new Error("useUserMode must be used inside <UserModeProvider>")
  }
  return ctx
}

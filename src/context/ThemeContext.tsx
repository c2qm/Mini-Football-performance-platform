import { createContext, useContext, useEffect, useState } from 'react'
import { loadTheme, saveTheme } from '../utils/storage'

type Theme = 'light' | 'dark'
interface Ctx { theme: Theme; isDark: boolean; toggle: () => void }

const ThemeCtx = createContext<Ctx>({ theme: 'light', isDark: false, toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => loadTheme() ?? 'light')

  useEffect(() => { saveTheme(theme) }, [theme])

  return (
    <ThemeCtx.Provider value={{ theme, isDark: theme === 'dark', toggle: () => setTheme(t => t === 'light' ? 'dark' : 'light') }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export const useTheme = () => useContext(ThemeCtx)

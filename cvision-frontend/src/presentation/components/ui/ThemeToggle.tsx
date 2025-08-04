'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/presentation/providers/ThemeProvider'
import { Button } from './Button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="relative h-10 w-10 rounded-full"
    >
      {theme === 'light' && (
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all" />
      )}
      {theme === 'dark' && (
        <Moon className="h-5 w-5 rotate-0 scale-100 transition-all" />
      )}
      {theme === 'system' && (
        <Monitor className="h-5 w-5 rotate-0 scale-100 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
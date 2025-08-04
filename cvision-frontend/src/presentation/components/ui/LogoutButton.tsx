'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from './Button'

export default function LogoutButton() {
  const { logout, user } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">
        {user.email}
      </span>
      <Button
        variant="outline"
        onClick={logout}
        className="text-red-600 border-red-600 hover:bg-red-50"
      >
        Çıkış Yap
      </Button>
    </div>
  )
}
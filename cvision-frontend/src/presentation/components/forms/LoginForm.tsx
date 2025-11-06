'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuth } from '@/contexts/AuthContext'

interface LoginForm {
  email: string
  password: string
}

interface LoginResponse {
  statusCode: number
  data: {
    token: string
    refreshToken: string
  }
  message: string
  isSuccess: boolean
}

export function LoginForm() {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Partial<LoginForm>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  // Show success message if redirected from registration
  useState(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(message)
    }
  })

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {}

    if (!form.email) {
      newErrors.email = 'Email required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!form.password) {
      newErrors.password = 'Password required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!validateForm()) return
  
      setIsLoading(true)
      setSuccessMessage('')
      setErrors({})
      
      try {
        const result = await login(form.email, form.password)
        
        if (result.success) {
          router.push('/')
        } else {
          // Display the specific error message from the backend
          setErrors({ email: result.message || 'Login failed. Please try again.' })
        }
      } catch (error) {
        setErrors({ email: 'Network error. Please check your connection and try again.' })
      } finally {
        setIsLoading(false)
      }
    }

  const handleInputChange = (field: keyof LoginForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Success Message */}
      {successMessage && (
        <div className="p-3 rounded-lg bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm border border-green-200 dark:border-green-800">
          <div className="flex">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </div>
        </div>
      )}
      
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          placeholder="example@email.com"
          required
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
        )}
      </div>
      
      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={handleInputChange('password')}
          error={errors.password}
          placeholder="••••••••"
          required
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
        )}
      </div>
      
      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Logining...' : 'Login'}
      </Button>
    </form>
  )
}

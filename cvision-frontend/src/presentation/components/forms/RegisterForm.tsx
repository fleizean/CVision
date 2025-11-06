'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface RegisterForm {
  email: string
  name: string
  surname: string
  password: string
  passwordConfirm: string
}

interface RegisterResponse {
  statusCode: number
  data: any
  message: string
  isSuccess: boolean
}

export function RegisterForm() {
  const [form, setForm] = useState<RegisterForm>({
    email: '',
    name: '',
    surname: '',
    password: '',
    passwordConfirm: ''
  })
  const [errors, setErrors] = useState<Partial<RegisterForm>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterForm> = {}

    if (!form.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!form.name.trim()) {
      newErrors.name = 'First name is required'
    }

    if (!form.surname.trim()) {
      newErrors.surname = 'Last name is required'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!form.passwordConfirm) {
      newErrors.passwordConfirm = 'Password confirmation is required'
    } else if (form.password !== form.passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const response = await fetch('http://localhost:5117/api/auths/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          surname: form.surname,
          password: form.password,
          passwordConfirm: form.passwordConfirm
        })
      })

      const data: RegisterResponse = await response.json()

      if (data.statusCode === 200) {
        router.push('/login?message=Registration successful! Please login.')
      } else if (data.statusCode === 400) {
        // Extract the specific error message from the response
        const errorMessage = data.message || 'Register not successful. Please try again.'
        // Check if it's an email-related error
        if (errorMessage.toLowerCase().includes('username') && errorMessage.toLowerCase().includes('already taken')) {
          setErrors({ email: 'This email is already registered.' })
        } else {
          setErrors({ email: errorMessage })
        }
      }
      else {
        setErrors({ email: 'Register not successful. Please try again.' })
      }
    } catch (error) {
      setErrors({ email: 'Network error. Please check your connection and try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof RegisterForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Fields Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Firstname
          </label>
          <Input
            id="name"
            type="text"
            value={form.name}
            onChange={handleInputChange('name')}
            error={errors.name}
            placeholder="Firstname"
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Surname
          </label>
          <Input
            id="surname"
            type="text"
            value={form.surname}
            onChange={handleInputChange('surname')}
            error={errors.surname}
            placeholder="Surname"
            required
          />
          {errors.surname && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.surname}</p>
          )}
        </div>
      </div>
      
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
      
      {/* Password Confirmation Field */}
      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirm Password
        </label>
        <Input
          id="passwordConfirm"
          type="password"
          value={form.passwordConfirm}
          onChange={handleInputChange('passwordConfirm')}
          error={errors.passwordConfirm}
          placeholder="••••••••"
          required
        />
        {errors.passwordConfirm && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.passwordConfirm}</p>
        )}
      </div>
      
      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Registering...' : 'Register'}
      </Button>
    </form>
  )
}

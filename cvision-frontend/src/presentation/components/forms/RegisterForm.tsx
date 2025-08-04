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
      newErrors.email = 'Email gereklidir'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Geçersiz email formatı'
    }

    if (!form.name.trim()) {
      newErrors.name = 'Ad gereklidir'
    }

    if (!form.surname.trim()) {
      newErrors.surname = 'Soyad gereklidir'
    }

    if (!form.password) {
      newErrors.password = 'Şifre gereklidir'
    } else if (form.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır'
    }

    if (!form.passwordConfirm) {
      newErrors.passwordConfirm = 'Şifre onayı gereklidir'
    } else if (form.password !== form.passwordConfirm) {
      newErrors.passwordConfirm = 'Şifreler eşleşmiyor'
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
      console.log('Register response:', data)

      if (data.statusCode === 200) {
        router.push('/login?message=Kayıt başarılı. Lütfen giriş yapın.')
      } else if (data.statusCode === 400) {
        // Extract the specific error message from the response
        const errorMessage = data.message || 'Kayıt başarısız'
        // Check if it's an email-related error
        if (errorMessage.toLowerCase().includes('username') && errorMessage.toLowerCase().includes('already taken')) {
          setErrors({ email: 'Bu e-posta adresi zaten kullanılmakta.' })
        } else {
          setErrors({ email: errorMessage })
        }
      }
      else {
        setErrors({ email: 'Kayıt başarısız. Lütfen tekrar deneyin.' })
      }
    } catch (error) {
      setErrors({ email: 'Bağlantı hatası. Lütfen tekrar deneyin.' })
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
            Ad
          </label>
          <Input
            id="name"
            type="text"
            value={form.name}
            onChange={handleInputChange('name')}
            error={errors.name}
            placeholder="Adınız"
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Soyad
          </label>
          <Input
            id="surname"
            type="text"
            value={form.surname}
            onChange={handleInputChange('surname')}
            error={errors.surname}
            placeholder="Soyadınız"
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
          E-posta
        </label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          placeholder="ornek@email.com"
          required
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
        )}
      </div>
      
      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Şifre
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
          Şifre Tekrarı
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
        {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
      </Button>
    </form>
  )
}

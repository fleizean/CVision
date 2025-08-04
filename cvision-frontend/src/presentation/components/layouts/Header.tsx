'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, FileText, User, LogOut, Settings, ChevronDown, Shield } from 'lucide-react'
import { Button } from '@/presentation/components/ui/Button'
import { ThemeToggle } from '@/presentation/components/ui/ThemeToggle'
import { useAuth } from '@/contexts/AuthContext'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuShortcut,
} from '@/presentation/components/ui/DropdownMenu'

interface HeaderProps {
  isAuthenticated?: boolean
}

export function Header({ isAuthenticated = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout, isLoading, isAuthenticated: authIsAuthenticated } = useAuth()
  const { isAdmin, canManageUsers, getAllRoles } = useRolePermissions()
  
  // Use actual authentication state instead of prop when available
  const actuallyAuthenticated = isLoading ? false : (authIsAuthenticated || isAuthenticated)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  // Show loading skeleton while auth is loading
  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:border-gray-800 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo.png"
              alt="CVision Logo"
              width={40}
              height={40}
              className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              CVision
            </span>
          </Link>

          {/* Loading skeleton for navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          {/* Loading skeleton for actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:border-gray-800 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/logo.png"
            alt="CVision Logo"
            width={40}
            height={40}
            className="h-8 w-8" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            CVision
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {actuallyAuthenticated ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
              >
                Dashboard
              </Link>
              
              {/* CV Analysis Dropdown */}
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium">
                  CV Analysis
                  <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" variant="elegant" className="bg-white dark:bg-gray-900 dark:border-gray-800">
                  <DropdownMenuLabel className="dark:text-gray-200">Analysis Tools</DropdownMenuLabel>
                  <DropdownMenuSeparator className="dark:bg-gray-800" />
                  <DropdownMenuItem asChild>
                  <Link href="/cv-analysis/upload" className="cursor-pointer flex items-center dark:text-gray-200 dark:hover:bg-gray-800">
                    <FileText className="mr-2 h-4 w-4" />
                    Upload CV
                    <DropdownMenuShortcut className="dark:text-gray-400">⌘U</DropdownMenuShortcut>
                  </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                  <Link href="/cv-analysis/history" className="cursor-pointer flex items-center dark:text-gray-200 dark:hover:bg-gray-800">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Analysis History
                    <DropdownMenuShortcut className="dark:text-gray-400">⌘H</DropdownMenuShortcut>
                  </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:bg-gray-800" />
                  <DropdownMenuItem asChild>
                  <Link href="/cv-analysis/templates" className="cursor-pointer flex items-center dark:text-gray-200 dark:hover:bg-gray-800">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CV Templates
                    <DropdownMenuShortcut className="dark:text-gray-400">⌘T</DropdownMenuShortcut>
                  </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
              
              <Link 
                href="/job-profiles" 
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
              >
                Job Profiles
              </Link>

              {/* Admin Only Navigation */}
              <RoleGuard requiredRole="Admin">
                <Link 
                  href="/admin" 
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
                >
                  Admin Panel
                </Link>
              </RoleGuard>

              {/* Users with management permissions */}
              <RoleGuard requiredRoles={['Admin', 'Moderator']}>
                <Link 
                  href="/manage-users" 
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
                >
                  Manage Users
                </Link>
              </RoleGuard>
            </>
          ) : (
            <>
              <Link 
                href="/features" 
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
              >
                Pricing
              </Link>
              <Link 
                href="/about" 
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
              >
                About
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          
          {actuallyAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white relative">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                  {isAdmin() && (
                    <Shield className="absolute -top-1 -right-1 h-3 w-3 text-amber-400" />
                  )}
                </div>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium dark:text-gray-200">
                    {user?.name && user?.surname ? `${user.name} ${user.surname}` : user?.email?.split('@')[0]}
                  </span>
                  {isAdmin() && (
                    <span className="text-xs text-amber-500 dark:text-amber-400 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Administrator
                    </span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 ml-1 dark:text-gray-300" />
              </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" variant="elegant" className="w-64 bg-white dark:bg-gray-900 dark:border-gray-800">
              <DropdownMenuLabel className="dark:text-gray-200">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {user?.name && user?.surname ? `${user.name} ${user.surname}` : 'My Account'}
                    </span>
                    {isAdmin() && <Shield className="h-4 w-4 text-amber-500" />}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="dark:bg-gray-800" />
              <DropdownMenuItem asChild variant='default'>
                <Link href="/profile" className="cursor-pointer flex items-center dark:text-gray-200 dark:hover:bg-gray-800">
                <User className="mr-2 h-4 w-4" />
                Profile
                <DropdownMenuShortcut className="dark:text-gray-400">⇧⌘P</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild variant='default'>
                <Link href="/settings" className="cursor-pointer flex items-center dark:text-gray-200 dark:hover:bg-gray-800">
                <Settings className="mr-2 h-4 w-4" />
                Settings
                <DropdownMenuShortcut className="dark:text-gray-400">⌘,</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="dark:bg-gray-800" />
              <DropdownMenuItem variant="destructive" onClick={handleLogout} className="cursor-pointer dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
                <DropdownMenuShortcut className="dark:text-gray-400">⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="h-9 w-9"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {actuallyAuthenticated ? (
              <>
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-lg dark:text-gray-200 relative">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                    {isAdmin() && (
                      <Shield className="absolute -top-1 -right-1 h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium dark:text-gray-200">
                        {user?.name && user?.surname ? `${user.name} ${user.surname}` : user?.email?.split('@')[0]}
                      </span>
                      {isAdmin() && <Shield className="h-4 w-4 text-amber-500" />}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </span>
                    {isAdmin() && (
                      <span className="text-xs text-amber-500 dark:text-amber-400">
                        Administrator
                      </span>
                    )}
                  </div>
                </div>
                <Link 
                  href="/dashboard"
                  className="flex items-center space-x-2 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </span>
                  <span>Dashboard</span>
                </Link>
                <Link 
                  href="/cv-analysis"
                  className="flex items-center space-x-2 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span>CV Analysis</span>
                </Link>
                <Link 
                  href="/job-profiles"
                  className="flex items-center space-x-2 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span>Job Profiles</span>
                </Link>
                <Link 
                  href="/profile"
                  className="flex items-center space-x-2 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                    <User className="h-4 w-4" />
                  </span>
                  <span>Profile</span>
                </Link>
                <Link 
                  href="/settings"
                  className="flex items-center space-x-2 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                    <Settings className="h-4 w-4" />
                  </span>
                  <span>Settings</span>
                </Link>
                
                {/* Admin Only Mobile Navigation */}
                <RoleGuard requiredRole="Admin">
                  <Link 
                    href="/admin"
                    className="flex items-center space-x-2 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </span>
                    <span>Admin Panel</span>
                  </Link>
                </RoleGuard>

                <RoleGuard requiredRoles={['Admin', 'Moderator']}>
                  <Link 
                    href="/manage-users"
                    className="flex items-center space-x-2 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </span>
                    <span>Manage Users</span>
                  </Link>
                </RoleGuard>
                
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full justify-start mt-4 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-0"
                >
                  <span className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                  <LogOut className="h-4 w-4" />
                  </span>
                  <span>Logout</span>
                  
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/features"
                  className="block py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  href="/pricing"
                  className="block py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  href="/about"
                  className="block py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full justify-start">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
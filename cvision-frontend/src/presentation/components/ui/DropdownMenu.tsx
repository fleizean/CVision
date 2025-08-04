import * as React from "react"
import { cn } from "../../../shared/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children: React.ReactNode
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  alignOffset?: number
  variant?: 'default' | 'elegant' | 'minimal'
  children: React.ReactNode
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  asChild?: boolean
  variant?: 'default' | 'destructive' | 'success'
  children: React.ReactNode
}

interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface DropdownMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  triggerId: string
}>({
  open: false,
  setOpen: () => {},
  triggerId: ""
})

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ children, open: controlledOpen, onOpenChange, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const triggerId = React.useId()
    
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = React.useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }, [controlledOpen, onOpenChange])

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element
        if (!target.closest(`[data-dropdown-menu="${triggerId}"]`)) {
          setOpen(false)
        }
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false)
        }
      }

      if (open) {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }, [open, setOpen, triggerId])

    return (
      <DropdownMenuContext.Provider value={{ open, setOpen, triggerId }}>
        <div
          ref={ref}
          className="relative inline-block"
          data-dropdown-menu={triggerId}
          {...props}
        >
          {children}
        </div>
      </DropdownMenuContext.Provider>
    )
  }
)

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, children, asChild, ...props }, ref) => {
    const { open, setOpen } = React.useContext(DropdownMenuContext)

    const handleClick = () => {
      setOpen(!open)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setOpen(!open)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setOpen(true)
      }
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...(children.props as {}),
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        'aria-expanded': open,
        'aria-haspopup': 'menu',
        'data-state': open ? 'open' : 'closed',
      } as React.HTMLAttributes<HTMLElement>)
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          "hover:bg-gray-50 active:scale-95 dark:hover:bg-gray-800",
          open && "bg-gray-100 dark:bg-gray-700",
          className
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        data-state={open ? 'open' : 'closed'}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </button>
    )
  }
)

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = 'center', side = 'bottom', sideOffset = 4, alignOffset = 0, variant = 'default', children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(DropdownMenuContext)
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useImperativeHandle(ref, () => contentRef.current!)

    React.useEffect(() => {
      if (open && contentRef.current) {
        const firstItem = contentRef.current.querySelector('[role="menuitem"]:not([disabled])')
        if (firstItem instanceof HTMLElement) {
          firstItem.focus()
        }
      }
    }, [open])

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }

      const items = Array.from(contentRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])') || [])
      const currentIndex = items.indexOf(event.target as Element)

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        ;(items[nextIndex] as HTMLElement)?.focus()
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        ;(items[prevIndex] as HTMLElement)?.focus()
      } else if (event.key === 'Home') {
        event.preventDefault()
        ;(items[0] as HTMLElement)?.focus()
      } else if (event.key === 'End') {
        event.preventDefault()
        ;(items[items.length - 1] as HTMLElement)?.focus()
      }
    }

    if (!open) return null

    const alignmentClasses = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0'
    }

    const sideClasses = {
      top: 'bottom-full mb-1',
      right: 'left-full top-0 ml-1',
      bottom: 'top-full mt-1',
      left: 'right-full top-0 mr-1'
    }

    const variantClasses = {
      default: "bg-white/95 border-gray-200/80 dark:bg-gray-800/95 dark:border-gray-600",
      elegant: "bg-white/98 border-gray-100 shadow-2xl dark:bg-gray-900/98 dark:border-gray-700",
      minimal: "bg-white border-gray-300 shadow-lg dark:bg-gray-800 dark:border-gray-600"
    }

    return (
      <div
        ref={contentRef}
        className={cn(
          "absolute z-50 min-w-[12rem] max-w-[20rem] overflow-hidden rounded-xl border backdrop-blur-sm p-2 shadow-xl",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200",
          "shadow-gray-900/10 dark:shadow-2xl",
          variantClasses[variant],
          sideClasses[side],
          alignmentClasses[align],
          className
        )}
        role="menu"
        aria-orientation="vertical"
        onKeyDown={handleKeyDown}
        style={{
          marginTop: side === 'bottom' ? sideOffset : undefined,
          marginBottom: side === 'top' ? sideOffset : undefined,
          marginLeft: side === 'right' ? sideOffset : undefined,
          marginRight: side === 'left' ? sideOffset : undefined,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, disabled, asChild, variant = 'default', children, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext)

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      onClick?.(event)
      setOpen(false)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!disabled) {
          onClick?.(event as any)
          setOpen(false)
        }
      }
    }

    const variantClasses = {
      default: [
        "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-900",
        "focus:bg-gradient-to-r focus:from-blue-50 focus:to-indigo-50 focus:text-blue-900",
        "dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 dark:hover:text-blue-100",
        "dark:focus:from-blue-900/20 dark:focus:to-indigo-900/20 dark:focus:text-blue-100"
      ],
      destructive: [
        "hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-900",
        "focus:bg-gradient-to-r focus:from-red-50 focus:to-pink-50 focus:text-red-900",
        "dark:hover:from-red-900/20 dark:hover:to-pink-900/20 dark:hover:text-red-100",
        "dark:focus:from-red-900/20 dark:focus:to-pink-900/20 dark:focus:text-red-100"
      ],
      success: [
        "hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-900",
        "focus:bg-gradient-to-r focus:from-green-50 focus:to-emerald-50 focus:text-green-900",
        "dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 dark:hover:text-green-100",
        "dark:focus:from-green-900/20 dark:focus:to-emerald-900/20 dark:focus:text-green-100"
      ]
    }

    const itemClasses = cn(
      "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none",
      "transition-all duration-150 ease-in-out font-medium",
      "active:scale-[0.98] hover:shadow-sm",
      ...variantClasses[variant],
      disabled && "pointer-events-none opacity-40 grayscale",
      className
    )

    if (asChild && React.isValidElement(children)) {
      const childProps = children.props as { className?: string }
      return React.cloneElement(children, {
        ...childProps,
        ...props,
        className: cn(itemClasses, childProps.className),
        role: "menuitem",
        tabIndex: disabled ? -1 : 0,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        'aria-disabled': disabled,
      } as React.HTMLAttributes<HTMLElement>)
        
    }

    return (
      <div
        ref={ref}
        className={itemClasses}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "-mx-1 my-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent",
        "dark:via-gray-600",
        className
      )}
      role="separator"
      {...props}
    />
  )
)

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400",
        "select-none pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

const DropdownMenuShortcut = React.forwardRef<HTMLSpanElement, DropdownMenuShortcutProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "ml-auto text-xs tracking-widest opacity-60 font-mono",
        "text-gray-500 dark:text-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
)

DropdownMenu.displayName = "DropdownMenu"
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"
DropdownMenuContent.displayName = "DropdownMenuContent"
DropdownMenuItem.displayName = "DropdownMenuItem"
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"
DropdownMenuLabel.displayName = "DropdownMenuLabel"
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut
}
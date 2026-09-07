// Tiny dependency-free router. Paths are relative to the /dashboard base.
import { createContext, useContext, useEffect, useState, type ReactNode, type MouseEvent } from 'react'

export const BASE = '/dashboard'

const strip = (p: string) => {
  let x = p.startsWith(BASE) ? p.slice(BASE.length) : p
  if (!x.startsWith('/')) x = '/' + x
  return x.replace(/\/+$/, '') || '/'
}

const Ctx = createContext<{ path: string; go: (to: string, replace?: boolean) => void }>({ path: '/', go: () => {} })

export function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => strip(window.location.pathname))
  useEffect(() => {
    const on = () => setPath(strip(window.location.pathname))
    window.addEventListener('popstate', on)
    return () => window.removeEventListener('popstate', on)
  }, [])
  const go = (to: string, replace = false) => {
    const next = strip(to)
    if (next === path) return
    window.history[replace ? 'replaceState' : 'pushState']({}, '', BASE + (next === '/' ? '/' : next))
    setPath(next)
    window.scrollTo(0, 0)
  }
  return <Ctx.Provider value={{ path, go }}>{children}</Ctx.Provider>
}

export const useRoute = () => useContext(Ctx)

export function Link({ to, className, children, onClick, title }: { to: string; className?: string; children: ReactNode; onClick?: (e: MouseEvent) => void; title?: string }) {
  const { go } = useRoute()
  const click = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey) return
    e.preventDefault()
    onClick?.(e)
    go(to)
  }
  return <a href={BASE + strip(to)} className={className} title={title} onClick={click}>{children}</a>
}

/** match('/sites/:id/step/:step', path) → {id, step} | null */
export function match(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split('/').filter(Boolean)
  const b = path.split('/').filter(Boolean)
  if (a.length !== b.length) return null
  const out: Record<string, string> = {}
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) out[a[i].slice(1)] = decodeURIComponent(b[i])
    else if (a[i] !== b[i]) return null
  }
  return out
}

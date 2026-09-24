import { useState } from 'react'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1800)
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-canvas-dark)' }}
      >
        {/* Grid texture */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Accent circle */}
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />
        <div
          className="absolute top-1/3 right-0 w-64 h-64 rounded-full opacity-10 translate-x-1/2"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>A</span>
            </div>
            <span className="text-white font-medium tracking-wide text-sm">Atelier</span>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 max-w-sm">
          <p className="text-xs uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--color-accent)' }}>
            Welcome back
          </p>
          <h1
            className="text-5xl leading-[1.1] text-white mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Where work<br />
            <em>finds form.</em>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Sign in to continue to your workspace. Everything you left is exactly where you left it.
          </p>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 border-l-2 pl-5" style={{ borderColor: 'var(--color-accent)' }}>
          <p className="text-sm leading-relaxed italic mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
            "The most focused environment I've ever worked in. Nothing superfluous, nothing missing."
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: 'rgba(201,169,110,0.3)' }}
            >
              M
            </div>
            <div>
              <p className="text-xs font-medium text-white">Maya Chen</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Design Lead, Forma Studio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        className="flex-1 flex items-center justify-center px-8 py-16"
        style={{ backgroundColor: 'var(--color-canvas-light)' }}
      >
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div
              className="w-7 h-7 rounded-sm flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-canvas-dark)' }}
            >
              <span className="text-white font-bold text-xs" style={{ fontFamily: 'var(--font-display)' }}>A</span>
            </div>
            <span className="font-medium tracking-wide text-sm" style={{ color: 'var(--color-ink)' }}>Atelier</span>
          </div>

          <h2
            className="text-3xl mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
          >
            Sign in
          </h2>
          <p className="text-sm mb-9" style={{ color: 'var(--color-muted)' }}>
            New here?{' '}
            <a
              href="#"
              className="font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-ink)', textDecorationLine: 'underline', textUnderlineOffset: '3px' }}
            >
              Create an account
            </a>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-[0.12em] mb-2"
                style={{ color: 'var(--color-muted)' }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm rounded-md border outline-none transition-all duration-150 placeholder-gray-400"
                style={{
                  backgroundColor: 'var(--color-input-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-ink)',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--color-canvas-dark)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,31,46,0.08)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium uppercase tracking-[0.12em]"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-muted)', textDecorationLine: 'underline', textUnderlineOffset: '2px' }}
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 text-sm rounded-md border outline-none transition-all duration-150 placeholder-gray-400"
                  style={{
                    backgroundColor: 'var(--color-input-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-ink)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-canvas-dark)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,31,46,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-60"
                  style={{ color: 'var(--color-muted)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                role="checkbox"
                aria-checked="false"
                className="w-4 h-4 rounded border flex-shrink-0 transition-colors"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-input-bg)' }}
              />
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Keep me signed in for 30 days
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-medium rounded-md transition-all duration-200 mt-2"
              style={{
                backgroundColor: loading ? 'rgba(26,31,46,0.7)' : 'var(--color-canvas-dark)',
                color: 'white',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.backgroundColor = '#252c3f' }}
              onMouseLeave={e => { if (!loading) (e.target as HTMLElement).style.backgroundColor = 'var(--color-canvas-dark)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs" style={{ backgroundColor: 'var(--color-canvas-light)', color: 'var(--color-muted)' }}>
                or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Google',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                ),
              },
              {
                label: 'GitHub',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                ),
              },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 text-xs font-medium rounded-md border transition-all duration-150 hover:bg-white"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-ink)',
                }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          <p className="text-xs mt-10 text-center leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            By signing in, you agree to our{' '}
            <a href="#" className="underline underline-offset-2 hover:opacity-70">Terms</a>
            {' '}and{' '}
            <a href="#" className="underline underline-offset-2 hover:opacity-70">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

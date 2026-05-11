export default function Landing() {
  const handleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || '';
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background gfx */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-2xl glow-brand">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4" />
              <circle cx="12" cy="2" r="1.5" fill="white" stroke="none" />
              <rect x="3" y="6" width="18" height="14" rx="4" />
              <circle cx="8" cy="12" r="1.5" fill="white" stroke="none" />
              <circle cx="16" cy="12" r="1.5" fill="white" stroke="none" />
              <path d="M10 16h4" />
              <path d="M1 12h2" />
              <path d="M21 12h2" />
            </svg>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black text-white tracking-tight">RedditIQ</h1>
            <p className="text-sm text-brand-400 font-medium">AI Creator Intelligence</p>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-5xl font-black text-white mb-4 leading-tight">
          Build threads that{' '}
          <span className="text-gradient-brand">actually perform</span>
        </h2>

        <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
          AI-powered hook scoring, tweet-level engagement drop-off analysis, and sentiment-aware 
          response strategies — built for serious Reddit creators.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { icon: '🎯', label: 'Hook Scoring' },
            { icon: '📊', label: 'Drop-off Analysis' },
            { icon: '🛡️', label: 'Comment Defense' },
            { icon: '🤖', label: 'Gemini AI' },
            { icon: '🔬', label: 'Advanced NLP' },
          ].map(f => (
            <span key={f.label} className="glass-card px-4 py-2 text-sm text-gray-300 flex items-center gap-2">
              <span>{f.icon}</span>
              {f.label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          id="google-signin-btn"
          onClick={handleLogin}
          className="btn-primary text-base px-8 py-4 rounded-2xl shadow-2xl shadow-brand-900/60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-xs text-gray-600">
          Your data is private. RedditIQ only reads what you analyse.
        </p>
      </div>

      {/* Bottom feature cards */}
      <div className="relative z-10 w-full max-w-4xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
        {[
          {
            icon: '🔍',
            title: 'Smart Research Engine',
            desc: 'Fetch trending tweets, extract virality patterns, score hooks by curiosity gap + emotional trigger.',
          },
          {
            icon: '📉',
            title: 'Thread Analytics',
            desc: 'Tweet-level drop-off visualization with D3.js. Click any tweet to drill into comments + sentiment.',
          },
          {
            icon: '🛡️',
            title: 'Comment Defense',
            desc: 'NLP pipeline → category mapping → strategy engine → Gemini generates tone-aware replies.',
          },
        ].map(f => (
          <div key={f.title} className="glass-card p-6">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

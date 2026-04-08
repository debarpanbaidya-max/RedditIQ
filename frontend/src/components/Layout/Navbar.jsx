import { useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';

const titles = {
  '/dashboard/research': { title: 'Smart Topic Research Engine', subtitle: 'Fetch trending context + score hooks with Gemini AI' },
  '/dashboard/analytics': { title: 'Thread Analytics Dashboard', subtitle: 'Drop-off analysis + D3 visualization per tweet' },
  '/dashboard/defense': { title: 'AI Comment Defense System', subtitle: 'NLP pipeline → strategy engine → Gemini replies' },
};

export default function Navbar() {
  const { user, logout } = useStore();
  const { pathname } = useLocation();
  const page = titles[pathname] || { title: 'RedditIQ', subtitle: '' };

  return (
    <header className="h-16 bg-surface-800/60 border-b border-white/5 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-base font-semibold text-white">{page.title}</h1>
        <p className="text-xs text-gray-500">{page.subtitle}</p>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-200">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          {user.avatar && (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-white/10"
            />
          )}
          <button
            onClick={logout}
            id="logout-btn"
            className="btn-ghost text-xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}

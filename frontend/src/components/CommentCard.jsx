import { useState } from 'react';
import SentimentBars from './charts/SentimentBars';
import useStore from '../store/useStore';

const CATEGORY_STYLES = {
  'Hostile':     { badge: 'badge-hostile',     emoji: '😡' },
  'Sarcastic':   { badge: 'badge-sarcastic',   emoji: '😏' },
  'Constructive':{ badge: 'badge-constructive', emoji: '🤔' },
  'Spam':        { badge: 'badge-spam',         emoji: '🚫' },
};

const STRATEGY_STYLES = {
  'IGNORE':  'strategy-ignore',
  'DEFEND':  'strategy-defend',
  'RESPOND': 'strategy-respond',
};

const TONE_COLORS = {
  'Professional': 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/60',
  'Witty':        'border-violet-500/30 bg-violet-500/5 hover:border-violet-500/60',
  'Aggressive':   'border-red-500/30 bg-red-500/5 hover:border-red-500/60',
};

export default function CommentCard({ item }) {
  const [showScores, setShowScores] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [copied, setCopied] = useState(null);
  const { generateReply, replyResults } = useStore();

  const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES['Constructive'];
  const stratStyle = STRATEGY_STYLES[item.strategy] || 'strategy-ignore';
  const replies = replyResults[item.text];

  const handleGenerateReply = async () => {
    setLoadingReply(true);
    try {
      await generateReply(item.text, item.strategy, item.category);
    } catch (e) {
      console.error(e);
    }
    setLoadingReply(false);
  };

  const copyToClipboard = async (text, idx) => {
    await navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="glass-card p-5 space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {item.author && (
              <span className="text-xs text-gray-500 font-mono">@{item.author}</span>
            )}
            <span className={catStyle.badge}>
              {catStyle.emoji} {item.category}
            </span>
            <span className={stratStyle}>
              {item.strategy}
            </span>
            <span className="badge bg-surface-500 text-gray-400 border border-white/5 text-xs">
              {item.engagementLevel} engagement
            </span>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">"{item.text}"</p>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className={`text-lg font-black font-mono ${item.scores?.toxicity > 0.6 ? 'text-red-400' : item.scores?.toxicity > 0.3 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {((item.scores?.toxicity || 0) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600">toxicity</div>
        </div>
      </div>

      {/* Toxicity score breakdown toggle */}
      <div>
        <button
          onClick={() => setShowScores(s => !s)}
          className="btn-ghost text-xs py-1 px-2"
          id={`toggle-scores-${item.text?.slice(0,10)}`}
        >
          {showScores ? '▲ Hide' : '▼ Show'} score breakdown
        </button>

        {showScores && (
          <div className="mt-3 pl-2 animate-fade-in">
            <SentimentBars scores={item.scores} />
          </div>
        )}
      </div>

      {/* Generate reply */}
      {item.strategy !== 'IGNORE' && (
        <div>
          {!replies ? (
            <button
              onClick={handleGenerateReply}
              disabled={loadingReply}
              id={`generate-reply-${item.text?.slice(0,10)}`}
              className="btn-secondary text-xs py-2"
            >
              {loadingReply ? (
                <>
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Generate Reply Options
                </>
              )}
            </button>
          ) : (
            <div className="space-y-2 animate-fade-in">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Reply Options</p>
              {replies.map((reply, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${TONE_COLORS[reply.tone]}`}
                  onClick={() => copyToClipboard(reply.text, idx)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-400">{reply.tone}</span>
                    <span className="text-xs text-gray-600">
                      {copied === idx ? '✅ Copied!' : 'Click to copy'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200">{reply.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {item.strategy === 'IGNORE' && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
          Strategy: Ignore — not worth engaging
        </div>
      )}
    </div>
  );
}

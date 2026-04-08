import { useState } from 'react';
import useStore from '../store/useStore';
import CommentCard from '../components/CommentCard';

export default function Defense() {
  const [inputMode, setInputMode] = useState('manual'); // 'manual' | 'thread'
  const [commentInputs, setCommentInputs] = useState([
    { text: '', author: '', likes: 0, retweets: 0 }
  ]);

  const { analyzeDefense, defenseResults, defenseLoading, defenseError } = useStore();

  const addComment = () => {
    setCommentInputs(prev => [...prev, { text: '', author: '', likes: 0, retweets: 0 }]);
  };

  const removeComment = (idx) => {
    setCommentInputs(prev => prev.filter((_, i) => i !== idx));
  };

  const updateComment = (idx, field, value) => {
    setCommentInputs(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = commentInputs.filter(c => c.text.trim());
    if (valid.length === 0) return;
    analyzeDefense(valid);
  };

  const stats = defenseResults ? {
    total: defenseResults.length,
    hostile: defenseResults.filter(r => r.category === 'Hostile').length,
    constructive: defenseResults.filter(r => r.category === 'Constructive').length,
    ignore: defenseResults.filter(r => r.strategy === 'IGNORE').length,
    respond: defenseResults.filter(r => r.strategy === 'RESPOND').length,
    defend: defenseResults.filter(r => r.strategy === 'DEFEND').length,
  } : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Explanation */}
      <div className="glass-card p-6 border-violet-500/30 shadow-lg shadow-violet-500/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🛡️</span> What is Comment Defense?
        </h2>
        <p className="text-gray-300 mt-2 text-sm leading-relaxed">
          The Comment Defense System protects your brand during heated discussions. Paste toxic or challenging comments here, and our NLP pipeline will categorize the hostility, map out the best response strategy (Ignore, Defend, Respond), and use Gemini AI to generate perfectly toned replies.
        </p>
      </div>

      {/* Input Card */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-white mb-1">Comment Defense System</h2>
        <p className="text-xs text-gray-500 mb-5">
          Paste comments below. We'll run the NLP pipeline to detect toxicity, map to a strategy, and generate Gemini reply options.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {commentInputs.map((c, idx) => (
              <div key={idx} className="p-4 bg-surface-700/40 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 font-semibold">Comment {idx + 1}</p>
                  {commentInputs.length > 1 && (
                    <button type="button" onClick={() => removeComment(idx)} className="btn-ghost text-xs py-1 px-2 text-red-400 hover:text-red-300">
                      Remove
                    </button>
                  )}
                </div>
                <textarea
                  id={`comment-text-${idx}`}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Paste comment text here..."
                  value={c.text}
                  onChange={e => updateComment(idx, 'text', e.target.value)}
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="label">Author (optional)</label>
                    <input
                      type="text"
                      className="input-field text-xs"
                      placeholder="@handle"
                      value={c.author}
                      onChange={e => updateComment(idx, 'author', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Likes</label>
                    <input
                      type="number"
                      className="input-field text-xs"
                      placeholder="0"
                      min="0"
                      value={c.likes}
                      onChange={e => updateComment(idx, 'likes', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="label">Retweets</label>
                    <input
                      type="number"
                      className="input-field text-xs"
                      placeholder="0"
                      min="0"
                      value={c.retweets}
                      onChange={e => updateComment(idx, 'retweets', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="add-comment-btn"
              onClick={addComment}
              className="btn-secondary text-xs py-2"
            >
              + Add Comment
            </button>

            <button
              id="analyze-defense-btn"
              type="submit"
              disabled={defenseLoading || commentInputs.every(c => !c.text.trim())}
              className="btn-primary"
            >
              {defenseLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running Analysis...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Analyze Comments
                </>
              )}
            </button>
          </div>
        </form>

        {defenseError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {defenseError}
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 animate-slide-up">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-200' },
            { label: 'Hostile 😡', value: stats.hostile, color: 'text-red-400' },
            { label: 'Constructive 🤔', value: stats.constructive, color: 'text-emerald-400' },
            { label: 'IGNORE', value: stats.ignore, color: 'text-gray-400' },
            { label: 'DEFEND', value: stats.defend, color: 'text-orange-400' },
            { label: 'RESPOND', value: stats.respond, color: 'text-cyan-400' },
          ].map(s => (
            <div key={s.label} className="glass-card p-3 text-center">
              <div className={`text-xl font-black font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-600 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {defenseResults && (
        <div className="space-y-3 animate-slide-up">
          <h3 className="text-sm font-semibold text-white">Analysis Results</h3>
          {defenseResults.map((item, idx) => (
            <CommentCard key={idx} item={item} />
          ))}
        </div>
      )}

      {!defenseResults && !defenseLoading && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <p className="text-gray-400 text-sm">Add comments above to run the NLP pipeline and get strategy + reply options.</p>
        </div>
      )}
    </div>
  );
}

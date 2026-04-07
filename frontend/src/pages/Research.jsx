import { useState } from 'react';
import useStore from '../store/useStore';
import HookCard from '../components/HookCard';
import BlueprintView from '../components/BlueprintView';

const STANCES = [
  'I agree', 'I disagree', 'It\'s complicated', 'Hot take', 'Contrarian', 'Informational'
];

export default function Research() {
  const [topic, setTopic] = useState('');
  const [stance, setStance] = useState('I disagree');
  const [activeTab, setActiveTab] = useState('hooks');

  const { runResearch, researchResult, researchLoading, researchError } = useStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    runResearch(topic.trim(), stance);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Input Card */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-white mb-1">Topic Research</h2>
        <p className="text-xs text-gray-500 mb-5">
          Enter a topic and your stance — we'll fetch trending Reddit context and score hooks via AI.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Topic</label>
            <input
              id="research-topic"
              type="text"
              className="input-field"
              placeholder='e.g. "AI replacing developers"'
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Your Stance</label>
            <div className="flex flex-wrap gap-2">
              {STANCES.map(s => (
                <button
                  key={s}
                  type="button"
                  id={`stance-${s.replace(/\s/g, '-')}`}
                  onClick={() => setStance(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150
                    ${stance === s
                      ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
                      : 'bg-surface-600/50 border-white/10 text-gray-400 hover:border-white/20'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            id="run-research-btn"
            type="submit"
            disabled={researchLoading || !topic.trim()}
            className="btn-primary"
          >
            {researchLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Fetching trends + scoring hooks...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Analyze Topic
              </>
            )}
          </button>
        </form>

        {researchError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {researchError}
          </div>
        )}
      </div>

      {/* Results */}
      {researchResult && (
        <div className="animate-slide-up space-y-4">
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Posts Analyzed', value: researchResult.trending_count, color: 'text-cyan-400' },
              { label: 'Top Hook Score', value: researchResult.hooks?.[0]?.score?.toFixed(1), color: 'text-emerald-400' },
              { label: 'Comments Length', value: researchResult.blueprint?.length + ' comments', color: 'text-brand-400' },
            ].map(stat => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <div className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Virality patterns */}
          {researchResult.virality_patterns?.length > 0 && (
            <div className="glass-card p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Virality Patterns Detected</p>
              <div className="flex flex-wrap gap-2">
                {researchResult.virality_patterns.map((p, i) => (
                  <span key={i} className="badge bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    ✦ {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex gap-1 bg-surface-700/50 rounded-xl p-1 w-fit">
            {[
              { id: 'hooks', label: '🎯 Hooks' },
              { id: 'blueprint', label: '🗺️ Blueprint' },
            ].map(tab => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Hooks grid */}
          {activeTab === 'hooks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {researchResult.hooks?.map((hook, i) => (
                <HookCard key={i} hook={hook} rank={i + 1} />
              ))}
            </div>
          )}

          {/* Blueprint */}
          {activeTab === 'blueprint' && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Thread Blueprint</h3>
              <BlueprintView blueprint={researchResult.blueprint} />
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!researchResult && !researchLoading && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-400 text-sm">Enter a topic above to generate scored hooks and a thread blueprint.</p>
        </div>
      )}
    </div>
  );
}

const ANGLE_COLORS = {
  'Fear-based': 'from-red-500/20 to-red-900/5 border-red-500/20',
  'Informational': 'from-cyan-500/20 to-cyan-900/5 border-cyan-500/20',
  'Controversial': 'from-orange-500/20 to-orange-900/5 border-orange-500/20',
  'Opinionated': 'from-violet-500/20 to-violet-900/5 border-violet-500/20',
  'Pattern Interrupt': 'from-brand-500/20 to-brand-900/5 border-brand-500/20',
};

const ANGLE_ICONS = {
  'Fear-based': '😨',
  'Informational': 'ℹ️',
  'Controversial': '🔥',
  'Opinionated': '💬',
  'Pattern Interrupt': '⚡',
};

function ScoreMeter({ value, label }) {
  const pct = Math.min(100, (value / 10) * 100);
  const color = value >= 8 ? 'bg-emerald-500' : value >= 6 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className={`text-xs font-mono font-bold ${value >= 8 ? 'text-emerald-400' : value >= 6 ? 'text-amber-400' : 'text-red-400'}`}>
          {value.toFixed(1)}
        </span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function HookCard({ hook, rank, onSave }) {
  const gradient = ANGLE_COLORS[hook.angle] || 'from-brand-500/20 to-brand-900/5 border-brand-500/20';
  const icon = ANGLE_ICONS[hook.angle] || '✨';

  return (
    <div className={`glass-card-hover bg-gradient-to-br ${gradient} p-5 animate-slide-up`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{hook.angle}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-2xl font-black font-mono ${hook.score >= 8 ? 'score-high' : hook.score >= 6 ? 'score-medium' : 'score-low'}`}>
            {hook.score.toFixed(1)}
          </div>
          <span className="text-gray-600 text-xs">/10</span>
          {rank === 1 && (
            <span className="badge bg-amber-500/20 text-amber-400 border border-amber-500/30">
              🏆 Best
            </span>
          )}
        </div>
      </div>

      <blockquote className="text-gray-100 font-medium text-sm leading-relaxed mb-4 border-l-2 border-white/20 pl-3 italic">
        "{hook.text}"
      </blockquote>

      <div className="space-y-2">
        <ScoreMeter value={hook.curiosity_gap} label="Curiosity Gap" />
        <ScoreMeter value={hook.emotional_trigger} label="Emotional Trigger" />
        <ScoreMeter value={hook.controversy} label="Controversy" />
      </div>
    </div>
  );
}

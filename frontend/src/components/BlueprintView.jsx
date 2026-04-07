const ROLE_COLORS = {
  'Hook':        'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'Problem':     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Insight':     'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Contrarian':  'bg-red-500/20 text-red-400 border-red-500/30',
  'Evidence':    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Implication': 'bg-brand-500/20 text-brand-400 border-brand-500/30',
  'CTA':         'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export default function BlueprintView({ blueprint }) {
  if (!blueprint || blueprint.length === 0) return null;

  return (
    <div className="space-y-2">
      {blueprint.map((step, i) => (
        <div key={i} className="flex gap-4 items-start glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
          {/* Position number */}
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-surface-500 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400">
            {step.position}
          </div>

          {/* Connector line */}
          <div className="flex flex-col flex-1 gap-1">
            <div className="flex items-center gap-2">
              <span className={`badge border ${ROLE_COLORS[step.role] || 'bg-brand-500/20 text-brand-400 border-brand-500/30'}`}>
                {step.role}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{step.guidance}</p>
          </div>
        </div>
      ))}

      {/* Connecting line decoration */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-brand-500/30 to-transparent" style={{ pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

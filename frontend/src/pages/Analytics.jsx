import { useState } from 'react';
import useStore from '../store/useStore';
import DropoffChart from '../components/charts/DropoffChart';

function TweetRow({ tweet, isSelected, onSelect, conversationId }) {
  const dropoffColor = tweet.drop_off_rate > 0.4 ? 'text-red-400' :
                       tweet.drop_off_rate > 0.2 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div
      onClick={() => onSelect(tweet, conversationId)}
      id={`tweet-row-${tweet.position}`}
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200
        ${isSelected
          ? 'bg-brand-600/15 border-brand-500/40'
          : 'bg-surface-700/40 border-white/5 hover:border-white/15 hover:bg-surface-600/40'}
        ${tweet.is_problem ? 'border-l-2 border-l-red-500/60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-surface-500 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
          {tweet.position}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-200 leading-relaxed line-clamp-2">{tweet.text}</p>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="text-xs text-gray-500">❤️ {tweet.likes?.toLocaleString()}</span>
            <span className="text-xs text-gray-500">🔁 {tweet.retweets?.toLocaleString()}</span>
            <span className="text-xs text-gray-500">💬 {tweet.replies?.toLocaleString()}</span>
            <span className={`text-xs font-mono font-bold ${dropoffColor}`}>
              ↘ {(tweet.drop_off_rate * 100).toFixed(1)}% drop
            </span>
            <span className="text-xs text-brand-400 font-mono">
              ~{tweet.impressions_proxy?.toLocaleString()} impr.
            </span>
            {tweet.is_problem && (
              <span className="badge badge-hostile text-xs">⚠ Problem</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [threadUrl, setThreadUrl] = useState('');

  const {
    analyzeThread, analyticsResult, analyticsLoading, analyticsError,
    selectTweet, selectedTweet, tweetReplies, repliesLoading,
  } = useStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!threadUrl.trim()) return;
    analyzeThread(threadUrl.trim());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Input */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-white mb-1">Thread Analysis</h2>
        <p className="text-xs text-gray-500 mb-5">Paste a Reddit post URL to fetch the full thread and compute drop-off analytics.</p>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            id="thread-url-input"
            type="text"
            className="input-field flex-1"
            placeholder="https://www.reddit.com/r/reactjs/comments/1gx8s..."
            value={threadUrl}
            onChange={e => setThreadUrl(e.target.value)}
            required
          />
          <button
            id="analyze-thread-btn"
            type="submit"
            disabled={analyticsLoading || !threadUrl.trim()}
            className="btn-primary flex-shrink-0"
          >
            {analyticsLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
              </svg>
            )}
            Analyze
          </button>
        </form>

        {analyticsError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {analyticsError}
          </div>
        )}
      </div>

      {/* Results */}
      {analyticsResult && (
        <div className="animate-slide-up space-y-4">
          {/* Author + health stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Author',        value: analyticsResult.author ? `@${analyticsResult.author.username}` : '—', color: 'text-white' },
              { label: 'Tweets',        value: analyticsResult.tweetCount, color: 'text-cyan-400' },
              { label: 'Health Score',  value: analyticsResult.healthScore + '%', color: analyticsResult.healthScore >= 70 ? 'text-emerald-400' : analyticsResult.healthScore >= 40 ? 'text-amber-400' : 'text-red-400' },
              { label: 'Problem Tweets',value: analyticsResult.tweets?.filter(t => t.is_problem).length, color: 'text-red-400' },
            ].map(stat => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <div className={`text-xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* D3 Chart */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Engagement Drop-off Chart</h3>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"/>High engagement</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>Low engagement</span>
                <span className="flex items-center gap-1"><span className="w-6 h-px border-t border-dashed border-red-500 inline-block"/>Problem</span>
              </div>
            </div>
            <DropoffChart
              tweets={analyticsResult.tweets}
              onTweetClick={t => selectTweet(t, analyticsResult.conversationId)}
              selectedTweetId={selectedTweet?.id}
            />
            <p className="text-xs text-gray-600 text-center mt-2">Click any bar to view replies & sentiment</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tweet list */}
            <div className="glass-card p-4 space-y-2 max-h-[500px] overflow-y-auto">
              <h3 className="text-sm font-semibold text-white mb-3">Posts & Comments</h3>
              {analyticsResult.tweets?.map(tweet => (
                <TweetRow
                  key={tweet.id}
                  tweet={tweet}
                  isSelected={selectedTweet?.id === tweet.id}
                  onSelect={(t) => selectTweet(t, analyticsResult.conversationId)}
                  conversationId={analyticsResult.conversationId}
                />
              ))}
            </div>

            {/* Drill-down panel */}
            <div className="glass-card p-4">
              {selectedTweet ? (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-semibold text-white">Item {selectedTweet.position} — Replies</h3>

                  <div className="p-3 bg-surface-600/50 rounded-xl">
                    <p className="text-sm text-gray-200">{selectedTweet.text}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-gray-500">❤️ {selectedTweet.likes?.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">🔁 {selectedTweet.retweets?.toLocaleString()}</span>
                      <span className={`text-xs font-bold ${selectedTweet.is_problem ? 'text-red-400' : 'text-emerald-400'}`}>
                        ↘ {(selectedTweet.drop_off_rate * 100).toFixed(1)}% drop-off
                      </span>
                    </div>
                  </div>

                  {repliesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/>
                      Loading replies...
                    </div>
                  ) : tweetReplies?.length > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {tweetReplies.map(reply => (
                        <div key={reply.id} className="p-3 bg-surface-600/40 rounded-xl">
                          <p className="text-xs text-brand-400 font-mono mb-1">@{reply.author?.username || 'user'}</p>
                          <p className="text-sm text-gray-300">{reply.text}</p>
                          <div className="flex gap-3 mt-1">
                            <span className="text-xs text-gray-600">❤️ {reply.likes}</span>
                            <span className="text-xs text-gray-600">💬 {reply.replies}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-6">No replies found for this tweet.</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <div className="text-4xl mb-3">👆</div>
                  <p className="text-sm text-gray-500">Click a post or bar to drill into replies</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!analyticsResult && !analyticsLoading && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-gray-400 text-sm">Paste a Reddit URL above to analyze engagement drop-off.</p>
        </div>
      )}
    </div>
  );
}

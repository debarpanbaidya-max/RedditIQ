import { create } from 'zustand';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL || '';

const useStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────────────────────
  user: null,
  authLoading: true,

  fetchUser: async () => {
    try {
      const res = await axios.get(`${backendUrl}/auth/me`, { withCredentials: true });
      set({ user: res.data.user, authLoading: false });
    } catch {
      set({ user: null, authLoading: false });
    }
  },

  logout: async () => {
    await axios.post(`${backendUrl}/auth/logout`, {}, { withCredentials: true });
    set({ user: null });
    window.location.href = '/';
  },

  // ── Research ─────────────────────────────────────────────────────────────
  researchResult: null,
  researchLoading: false,
  researchError: null,

  runResearch: async (topic, stance) => {
    set({ researchLoading: true, researchError: null, researchResult: null });
    try {
      const res = await axios.post(`${backendUrl}/api/research/analyze`, { topic, stance }, { withCredentials: true });
      set({ researchResult: res.data, researchLoading: false });
    } catch (err) {
      set({ researchError: err.response?.data?.error || 'Research failed', researchLoading: false });
    }
  },

  // ── Analytics ────────────────────────────────────────────────────────────
  analyticsResult: null,
  analyticsLoading: false,
  analyticsError: null,
  selectedTweet: null,
  tweetReplies: null,
  repliesLoading: false,

  analyzeThread: async (threadUrl) => {
    set({ analyticsLoading: true, analyticsError: null, analyticsResult: null, selectedTweet: null, tweetReplies: null });
    try {
      const res = await axios.post(`${backendUrl}/api/analytics/thread`, { threadUrl }, { withCredentials: true });
      set({ analyticsResult: res.data, analyticsLoading: false });
    } catch (err) {
      set({ analyticsError: err.response?.data?.error || 'Analytics failed', analyticsLoading: false });
    }
  },

  selectTweet: async (tweet, conversationId) => {
    set({ selectedTweet: tweet, repliesLoading: true, tweetReplies: null });
    try {
      const res = await axios.post(`${backendUrl}/api/analytics/replies`, {
        tweetId: tweet.id,
        conversationId,
      }, { withCredentials: true });
      set({ tweetReplies: res.data.replies, repliesLoading: false });
    } catch {
      set({ tweetReplies: [], repliesLoading: false });
    }
  },

  // ── Defense ──────────────────────────────────────────────────────────────
  defenseResults: null,
  defenseLoading: false,
  defenseError: null,
  replyResults: {},

  analyzeDefense: async (comments) => {
    set({ defenseLoading: true, defenseError: null, defenseResults: null });
    try {
      const res = await axios.post(`${backendUrl}/api/defense/analyze`, { comments }, { withCredentials: true });
      set({ defenseResults: res.data.analyzed, defenseLoading: false });
    } catch (err) {
      set({ defenseError: err.response?.data?.error || 'Defense analysis failed', defenseLoading: false });
    }
  },

  generateReply: async (comment, strategy, category) => {
    try {
      const res = await axios.post(`${backendUrl}/api/defense/reply`, { comment, strategy, category }, { withCredentials: true });
      set(state => ({
        replyResults: { ...state.replyResults, [comment]: res.data.replies },
      }));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Reply generation failed');
    }
  },
}));

export default useStore;

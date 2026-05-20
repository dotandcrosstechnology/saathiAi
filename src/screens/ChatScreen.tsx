import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Send, Sparkles, Star, MapPin, Clock, Shield, ChevronRight,
  Wrench, Zap, Droplets, Wind, Brain, Search, BarChart2,
  CalendarCheck, Bell, AlertTriangle, CheckCircle2, Loader,
} from 'lucide-react-native';

import FallbackCard from '../components/FallbackCard';
import ClarificationCard from '../components/ClarificationCard';
import { handleUserRequest } from '../agents/orchestrator';
import { saveBookingLocally } from '../services/localBookings';
import { useAuth } from '../contexts/AuthContext';
import { Provider, ReasoningStep, AgentTrace, ServiceIntent } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';

// ── Suggestion chips ──────────────────────────────────────────
const CHIPS = [
  { label: 'AC technician chahiye', icon: Wind },
  { label: 'Urgent plumber chahiye', icon: Droplets },
  { label: 'Electrician kal subah', icon: Zap },
];

// ── Agent metadata ────────────────────────────────────────────
const AGENT_META: Record<string, { color: string; icon: any; label: string }> = {
  IntentAgent:       { color: '#7C3AED', icon: Brain,        label: 'Understanding request' },
  'IntentAgent (enriched)': { color: '#7C3AED', icon: Brain, label: 'Merging clarification' },
  DiscoveryAgent:    { color: '#0369A1', icon: Search,       label: 'Finding providers' },
  RankingAgent:      { color: '#B45309', icon: BarChart2,    label: 'Ranking matches' },
  'RankingAgent (re-run)': { color: '#B45309', icon: BarChart2, label: 'Re-ranking' },
  BookingAgent:      { color: '#15803D', icon: CalendarCheck, label: 'Confirming booking' },
  FollowupAgent:     { color: '#0E7490', icon: Bell,         label: 'Scheduling reminders' },
  FallbackAgent:     { color: '#B45309', icon: AlertTriangle, label: 'Finding alternative' },
};

const getAgentMeta = (agent: string) =>
  AGENT_META[agent] || { color: colors.primary, icon: Sparkles, label: agent };

// ── Typing dots ───────────────────────────────────────────────
const TypingDots = ({ color = colors.textTertiary }: { color?: string }) => {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 3), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <View
          key={i}
          style={{
            width: 5, height: 5, borderRadius: 3,
            backgroundColor: color,
            opacity: frame === i ? 1 : 0.3,
          }}
        />
      ))}
    </View>
  );
};

// ── Live agent step bubble ────────────────────────────────────
const AgentStepBubble = ({ step, isLast }: { step: ReasoningStep; isLast: boolean }) => {
  const slideIn = useRef(new Animated.Value(20)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideIn, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const meta = getAgentMeta(step.agent);
  const Icon = meta.icon;
  const provider = (step as any).llm_provider as string | undefined;

  return (
    <Animated.View style={[s.stepWrap, { opacity: fadeIn, transform: [{ translateY: slideIn }] }]}>
      {/* connector line */}
      {!isLast && <View style={[s.stepLine, { backgroundColor: meta.color + '40' }]} />}

      <View style={[s.stepDot, { backgroundColor: meta.color }]}>
        <Icon color="#fff" size={10} />
      </View>

      <View style={s.stepCard}>
        <View style={s.stepCardHeader}>
          <Text style={[s.stepAgent, { color: meta.color }]}>{step.agent}</Text>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            {provider && provider !== 'cache' && (
              <View style={[s.llmPill, { backgroundColor: provider === 'gemini' ? '#DBEAFE' : '#FEF3C7' }]}>
                <Text style={[s.llmPillText, { color: provider === 'gemini' ? '#1D4ED8' : '#92400E' }]}>
                  {provider}
                </Text>
              </View>
            )}
            {provider === 'cache' && (
              <View style={[s.llmPill, { backgroundColor: '#F1F5F9' }]}>
                <Text style={[s.llmPillText, { color: '#64748B' }]}>cache</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={s.stepDecision}>{step.decision}</Text>
        {step.tool_called && (
          <View style={s.toolRow}>
            <Wrench color={colors.textTertiary} size={10} />
            <Text style={s.toolText}>{step.tool_called}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ── Active agent thinking pill ────────────────────────────────
const ThinkingPill = ({ currentAgent }: { currentAgent: string }) => {
  const meta = getAgentMeta(currentAgent);
  const Icon = meta.icon;
  return (
    <View style={s.thinkingPill}>
      <View style={[s.thinkingIcon, { backgroundColor: meta.color + '20' }]}>
        <Icon color={meta.color} size={14} />
      </View>
      <Text style={[s.thinkingLabel, { color: meta.color }]}>{meta.label}</Text>
      <TypingDots color={meta.color} />
    </View>
  );
};

// ── Provider card ─────────────────────────────────────────────
interface ProviderCardProps {
  provider: any;
  allRanked: any[];
  onConfirm: () => void;
  onViewTrace: () => void;
}

const ProviderCard = ({ provider, allRanked, onConfirm, onViewTrace }: ProviderCardProps) => {
  const [showAll, setShowAll] = useState(false);
  const slot = provider.available_slots?.[0];
  const slotLabel = slot
    ? new Date(slot).toLocaleString('en-PK', { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true })
    : 'Soon';
  const scorePercent = provider.score ? Math.round(provider.score * 100) : null;

  return (
    <View style={s.provCard}>
      {/* Score badge */}
      {scorePercent && (
        <View style={s.scoreBadge}>
          <Text style={s.scoreBadgeText}>Match {scorePercent}%</Text>
        </View>
      )}

      {/* Name row */}
      <View style={s.provHeaderRow}>
        <Text style={s.provName}>{provider.name}</Text>
        {provider.verified && (
          <View style={s.verifiedPill}>
            <Shield color={colors.accent} size={11} />
            <Text style={s.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      {/* Stats row */}
      <View style={s.provStatsRow}>
        <View style={s.statChip}>
          <Star color={colors.warning} size={13} fill={colors.warning} />
          <Text style={s.statText}>{provider.rating?.toFixed(1)}</Text>
        </View>
        <View style={s.statChip}>
          <CheckCircle2 color={colors.accent} size={13} />
          <Text style={s.statText}>{provider.jobs_completed} jobs</Text>
        </View>
        <View style={s.statChip}>
          <MapPin color={colors.info} size={13} />
          <Text style={s.statText}>
            {provider.distance_km != null ? `${Number(provider.distance_km).toFixed(1)} km` : provider.area}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={s.provDetailRow}>
        <Clock color={colors.textTertiary} size={13} />
        <Text style={s.provDetailText}>Available: {slotLabel}</Text>
      </View>
      <View style={s.provDetailRow}>
        <MapPin color={colors.textTertiary} size={13} />
        <Text style={s.provDetailText}>{provider.area}, {provider.city}</Text>
      </View>

      {/* Price */}
      <View style={s.provPriceRow}>
        <Text style={s.provPrice}>Rs {(provider.hourly_rate_pkr || 1500).toLocaleString()}</Text>
        <Text style={s.provPriceUnit}>/hr</Text>
      </View>

      {/* Justification */}
      {provider.justification && (
        <View style={s.justifBox}>
          <Brain color={colors.textTertiary} size={13} />
          <Text style={s.justifText}>{provider.justification}</Text>
        </View>
      )}

      {/* Ranked alternatives */}
      {allRanked.length > 1 && (
        <TouchableOpacity style={s.altToggle} onPress={() => setShowAll(v => !v)} activeOpacity={0.7}>
          <BarChart2 color={colors.primary} size={13} />
          <Text style={s.altToggleText}>
            {showAll ? 'Hide alternatives' : `See ${allRanked.length - 1} other option${allRanked.length > 2 ? 's' : ''}`}
          </Text>
          <ChevronRight color={colors.primary} size={13} style={{ transform: [{ rotate: showAll ? '90deg' : '0deg' }] }} />
        </TouchableOpacity>
      )}

      {showAll && (
        <View style={s.altList}>
          {allRanked.slice(1).map((p: any, i: number) => (
            <View key={p.provider_id || i} style={s.altRow}>
              <Text style={s.altRank}>#{i + 2}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.altName}>{p.name}</Text>
                <Text style={s.altDetail}>
                  ★ {p.rating?.toFixed(1)}  ·  {p.distance_km != null ? `${Number(p.distance_km).toFixed(1)} km` : p.area}  ·  Rs {p.hourly_rate_pkr?.toLocaleString()}
                </Text>
              </View>
              <Text style={s.altScore}>{Math.round((p.score || 0) * 100)}%</Text>
            </View>
          ))}
        </View>
      )}

      <View style={s.provDivider} />

      {/* CTAs */}
      <TouchableOpacity style={s.bookBtn} onPress={onConfirm} activeOpacity={0.85}>
        <CalendarCheck color="#fff" size={16} />
        <Text style={s.bookBtnText}>Confirm Booking</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.traceBtn} onPress={onViewTrace} activeOpacity={0.7}>
        <Text style={s.traceBtnText}>View Agent Reasoning</Text>
        <ChevronRight color={colors.primary} size={14} />
      </TouchableOpacity>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════
export default function ChatScreen({ navigation }: any) {
  const [messages, setMessages] = useState<{ id: string; text: string; isUser: boolean }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('');
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);

  const [proposedProvider, setProposedProvider]   = useState<any | null>(null);
  const [allRanked, setAllRanked]                 = useState<any[]>([]);

  const [fallbackProvider, setFallbackProvider]   = useState<any | null>(null);
  const [fallbackMsg, setFallbackMsg]             = useState('');
  const [awaitingFallback, setAwaitingFallback]   = useState(false);

  const [clarificationIntent, setClarificationIntent]     = useState<ServiceIntent | null>(null);
  const [clarificationQuestion, setClarificationQuestion] = useState('');
  const [awaitingClarification, setAwaitingClarification] = useState(false);

  const [traceState, setTraceState] = useState<AgentTrace | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { user, profile, isFirstRun, setIsFirstRun } = useAuth();

  useEffect(() => {
    if (isFirstRun && profile?.displayName) {
      setMessages([{
        id: Date.now().toString(),
        text: `Salaam ${profile.displayName.split(' ')[0]}! Mein SaathiAI hoon 👋\nAap ko koi service chahiye? AC technician, plumber, ya electrician — bas bata dein.`,
        isUser: false,
      }]);
      setIsFirstRun(false);
    }
  }, [isFirstRun, profile, setIsFirstRun]);

  const submitRequest = async (userMsg: string, isClarification = false) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userMsg, isUser: true }]);
    setInputText('');
    setIsThinking(true);
    setCurrentAgent('IntentAgent');
    setReasoningSteps([]);
    setProposedProvider(null);
    setAllRanked([]);
    setFallbackProvider(null);
    setAwaitingFallback(false);
    setTraceState(null);

    const pendingIntent = isClarification ? clarificationIntent : undefined;
    setAwaitingClarification(false);
    setClarificationIntent(null);

    try {
      const generator = handleUserRequest(
        userMsg, user?.uid || 'demo_user',
        { city: profile?.city || 'Islamabad' },
        false,
        pendingIntent as any,
      );
      let finalTrace: AgentTrace | undefined;

      while (true) {
        const result = await generator.next();
        if (result.done) { finalTrace = result.value as AgentTrace; break; }
        const step = result.value as ReasoningStep;
        setReasoningSteps(prev => [...prev, step]);

        // Predict next agent for the thinking pill
        const agentOrder = ['IntentAgent', 'DiscoveryAgent', 'RankingAgent', 'BookingAgent', 'FollowupAgent'];
        const idx = agentOrder.findIndex(a => step.agent.startsWith(a.split(' ')[0]));
        if (idx >= 0 && idx < agentOrder.length - 1) setCurrentAgent(agentOrder[idx + 1]);
      }

      setTraceState(finalTrace!);
      const outcome = finalTrace?.final_outcome as any;

      if (!outcome) {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: 'Kuch masla hua. Dobara koshish karein.', isUser: false }]);
        return;
      }

      if (outcome.status === 'awaiting_fallback_confirmation') {
        setFallbackProvider(outcome.fallback_choice);
        setFallbackMsg(outcome.explanation || '');
        setAwaitingFallback(true);
      } else if (outcome.status === 'awaiting_clarification') {
        setClarificationIntent(outcome.intent);
        setClarificationQuestion(outcome.clarification_question);
        setAwaitingClarification(true);
      } else if (outcome.status === 'failed' || outcome.status === 'no_candidates') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `Sorry, is waqt ${outcome.intent?.service_type || 'service'} ke liye koi provider nahi mila. Thoda wait kar ke dobara try karein.`,
          isUser: false,
        }]);
      } else if (outcome.top_choice_provider) {
        setProposedProvider(outcome.top_choice_provider);
        setAllRanked(outcome.ranked_providers || [outcome.top_choice_provider]);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: 'Koi candidate nahi mila.', isUser: false }]);
      }
    } catch (err) {
      console.error('Pipeline error:', err);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: 'Kuch ghalat ho gaya — dobara koshish karein.', isUser: false }]);
    } finally {
      setIsThinking(false);
      setCurrentAgent('');
    }
  };

  const onConfirm = async () => {
    const outcome = traceState?.final_outcome as any;
    const booking = outcome?.booking;
    if (booking && traceState) {
      // Attach the full trace so BookingDetailsScreen can show "View Agent Trace"
      const enriched = {
        ...booking,
        receipt_data: { ...booking.receipt_data, trace: traceState },
      };
      await saveBookingLocally(enriched);
      navigation.navigate('Receipt', { booking: enriched, provider: proposedProvider });
    } else {
      navigation.navigate('Receipt', { booking, provider: proposedProvider });
    }
  };

  const onAcceptFallback = async () => {
    setAwaitingFallback(false);
    const outcome = traceState?.final_outcome as any;
    const booking = outcome?.booking;
    if (booking && traceState) {
      const enriched = {
        ...booking,
        receipt_data: { ...booking.receipt_data, trace: traceState },
      };
      await saveBookingLocally(enriched);
      navigation.navigate('Receipt', { booking: enriched, provider: fallbackProvider });
    } else {
      navigation.navigate('Receipt', { booking, provider: fallbackProvider });
    }
  };

  const onCancelFallback = () => {
    setAwaitingFallback(false);
    setMessages(prev => [...prev, { id: Date.now().toString(), text: 'Theek hai, koi baat nahi. Koi aur help chahiye?', isUser: false }]);
  };

  const scrollToBottom = () => scrollRef.current?.scrollToEnd({ animated: true });

  // ── RENDER ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* HEADER */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.avatarRing}>
              <Sparkles color={colors.primary} size={18} />
            </View>
            <View>
              <Text style={s.headerTitle}>SaathiAI</Text>
              <Text style={s.headerSub}>Agentic Service Companion</Text>
            </View>
          </View>
          <View style={s.statusPill}>
            <View style={s.greenDot} />
            <Text style={s.statusText}>Online</Text>
          </View>
        </View>

        {/* CHAT */}
        <ScrollView
          ref={scrollRef}
          style={s.chatArea}
          contentContainerStyle={s.chatContent}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        >
          {/* Empty state */}
          {messages.length === 0 && reasoningSteps.length === 0 && !isThinking && (
            <View style={s.empty}>
              <View style={s.emptyHero}>
                <Sparkles color={colors.primary} size={36} />
              </View>
              <Text style={s.emptyH1}>Kya service chahiye?</Text>
              <Text style={s.emptySub}>Roman Urdu, Urdu, ya English — kisi bhi zabaan mein bata sakte hain</Text>

              <View style={s.serviceGrid}>
                {[
                  { icon: Wind, label: 'AC Technician', color: '#0369A1' },
                  { icon: Droplets, label: 'Plumber', color: '#0E7490' },
                  { icon: Zap, label: 'Electrician', color: '#B45309' },
                ].map(({ icon: Icon, label, color }) => (
                  <TouchableOpacity
                    key={label}
                    style={[s.serviceCard, { borderColor: color + '30', backgroundColor: color + '08' }]}
                    onPress={() => submitRequest(label + ' chahiye')}
                    activeOpacity={0.7}
                  >
                    <View style={[s.serviceIcon, { backgroundColor: color + '20' }]}>
                      <Icon color={color} size={22} />
                    </View>
                    <Text style={[s.serviceLabel, { color }]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.orLabel}>— ya seedha likhein —</Text>
              <View style={s.chipsWrap}>
                {CHIPS.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <TouchableOpacity key={i} style={s.chip} onPress={() => submitRequest(c.label)} activeOpacity={0.7}>
                      <Icon color={colors.primary} size={14} />
                      <Text style={s.chipText}>{c.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Messages */}
          {messages.map(msg => (
            <View key={msg.id} style={[s.bubbleRow, msg.isUser ? s.rowRight : s.rowLeft]}>
              {!msg.isUser && (
                <View style={s.agentAvatar}>
                  <Sparkles color={colors.primary} size={12} />
                </View>
              )}
              <View style={[s.bubble, msg.isUser ? s.userBubble : s.agentBubble]}>
                <Text style={[s.bubbleText, msg.isUser ? s.userText : s.agentText]}>{msg.text}</Text>
              </View>
            </View>
          ))}

          {/* Reasoning steps — live pipeline */}
          {reasoningSteps.length > 0 && (
            <View style={s.pipelineWrap}>
              <View style={s.pipelineHeader}>
                <Brain color={colors.primary} size={13} />
                <Text style={s.pipelineLabel}>Agent Pipeline</Text>
              </View>
              {reasoningSteps.map((step, i) => (
                <AgentStepBubble
                  key={i}
                  step={step}
                  isLast={i === reasoningSteps.length - 1 && !isThinking}
                />
              ))}
              {isThinking && <ThinkingPill currentAgent={currentAgent} />}
            </View>
          )}

          {/* Provider card */}
          {proposedProvider && !awaitingFallback && !isThinking && (
            <ProviderCard
              provider={proposedProvider}
              allRanked={allRanked}
              onConfirm={onConfirm}
              onViewTrace={() => navigation.navigate('Trace', { trace: traceState })}
            />
          )}

          {/* Fallback card */}
          {awaitingFallback && fallbackProvider && (
            <FallbackCard
              fallbackProvider={fallbackProvider}
              explanation={fallbackMsg}
              onAccept={onAcceptFallback}
              onCancel={onCancelFallback}
            />
          )}

          {/* Clarification card */}
          {awaitingClarification && (
            <ClarificationCard
              question={clarificationQuestion}
              onProvide={(text) => submitRequest(text, true)}
            />
          )}

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* INPUT */}
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Koi bhi service likhein…"
            placeholderTextColor={colors.textTertiary}
            returnKeyType="send"
            onSubmitEditing={() => inputText.trim() && submitRequest(inputText.trim(), awaitingClarification)}
            multiline
          />
          <TouchableOpacity
            style={[s.sendBtn, !inputText.trim() && s.sendBtnOff]}
            onPress={() => inputText.trim() && submitRequest(inputText.trim(), awaitingClarification)}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Send color={inputText.trim() ? '#fff' : colors.textTertiary} size={18} />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    height: 60, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: colors.border,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: spacing.lg,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarRing: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#EEF2FF', borderWidth: 1.5, borderColor: colors.primary + '30',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  headerSub: { fontSize: 11, color: colors.textTertiary, marginTop: 1 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' },
  statusText: { fontSize: 12, color: '#16A34A', fontWeight: '600' },

  // Chat area
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 24 },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 40, paddingBottom: 24 },
  emptyHero: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#EEF2FF', borderWidth: 1.5, borderColor: colors.primary + '25',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyH1: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 28, paddingHorizontal: 20, lineHeight: 20 },

  serviceGrid: { flexDirection: 'row', gap: 10, marginBottom: 24, width: '100%' },
  serviceCard: {
    flex: 1, borderRadius: 14, borderWidth: 1.5,
    paddingVertical: 16, alignItems: 'center', gap: 8,
  },
  serviceIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  serviceLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },

  orLabel: { fontSize: 12, color: colors.textTertiary, marginBottom: 14 },
  chipsWrap: { width: '100%', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24,
  },
  chipText: { fontSize: 14, color: colors.primary, fontWeight: '600' },

  // Messages
  bubbleRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-end', gap: 8 },
  rowRight: { justifyContent: 'flex-end' },
  rowLeft: { justifyContent: 'flex-start' },
  agentAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.primary + '20',
  },
  bubble: { maxWidth: '78%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18 },
  userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  agentBubble: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4, ...shadows.sm },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  agentText: { color: colors.textPrimary },

  // Agent pipeline
  pipelineWrap: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1,
    borderColor: colors.border, padding: 14, marginBottom: 12, ...shadows.sm,
  },
  pipelineHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  pipelineLabel: { fontSize: 11, fontWeight: '700', color: colors.textTertiary, letterSpacing: 0.8, textTransform: 'uppercase' },

  // Step bubbles
  stepWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8, position: 'relative' },
  stepLine: { position: 'absolute', left: 11, top: 22, width: 2, height: '100%', minHeight: 14 },
  stepDot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginTop: 1, flexShrink: 0 },
  stepCard: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  stepCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  stepAgent: { fontSize: 12, fontWeight: '700' },
  stepDecision: { fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  toolText: { fontSize: 11, color: colors.textTertiary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  // LLM pill
  llmPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  llmPillText: { fontSize: 10, fontWeight: '700' },

  // Thinking pill
  thinkingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0',
    marginLeft: 32,
  },
  thinkingIcon: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  thinkingLabel: { fontSize: 12, fontWeight: '600', flex: 1 },

  // Provider card
  provCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: colors.border,
    ...shadows.md,
  },
  scoreBadge: {
    alignSelf: 'flex-start', backgroundColor: '#DCFCE7',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 12,
  },
  scoreBadgeText: { fontSize: 12, fontWeight: '700', color: '#15803D' },
  provHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  provName: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, flex: 1 },
  verifiedPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  provStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  statText: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  provDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  provDetailText: { fontSize: 13, color: colors.textSecondary },
  provPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3, marginTop: 8, marginBottom: 4 },
  provPrice: { fontSize: 22, fontWeight: '900', color: colors.primary },
  provPriceUnit: { fontSize: 13, color: colors.textTertiary },
  justifBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, marginTop: 10,
    borderLeftWidth: 3, borderLeftColor: colors.primary + '40',
  },
  justifText: { flex: 1, fontSize: 13, color: colors.textSecondary, fontStyle: 'italic', lineHeight: 18 },

  // Alternatives
  altToggle: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12, paddingVertical: 4 },
  altToggleText: { fontSize: 13, color: colors.primary, fontWeight: '600', flex: 1 },
  altList: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 8, marginTop: 6, gap: 6 },
  altRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  altRank: { fontSize: 11, fontWeight: '700', color: colors.textTertiary, width: 20 },
  altName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  altDetail: { fontSize: 11, color: colors.textTertiary, marginTop: 1 },
  altScore: { fontSize: 12, fontWeight: '700', color: colors.accent },

  provDivider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },

  bookBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 14, marginBottom: 10, ...shadows.sm,
  },
  bookBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  traceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 6 },
  traceBtnText: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopWidth: 1, borderTopColor: colors.border,
    ...shadows.sm,
  },
  input: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, paddingTop: 10,
    fontSize: 15, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnOff: { backgroundColor: '#E2E8F0' },
});

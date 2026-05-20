import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, Brain, Search, BarChart2, CalendarCheck,
  Bell, AlertTriangle, ChevronDown, ChevronUp, Clock,
  CheckCircle2, Wrench, Zap, Target, Award, Sparkles,
} from 'lucide-react-native';
import { AgentTrace, ReasoningStep } from '../types';
import { colors } from '../theme/colors';

const AGENT_META: Record<string, { color: string; icon: any; label: string }> = {
  IntentAgent:       { color: '#7C3AED', icon: Brain,         label: 'Intent Parsing' },
  'IntentAgent (Enriched Fallback)': { color: '#7C3AED', icon: Brain, label: 'Intent Enriched' },
  'IntentAgent (Fallback)':          { color: '#7C3AED', icon: Brain, label: 'Intent (Fallback)' },
  DiscoveryAgent:    { color: '#0369A1', icon: Search,        label: 'Provider Discovery' },
  RankingAgent:      { color: '#B45309', icon: BarChart2,     label: 'Provider Ranking' },
  'RankingAgent (re-run)': { color: '#B45309', icon: BarChart2, label: 'Re-ranking' },
  BookingAgent:      { color: '#15803D', icon: CalendarCheck, label: 'Booking' },
  FollowupAgent:     { color: '#0E7490', icon: Bell,          label: 'Follow-up' },
  FallbackAgent:     { color: '#D97706', icon: AlertTriangle, label: 'Fallback' },
};

const getAgentMeta = (agent: string) => {
  if (AGENT_META[agent]) return AGENT_META[agent];
  const key = Object.keys(AGENT_META).find(k => agent.startsWith(k));
  return key ? AGENT_META[key] : { color: colors.primary, icon: Sparkles, label: agent };
};

const LLM_PILL: Record<string, { bg: string; text: string }> = {
  gemini: { bg: '#DBEAFE', text: '#1D4ED8' },
  groq:   { bg: '#FEF3C7', text: '#92400E' },
  cache:  { bg: '#F1F5F9', text: '#64748B' },
};

function formatDuration(startIso: string, endIso: string | null): string {
  if (!endIso) return '—';
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Step card ────────────────────────────────────────────────
const StepCard = ({
  step, isLast, nameMap,
}: {
  step: ReasoningStep;
  isLast: boolean;
  nameMap: Record<string, string>;
}) => {
  const [expanded, setExpanded] = useState(false);
  const meta = getAgentMeta(step.agent);
  const Icon = meta.icon;
  const provider = (step as any).llm_provider as string | undefined;
  const llmStyle = provider ? LLM_PILL[provider] : null;
  const hasOutput = !!step.tool_output && Object.keys(step.tool_output).length > 0;

  const isRanking = step.agent.toLowerCase().includes('ranking');
  const scoredCandidates = (step.tool_output as any)?.scored_candidates as
    Array<{ id: string; score: number; breakdown?: Record<string, number> }> | undefined;

  return (
    <View style={st.stepRow}>
      {/* Timeline */}
      <View style={st.timelineCol}>
        <View style={[st.dot, { backgroundColor: meta.color }]}>
          <Icon color="#fff" size={10} />
        </View>
        {!isLast && <View style={[st.connector, { backgroundColor: meta.color + '35' }]} />}
      </View>

      {/* Card body */}
      <View style={st.card}>
        {/* Header row */}
        <View style={st.cardHead}>
          <View style={[st.agentBadge, { backgroundColor: meta.color + '15' }]}>
            <Text style={[st.agentLabel, { color: meta.color }]}>{step.agent}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            {llmStyle && (
              <View style={[st.llmPill, { backgroundColor: llmStyle.bg }]}>
                <Text style={[st.llmPillText, { color: llmStyle.text }]}>{provider}</Text>
              </View>
            )}
            <Text style={st.timeLabel}>
              {new Date(step.timestamp).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* Thought */}
        {step.thought ? (
          <Text style={st.thought} numberOfLines={expanded ? undefined : 2}>
            "{step.thought}"
          </Text>
        ) : null}

        {/* Decision */}
        <View style={st.decisionRow}>
          <CheckCircle2 color={meta.color} size={13} />
          <Text style={[st.decision, { color: meta.color }]}>{step.decision}</Text>
        </View>

        {/* Tool chip */}
        {step.tool_called ? (
          <View style={st.toolChip}>
            <Wrench color={colors.textTertiary} size={10} />
            <Text style={st.toolText}>{step.tool_called}</Text>
          </View>
        ) : null}

        {/* Score breakdown for RankingAgent */}
        {isRanking && scoredCandidates && scoredCandidates.length > 0 && (
          <View style={st.scoresBox}>
            <Text style={st.scoresTitle}>Score Breakdown</Text>
            {scoredCandidates.slice(0, 5).map((c, i) => {
              const displayName = nameMap[c.id] || c.id;
              const pct = Math.round(c.score * 100);
              return (
                <View key={c.id} style={st.scoreRow}>
                  <Text style={st.scoreRank}>#{i + 1}</Text>
                  <Text style={st.scoreName} numberOfLines={1}>{displayName}</Text>
                  <View style={st.scoreTrack}>
                    <View
                      style={[
                        st.scoreFill,
                        {
                          width: `${pct}%` as any,
                          backgroundColor: i === 0 ? meta.color : meta.color + '55',
                        },
                      ]}
                    />
                  </View>
                  <Text style={st.scorePct}>{pct}%</Text>
                </View>
              );
            })}
            {scoredCandidates[0]?.breakdown && (
              <View style={st.breakdownRow}>
                {Object.entries(scoredCandidates[0].breakdown).map(([k, v]) => (
                  <View key={k} style={st.breakdownChip}>
                    <Text style={st.breakdownKey}>{k.replace('_score', '').replace('_weighted', '')}</Text>
                    <Text style={st.breakdownVal}>{(v * 100).toFixed(0)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Expand tool output */}
        {hasOutput && (
          <TouchableOpacity
            style={st.expandBtn}
            onPress={() => setExpanded(v => !v)}
            activeOpacity={0.7}
          >
            <Text style={st.expandLabel}>Tool Output</Text>
            {expanded
              ? <ChevronUp color={colors.textTertiary} size={13} />
              : <ChevronDown color={colors.textTertiary} size={13} />}
          </TouchableOpacity>
        )}
        {expanded && hasOutput && (
          <ScrollView horizontal showsHorizontalScrollIndicator style={st.outputBox}>
            <Text style={st.outputText}>
              {JSON.stringify(step.tool_output, null, 2).slice(0, 800)}
            </Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════
export default function TraceScreen({ route, navigation }: any) {
  const trace: AgentTrace = route.params?.trace;

  if (!trace) {
    return (
      <SafeAreaView style={st.root}>
        <View style={st.emptyCenter}>
          <Text style={st.emptyText}>No trace available.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
            <Text style={st.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const duration = formatDuration(trace.started_at, trace.completed_at);

  const llmProviders = [
    ...new Set(
      trace.steps
        .map(s => (s as any).llm_provider as string | undefined)
        .filter(Boolean),
    ),
  ] as string[];

  const outcome = trace.final_outcome as any;
  const hasBooking = !!outcome?.booking;
  const status = outcome?.status || (hasBooking ? 'success' : 'completed');

  const STATUS_COLOR: Record<string, string> = {
    success: colors.accent,
    completed: colors.accent,
    awaiting_clarification: '#D97706',
    awaiting_fallback_confirmation: '#D97706',
    failed: colors.danger,
  };
  const statusColor = STATUS_COLOR[status] || colors.accent;
  const statusLabel =
    status === 'success' || status === 'completed' ? 'Booked' :
    status === 'awaiting_clarification' ? 'Needs Info' :
    status === 'awaiting_fallback_confirmation' ? 'Fallback' :
    'Failed';

  // Build a provider_id → name map from ranked_providers in final_outcome
  const rankedProviders: any[] = outcome?.ranked_providers || [];
  const nameMap: Record<string, string> = {};
  rankedProviders.forEach((p: any) => {
    if (p.provider_id) nameMap[p.provider_id] = p.name;
  });

  return (
    <SafeAreaView style={st.root}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.headerBack} activeOpacity={0.7}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={st.headerTitle}>Agent Reasoning Trace</Text>
          <Text style={st.headerSub} numberOfLines={1}>{trace.trace_id}</Text>
        </View>
      </View>

      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User request card */}
        <View style={st.requestCard}>
          <Text style={st.requestLabel}>User Request</Text>
          <Text style={st.requestText}>"{trace.user_request}"</Text>
        </View>

        {/* Stats row */}
        <View style={st.statsRow}>
          <View style={st.statBox}>
            <Clock color={colors.textTertiary} size={14} />
            <Text style={st.statValue}>{duration}</Text>
            <Text style={st.statLabel}>Time</Text>
          </View>
          <View style={st.statBox}>
            <Target color={colors.textTertiary} size={14} />
            <Text style={st.statValue}>{trace.steps.length}</Text>
            <Text style={st.statLabel}>Steps</Text>
          </View>
          <View style={[st.statBox, { borderColor: statusColor + '40' }]}>
            <Award color={statusColor} size={14} />
            <Text style={[st.statValue, { color: statusColor }]}>{statusLabel}</Text>
            <Text style={st.statLabel}>Outcome</Text>
          </View>
        </View>

        {/* LLM providers used */}
        {llmProviders.length > 0 && (
          <View style={st.llmRow}>
            <Text style={st.llmRowLabel}>LLMs used:</Text>
            {llmProviders.map(p => {
              const style = LLM_PILL[p] || { bg: '#F1F5F9', text: '#64748B' };
              return (
                <View key={p} style={[st.llmPillLg, { backgroundColor: style.bg }]}>
                  <Text style={[st.llmPillLgText, { color: style.text }]}>{p}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Pipeline timeline */}
        <Text style={st.sectionTitle}>Pipeline Execution</Text>
        <View style={st.timeline}>
          {trace.steps.map((step, i) => (
            <StepCard
              key={i}
              step={step}
              isLast={i === trace.steps.length - 1}
              nameMap={nameMap}
            />
          ))}
        </View>

        {/* Final outcome */}
        {hasBooking && (
          <View style={st.outcomeCard}>
            <View style={st.outcomeHeader}>
              <CheckCircle2 color={colors.accent} size={16} />
              <Text style={st.outcomeTitle}>Final Outcome</Text>
            </View>

            {[
              { label: 'Provider',    value: outcome.top_choice_name || outcome.booking?.provider_id },
              { label: 'Booking ID',  value: outcome.booking.booking_id },
              {
                label: 'Scheduled',
                value: new Date(outcome.booking.scheduled_iso).toLocaleString('en-PK', {
                  weekday: 'short', day: 'numeric', month: 'short',
                  hour: 'numeric', minute: '2-digit', hour12: true,
                }),
              },
              { label: 'Service',     value: outcome.booking.service_type?.replace('_', ' ') },
            ].map(row => (
              <View key={row.label} style={st.outcomeRow}>
                <Text style={st.outcomeKey}>{row.label}</Text>
                <Text style={st.outcomeVal} numberOfLines={1}>{row.value}</Text>
              </View>
            ))}

            {outcome.fallback_used && (
              <View style={st.fallbackNotice}>
                <AlertTriangle color="#D97706" size={13} />
                <Text style={st.fallbackNoticeText}>
                  Fallback used — original provider was unavailable
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  emptyCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: colors.textSecondary, marginBottom: 16 },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 10 },
  backBtnText: { color: '#fff', fontWeight: '600' },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  headerBack: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#ffffff20',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headerSub: { color: '#ffffff60', fontSize: 10, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // Request
  requestCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 14,
  },
  requestLabel: {
    fontSize: 10, fontWeight: '700', color: colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
  },
  requestText: {
    fontSize: 15, color: colors.textPrimary, fontWeight: '600',
    fontStyle: 'italic', lineHeight: 22,
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statBox: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 12, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 10, color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase' },

  // LLM row
  llmRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' },
  llmRowLabel: { fontSize: 12, color: colors.textTertiary, fontWeight: '600' },
  llmPillLg: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  llmPillLgText: { fontSize: 12, fontWeight: '700' },

  // Section title
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },

  timeline: {},

  // Step row
  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  timelineCol: { alignItems: 'center', width: 22, paddingTop: 1 },
  dot: {
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  connector: { flex: 1, width: 2, minHeight: 12, marginTop: 3 },

  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
    marginBottom: 2,
  },
  cardHead: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  agentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  agentLabel: { fontSize: 11, fontWeight: '700' },
  llmPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  llmPillText: { fontSize: 10, fontWeight: '700' },
  timeLabel: { fontSize: 10, color: colors.textTertiary },

  thought: {
    fontSize: 13, color: colors.textSecondary,
    fontStyle: 'italic', lineHeight: 19, marginBottom: 8,
  },
  decisionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 8 },
  decision: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },

  toolChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8,
  },
  toolText: {
    fontSize: 11, color: colors.textTertiary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Score breakdown
  scoresBox: {
    backgroundColor: '#FFFBEB', borderRadius: 10, padding: 10,
    marginBottom: 8, borderWidth: 1, borderColor: '#FDE68A',
  },
  scoresTitle: {
    fontSize: 10, fontWeight: '700', color: '#92400E',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  scoreRank: { fontSize: 10, fontWeight: '700', color: colors.textTertiary, width: 18 },
  scoreName: { fontSize: 12, fontWeight: '600', color: colors.textPrimary, width: 80 },
  scoreTrack: {
    flex: 1, height: 6, backgroundColor: '#E2E8F0',
    borderRadius: 3, overflow: 'hidden',
  },
  scoreFill: { height: 6, borderRadius: 3 },
  scorePct: { fontSize: 11, fontWeight: '700', color: '#92400E', width: 28, textAlign: 'right' },

  breakdownRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  breakdownChip: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6, flexDirection: 'row', gap: 3, alignItems: 'center',
  },
  breakdownKey: { fontSize: 9, color: '#92400E', fontWeight: '600' },
  breakdownVal: { fontSize: 9, color: '#92400E', fontWeight: '800' },

  // Expand
  expandBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4,
  },
  expandLabel: { fontSize: 11, color: colors.textTertiary, fontWeight: '600' },
  outputBox: {
    backgroundColor: '#F1F5F9', borderRadius: 8, padding: 8, marginTop: 6,
    maxHeight: 200,
  },
  outputText: {
    fontSize: 10, color: '#334155', lineHeight: 15,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Outcome card
  outcomeCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border,
    borderLeftWidth: 4, borderLeftColor: colors.accent,
    marginTop: 8,
  },
  outcomeHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12,
  },
  outcomeTitle: {
    fontSize: 11, fontWeight: '700', color: colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  outcomeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  outcomeKey: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  outcomeVal: { fontSize: 13, color: colors.textPrimary, fontWeight: '700', maxWidth: '58%', textAlign: 'right' },

  fallbackNotice: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#FEF3C7', borderRadius: 8, padding: 10, marginTop: 10,
  },
  fallbackNoticeText: { fontSize: 12, color: '#92400E', fontWeight: '600', flex: 1 },
});

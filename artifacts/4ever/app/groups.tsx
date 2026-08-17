import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Header, LanguageSelector, LevelPill, Screen, SoftCard } from '@/components/AppUI';
import type { LanguageCode } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

type Group = {
  id: string;
  name: string;
  topic: string;
  memberCount: number;
  languages: LanguageCode[];
  meetingDay: string;
  description: string;
};

const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Processing Anger',
    topic: 'Anger',
    memberCount: 8,
    languages: ['en', 'es'],
    meetingDay: 'Thursdays',
    description: "A safe space to name and understand anger — what's under it, and what to do with it.",
  },
  {
    id: 'g2',
    name: 'Living with Grief',
    topic: 'Grief',
    memberCount: 6,
    languages: ['en', 'fr'],
    meetingDay: 'Tuesdays',
    description: 'For those navigating loss of any kind. No timeline, no pressure.',
  },
  {
    id: 'g3',
    name: 'Anxiety Circle',
    topic: 'Anxiety',
    memberCount: 11,
    languages: ['en', 'ko'],
    meetingDay: 'Wednesdays',
    description: 'Share what anxiety feels like for you, and learn how others find steadiness.',
  },
  {
    id: 'g4',
    name: 'Reconnecting',
    topic: 'Loneliness',
    memberCount: 7,
    languages: ['ar', 'en', 'vi'],
    meetingDay: 'Mondays',
    description: 'For people who feel disconnected from others — and want to change that gently.',
  },
];

const TOPIC_COLORS: Record<string, string> = {
  Anger: '#f87171',
  Grief: '#94a3b8',
  Anxiety: '#fbbf24',
  Loneliness: '#a78bfa',
};

export default function GroupsScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const { groupRequests, requestGroupSupport } = useApp();
  const [language, setLanguage] = useState<LanguageCode>('en');

  const filtered = MOCK_GROUPS.filter((g) => g.languages.includes(language));

  async function handleJoin(group: Group) {
    const already = groupRequests.find((r) => r.groupId === group.id);
    if (already) {
      Alert.alert('Already requested', `You've already requested to join ${group.name}.`);
      return;
    }
    await requestGroupSupport(group.id, group.name);
    Alert.alert(
      'Request sent 💙',
      `Your request to join "${group.name}" has been saved. You'll be notified when a spot opens up.`,
      [{ text: 'Got it' }],
    );
  }

  return (
    <Screen>
      <Header
        title="Find your people"
        subtitle="Level 3 · Group Support"
        onBack={() => router.back()}
        right={<LevelPill level={3} label="Group" />}
      />

      <SoftCard style={styles.intro}>
        <View style={styles.introIcon}>
          <Feather name="globe" size={22} color={colors.primary} />
        </View>
        <Text style={styles.introTitle}>Small circles of understanding.</Text>
        <Text style={styles.introBody}>
          Groups of 6–12 people working through similar things. Weekly sessions, in your language, with a trained facilitator.
        </Text>
      </SoftCard>

      <View style={styles.section}>
        <LanguageSelector
          value={language}
          onChange={setLanguage}
          label="Groups that meet in…"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {filtered.length} {filtered.length === 1 ? 'group' : 'groups'} available
        </Text>
        {filtered.length === 0 ? (
          <SoftCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No groups in this language yet. We're growing — check back soon or request a new group.</Text>
          </SoftCard>
        ) : (
          filtered.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={handleJoin}
              joined={!!groupRequests.find((r) => r.groupId === group.id)}
            />
          ))
        )}
      </View>

      <View style={styles.translationNote}>
        <Feather name="globe" size={14} color={colors.primary} />
        <Text style={styles.translationText}>
          4Ever translates sessions live. You can participate in your language even if others speak differently.
        </Text>
      </View>
    </Screen>
  );
}

function GroupCard({
  group,
  onJoin,
  joined,
}: {
  group: Group;
  onJoin: (g: Group) => void;
  joined: boolean;
}) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const topicColor = TOPIC_COLORS[group.topic] ?? colors.primary;

  return (
    <SoftCard style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={[styles.topicDot, { backgroundColor: topicColor + '33', borderColor: topicColor + '55' }]}>
          <View style={[styles.dotInner, { backgroundColor: topicColor }]} />
        </View>
        <View style={styles.groupMeta}>
          <Text style={[styles.groupName, { color: colors.foreground }]}>{group.name}</Text>
          <View style={styles.groupStats}>
            <View style={[styles.statPill, { backgroundColor: colors.secondary }]}>
              <Feather name="users" size={10} color={colors.mutedForeground} />
              <Text style={[styles.statText, { color: colors.mutedForeground }]}>{group.memberCount} members</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: colors.secondary }]}>
              <Feather name="calendar" size={10} color={colors.mutedForeground} />
              <Text style={[styles.statText, { color: colors.mutedForeground }]}>{group.meetingDay}</Text>
            </View>
          </View>
        </View>
        <View style={styles.languageFlags}>
          {group.languages.map((l) => {
            const flags: Record<string, string> = { en: '🇬🇧', ar: '🇪🇬', ko: '🇰🇷', vi: '🇻🇳', es: '🇪🇸', fr: '🇫🇷' };
            return <Text key={l} style={styles.flag}>{flags[l]}</Text>;
          })}
        </View>
      </View>

      <Text style={[styles.groupDesc, { color: colors.mutedForeground }]}>{group.description}</Text>

      {joined ? (
        <View style={[styles.joinedBadge, { backgroundColor: colors.success + '18' }]}>
          <Feather name="check" size={13} color={colors.success} />
          <Text style={[styles.joinedText, { color: colors.success }]}>Request sent · pending</Text>
        </View>
      ) : (
        <Pressable
          onPress={() => onJoin(group)}
          style={({ pressed }) => [styles.joinBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.8 }]}
        >
          <Text style={[styles.joinText, { color: colors.primaryForeground }]}>Request to join</Text>
          <Feather name="arrow-right" size={14} color={colors.primaryForeground} />
        </Pressable>
      )}
    </SoftCard>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    intro: { gap: 10, padding: 20 },
    introIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.primary + '22', alignItems: 'center', justifyContent: 'center' },
    introTitle: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 20, letterSpacing: -0.5, lineHeight: 26 },
    introBody: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
    section: { marginTop: 22 },
    sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    emptyCard: { alignItems: 'center', padding: 24 },
    emptyText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, textAlign: 'center' },
    groupCard: { marginBottom: 10, gap: 12 },
    groupHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
    topicDot: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    dotInner: { width: 12, height: 12, borderRadius: 6 },
    groupMeta: { flex: 1, gap: 6 },
    groupName: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
    groupStats: { flexDirection: 'row', gap: 6 },
    statPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    statText: { fontFamily: 'Inter_400Regular', fontSize: 11 },
    languageFlags: { flexDirection: 'row', gap: 2 },
    flag: { fontSize: 15 },
    groupDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
    joinedBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 11, borderRadius: 12 },
    joinedText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
    joinBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 2 },
    joinText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    translationNote: { flexDirection: 'row', gap: 8, marginTop: 20, alignItems: 'flex-start', paddingHorizontal: 2 },
    translationText: { flex: 1, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  });
}

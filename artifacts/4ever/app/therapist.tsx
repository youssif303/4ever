import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Header, LanguageSelector, LevelPill, Screen, SoftCard } from '@/components/AppUI';
import type { LanguageCode } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

type Therapist = {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  speciality: string;
  languages: LanguageCode[];
  country: string;
  flag: string;
  bio: string;
  sessionTypes: string[];
};

const MOCK_THERAPISTS: Therapist[] = [
  {
    id: 't1',
    firstName: 'Dr. Hana',
    lastName: 'Yoon',
    initials: 'HY',
    speciality: 'Trauma & Anger',
    languages: ['ko', 'en'],
    country: 'South Korea',
    flag: '🇰🇷',
    bio: 'Specialises in emotional regulation, trauma recovery, and helping people reconnect with themselves after difficult experiences.',
    sessionTypes: ['Individual', 'Online'],
  },
  {
    id: 't2',
    firstName: 'Dr. Layla',
    lastName: 'Hassan',
    initials: 'LH',
    speciality: 'Anxiety & Family',
    languages: ['ar', 'en'],
    country: 'Egypt',
    flag: '🇪🇬',
    bio: 'Works with adults experiencing anxiety, family conflict, and major life transitions. Fluent in Arabic and English.',
    sessionTypes: ['Individual', 'Couples', 'Online'],
  },
  {
    id: 't3',
    firstName: 'Dr. Minh',
    lastName: 'Tran',
    initials: 'MT',
    speciality: 'Depression & Grief',
    languages: ['vi', 'en'],
    country: 'Vietnam',
    flag: '🇻🇳',
    bio: 'Helps individuals work through grief, depression, and feelings of disconnection using a compassionate, evidence-based approach.',
    sessionTypes: ['Individual', 'Online'],
  },
  {
    id: 't4',
    firstName: 'Dr. Isabelle',
    lastName: 'Moreau',
    initials: 'IM',
    speciality: 'Burnout & Stress',
    languages: ['fr', 'en'],
    country: 'France',
    flag: '🇫🇷',
    bio: 'Works with professionals experiencing burnout, chronic stress, and work-related emotional exhaustion.',
    sessionTypes: ['Individual', 'Group', 'Online'],
  },
];

export default function TherapistScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const { therapistRequest, requestTherapistSupport } = useApp();
  const [language, setLanguage] = useState<LanguageCode>('en');

  const filtered = MOCK_THERAPISTS.filter((t) => t.languages.includes(language));

  async function handleRequest(therapist: Therapist) {
    if (therapistRequest) {
      Alert.alert('Already requested', 'Your therapist support request is already pending.');
      return;
    }
    Alert.alert(
      `Request a session with ${therapist.firstName}?`,
      "4Ever will pass just enough context so you don't have to repeat your story. Sessions are conducted in your language.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request session',
          onPress: async () => {
            await requestTherapistSupport(language);
            Alert.alert(
              'Request sent 💙',
              'Your request has been saved. A real connection to a professional support service is coming in a future version.',
              [{ text: 'Got it' }],
            );
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <Header
        title="Talk to a therapist"
        subtitle="Level 4 · Professional Support"
        onBack={() => router.back()}
        right={<LevelPill level={4} label="Therapist" />}
      />

      <SoftCard style={styles.intro}>
        <View style={styles.introIcon}>
          <Feather name="heart" size={22} color={'#a78bfa'} />
        </View>
        <Text style={styles.introTitle}>You don't have to hold everything alone.</Text>
        <Text style={styles.introBody}>
          Find a therapist who speaks your language. 4Ever translates your sessions in real time — so you can connect with the right person, anywhere in the world.
        </Text>
      </SoftCard>

      {/* Translation highlight */}
      <View style={[styles.translationBanner, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
        <Feather name="globe" size={15} color={colors.primary} />
        <Text style={[styles.translationText, { color: colors.foreground }]}>
          Real-time translation · Break the language barrier · No story-repeating
        </Text>
      </View>

      <View style={styles.section}>
        <LanguageSelector
          value={language}
          onChange={setLanguage}
          label="Find a therapist who speaks…"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {filtered.length} therapist{filtered.length !== 1 ? 's' : ''} available
        </Text>

        {therapistRequest ? (
          <View style={[styles.pendingBanner, { backgroundColor: colors.success + '18', borderColor: colors.success + '30' }]}>
            <Feather name="check-circle" size={16} color={colors.success} />
            <View style={styles.pendingCopy}>
              <Text style={[styles.pendingTitle, { color: colors.foreground }]}>Session request sent</Text>
              <Text style={[styles.pendingBody, { color: colors.mutedForeground }]}>
                Language: {therapistRequest.language?.toUpperCase() ?? 'EN'} · Status: Pending
              </Text>
            </View>
          </View>
        ) : null}

        {filtered.length === 0 ? (
          <SoftCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No therapists available for this language yet. Join the waitlist and we'll let you know.</Text>
          </SoftCard>
        ) : (
          filtered.map((therapist) => (
            <TherapistCard
              key={therapist.id}
              therapist={therapist}
              onRequest={handleRequest}
              requested={!!therapistRequest}
            />
          ))
        )}
      </View>

      <View style={styles.disclaimer}>
        <Feather name="info" size={13} color={colors.mutedForeground} />
        <Text style={styles.disclaimerText}>
          In this MVP, no request is sent to a real therapist yet. The flow is ready to connect to a secure professional-support service in a future version.
        </Text>
      </View>
    </Screen>
  );
}

function TherapistCard({
  therapist,
  onRequest,
  requested,
}: {
  therapist: Therapist;
  onRequest: (t: Therapist) => void;
  requested: boolean;
}) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <SoftCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: '#a78bfa22' }]}>
          <Text style={[styles.avatarText, { color: '#a78bfa' }]}>{therapist.initials}</Text>
        </View>
        <View style={styles.cardMeta}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.foreground }]}>{therapist.firstName} {therapist.lastName}</Text>
            <Text style={styles.countryFlag}>{therapist.flag}</Text>
          </View>
          <View style={[styles.specialityPill, { backgroundColor: '#a78bfa22' }]}>
            <Text style={[styles.specialityText, { color: '#a78bfa' }]}>{therapist.speciality}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.bio, { color: colors.mutedForeground }]}>{therapist.bio}</Text>

      <View style={styles.sessionTypes}>
        {therapist.sessionTypes.map((s) => (
          <View key={s} style={[styles.sessionPill, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.sessionText, { color: colors.secondaryForeground }]}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={styles.languageRow}>
        {therapist.languages.map((l) => {
          const flags: Record<string, string> = { en: '🇬🇧', ar: '🇪🇬', ko: '🇰🇷', vi: '🇻🇳', es: '🇪🇸', fr: '🇫🇷' };
          const labels: Record<string, string> = { en: 'English', ar: 'Arabic', ko: 'Korean', vi: 'Vietnamese', es: 'Spanish', fr: 'French' };
          return (
            <Text key={l} style={[styles.langChip, { color: colors.mutedForeground, backgroundColor: colors.secondary }]}>
              {flags[l]} {labels[l]}
            </Text>
          );
        })}
      </View>

      {requested ? (
        <View style={[styles.requestedBadge, { backgroundColor: colors.success + '18' }]}>
          <Feather name="check" size={13} color={colors.success} />
          <Text style={[styles.requestedText, { color: colors.success }]}>Session requested · pending</Text>
        </View>
      ) : (
        <Pressable
          onPress={() => onRequest(therapist)}
          style={({ pressed }) => [styles.requestBtn, { backgroundColor: '#a78bfa' }, pressed && { opacity: 0.8 }]}
        >
          <Text style={[styles.requestText, { color: '#fff' }]}>Request a session</Text>
          <Feather name="arrow-right" size={14} color="#fff" />
        </Pressable>
      )}
    </SoftCard>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    intro: { gap: 10, padding: 20 },
    introIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#a78bfa22', alignItems: 'center', justifyContent: 'center' },
    introTitle: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 20, letterSpacing: -0.5, lineHeight: 26 },
    introBody: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
    translationBanner: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 12, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, borderWidth: 1 },
    translationText: { fontFamily: 'Inter_500Medium', fontSize: 12, flex: 1, lineHeight: 17 },
    section: { marginTop: 22 },
    sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    pendingBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 13, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
    pendingCopy: { flex: 1 },
    pendingTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    pendingBody: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
    emptyCard: { alignItems: 'center', padding: 24 },
    emptyText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, textAlign: 'center' },
    card: { marginBottom: 10, gap: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    avatar: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#a78bfa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 2 },
    avatarText: { fontFamily: 'Inter_700Bold', fontSize: 16 },
    cardMeta: { flex: 1, gap: 5 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    name: { fontFamily: 'Inter_600SemiBold', fontSize: 15, flex: 1 },
    countryFlag: { fontSize: 18 },
    specialityPill: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
    specialityText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
    bio: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
    sessionTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    sessionPill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
    sessionText: { fontFamily: 'Inter_400Regular', fontSize: 11 },
    languageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    langChip: { fontFamily: 'Inter_400Regular', fontSize: 12, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
    requestedBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 11, borderRadius: 12 },
    requestedText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
    requestBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, shadowColor: '#a78bfa', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 3 },
    requestText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    disclaimer: { flexDirection: 'row', gap: 8, marginTop: 20, paddingHorizontal: 2, alignItems: 'flex-start' },
    disclaimerText: { flex: 1, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17 },
  });
}
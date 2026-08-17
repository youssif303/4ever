import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BrandMark, GradientHero, JourneyLadder, JourneyStep, MoodSelector, PrimaryButton, Screen, SectionLabel, SoftCard } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import type { MoodValue } from '@/types';

export default function HomeScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const { hydrated, profile, moods, createConversation, createReliefConversation } = useApp();
  const [selectedMood, setSelectedMood] = useState<MoodValue | null>(moods[0]?.mood ?? null);

  useEffect(() => {
    if (!selectedMood && moods[0]) setSelectedMood(moods[0].mood);
  }, [moods, selectedMood]);

  const greeting = useMemo(() => {
    const name = profile.firstName.trim();
    return name ? `Good to see you, ${name}.` : 'Good to see you.';
  }, [profile.firstName]);

  async function startConversation() {
    const id = await createConversation();
    router.push({ pathname: '/chat', params: { id } });
  }

  async function startRelief() {
    const id = await createReliefConversation();
    router.push({ pathname: '/relief', params: { id } });
  }

  if (!hydrated) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <Screen>
      <View style={styles.topbar}>
        <BrandMark />
        <Pressable accessibilityLabel="Open profile" onPress={() => router.push('/profile')} style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}>
          <Feather name="user" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <Text style={styles.eyebrow}>A moment for yourself</Text>
      <Text style={styles.title}>{greeting}</Text>
      <Text style={styles.subtitle}>How are you feeling today?</Text>

      <GradientHero>
        <View style={styles.heroOrb} />
        <Text style={styles.heroKicker}>4EVER COMPANION</Text>
        <Text style={styles.heroTitle}>Reconnect with yourself.</Text>
        <Text style={styles.heroBody}>Take a moment to understand what you’re experiencing.</Text>
        <PrimaryButton onPress={startConversation} icon="arrow-up-right">Start a conversation</PrimaryButton>
      </GradientHero>

      {/* Fast Relief CTA */}
      <Pressable onPress={startRelief} style={({ pressed }) => [styles.reliefCard, { backgroundColor: colors.softAccent, borderColor: colors.accent }, pressed && styles.pressed]}>
        <View style={[styles.reliefIcon, { backgroundColor: colors.accent + '22' }]}>
          <Feather name="zap" size={18} color={colors.accent} />
        </View>
        <View style={styles.reliefCopy}>
          <Text style={[styles.reliefTitle, { color: colors.foreground }]}>Need to let it out right now?</Text>
          <Text style={[styles.reliefBody, { color: colors.mutedForeground }]}>Vent immediately — no setup, just space.</Text>
        </View>
        <Feather name="chevron-right" size={17} color={colors.accent} />
      </Pressable>

      <View style={styles.section}>
        <SectionLabel action="View history" onAction={() => router.push('/mood')}>Check in with yourself</SectionLabel>
        <SoftCard>
          <Text style={styles.cardTitle}>What's the feeling today?</Text>
          <Text style={styles.cardBody}>There's no right answer. Just notice what's here.</Text>
          <MoodSelector value={selectedMood} onChange={setSelectedMood} />
        </SoftCard>
      </View>

      <View style={styles.section}>
        <SectionLabel>Your journey</SectionLabel>
        <JourneyLadder>
          <JourneyStep level={1} icon="edit-3" title="AI First Aid" description="Tell 4Ever what happened. Feel heard." onPress={startConversation} active />
          <JourneyStep level={2} icon="users" title="Peer Connection" description="Talk to someone who's been there." onPress={() => router.push('/peer')} />
          <JourneyStep level={3} icon="globe" title="Group Support" description="Find your people. Small circles of understanding." onPress={() => router.push('/groups')} />
          <JourneyStep level={4} icon="heart" title="Talk to a Therapist" description="Professional support in your language." onPress={() => router.push('/therapist')} />
        </JourneyLadder>
      </View>

      <View style={styles.footerNote}>
        <Feather name="shield" size={15} color={colors.mutedForeground} />
        <Text style={styles.footerText}>Private on this device. Always a wellbeing tool, never a replacement for professional care.</Text>
      </View>
    </Screen>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 38 },
    profileButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
    eyebrow: { color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10 },
    title: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 36, letterSpacing: -1.4 },
    subtitle: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 16, marginTop: 8, marginBottom: 28, lineHeight: 24 },
    // Hero card — dark navy to teal glow
    heroKicker: { color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2, marginBottom: 18, textTransform: 'uppercase' },
    heroTitle: { color: '#E8F4FF', fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -1.2, maxWidth: 280, lineHeight: 38 },
    heroBody: { color: '#7BACC7', fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, maxWidth: 300, marginTop: 12, marginBottom: 28 },
    heroOrb: { position: 'absolute', width: 260, height: 260, borderRadius: 130, right: -90, top: -100, backgroundColor: colors.primary + '18' },
    // Fast Relief card — amber glow
    reliefCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 17, borderRadius: 20, borderWidth: 1.5, marginTop: 18 },
    reliefIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    reliefCopy: { flex: 1 },
    reliefTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: -0.2 },
    reliefBody: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
    section: { marginTop: 32 },
    cardTitle: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 17, letterSpacing: -0.3 },
    cardBody: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, marginTop: 6, marginBottom: 18 },
    footerNote: { flexDirection: 'row', gap: 8, marginTop: 32, alignItems: 'flex-start' },
    footerText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, flex: 1 },
    pressed: { opacity: 0.72 },
  });
}
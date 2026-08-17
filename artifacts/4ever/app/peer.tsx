import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Header, LanguageSelector, LevelPill, Screen, SoftCard } from '@/components/AppUI';
import type { LanguageCode } from '@/components/AppUI';
import { useColors } from '@/hooks/useColors';

type Peer = {
  id: string;
  firstName: string;
  initials: string;
  quote: string;
  topic: string;
  languages: LanguageCode[];
  waitMonths: number;
};

const MOCK_PEERS: Peer[] = [
  {
    id: 'p1',
    firstName: 'Sarah',
    initials: 'S',
    quote: "I went through something very similar with my family. I know how isolating it feels.",
    topic: 'Family conflict',
    languages: ['en', 'fr'],
    waitMonths: 3,
  },
  {
    id: 'p2',
    firstName: 'Ahmed',
    initials: 'A',
    quote: "I used to carry a lot of anger. Learning to name it was the first step for me.",
    topic: 'Anger & overwhelm',
    languages: ['ar', 'en'],
    waitMonths: 8,
  },
  {
    id: 'p3',
    firstName: 'Ji-yeon',
    initials: 'J',
    quote: "Feeling like no one understands you is one of the loneliest things. You're not alone.",
    topic: 'Loneliness',
    languages: ['ko', 'en'],
    waitMonths: 5,
  },
  {
    id: 'p4',
    firstName: 'Maria',
    initials: 'M',
    quote: "I had a period where work nearly broke me. I found a way through and I'm happy to share.",
    topic: 'Burnout & stress',
    languages: ['es', 'en'],
    waitMonths: 12,
  },
];

export default function PeerScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [showModal, setShowModal] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);

  const filtered = MOCK_PEERS.filter((p) => p.languages.includes(language));

  function handleConnect(peer: Peer) {
    setSelectedPeer(peer);
    setShowModal(true);
  }

  function confirmConnect() {
    setShowModal(false);
    Alert.alert(
      'Request sent 💙',
      `${selectedPeer?.firstName} will be notified. 4Ever will introduce you when they're ready — you won't need to repeat your story.`,
      [{ text: 'Got it', style: 'default' }],
    );
  }

  return (
    <Screen>
      <Header
        title="Someone who understands"
        subtitle="Level 2 · Peer Connection"
        onBack={() => router.back()}
        right={<LevelPill level={2} label="Peer" />}
      />

      <SoftCard style={styles.intro}>
        <View style={styles.introIcon}>
          <Feather name="users" size={22} color={colors.success} />
        </View>
        <Text style={styles.introTitle}>You don't have to explain everything again.</Text>
        <Text style={styles.introBody}>
          4Ever will introduce you to a peer who's been through something similar. They'll already understand the context — no repeating your story.
        </Text>
      </SoftCard>

      <View style={styles.section}>
        <LanguageSelector
          value={language}
          onChange={setLanguage}
          label="Find someone who speaks…"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {filtered.length} {filtered.length === 1 ? 'person' : 'people'} available
        </Text>
        {filtered.length === 0 ? (
          <SoftCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No peers available in this language yet. Join the waitlist and we'll notify you.</Text>
          </SoftCard>
        ) : (
          filtered.map((peer) => (
            <PeerCard key={peer.id} peer={peer} onConnect={handleConnect} />
          ))
        )}
      </View>

      <View style={styles.translationNote}>
        <Feather name="globe" size={14} color={colors.primary} />
        <Text style={styles.translationText}>
          4Ever translates your conversation in real time. You can connect across languages.
        </Text>
      </View>

      {/* Confirmation modal */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
          <Pressable style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => {}}>
            <View style={[styles.modalIcon, { backgroundColor: colors.success + '22' }]}>
              <Feather name="users" size={24} color={colors.success} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Connect with {selectedPeer?.firstName}?
            </Text>
            <Text style={[styles.modalBody, { color: colors.mutedForeground }]}>
              4Ever will share enough context so {selectedPeer?.firstName} understands what you've been through — without you having to repeat yourself.
            </Text>
            <Pressable
              onPress={confirmConnect}
              style={({ pressed }) => [styles.modalButton, { backgroundColor: colors.primary }, pressed && { opacity: 0.8 }]}
            >
              <Text style={[styles.modalButtonText, { color: colors.primaryForeground }]}>Send connection request</Text>
            </Pressable>
            <Pressable onPress={() => setShowModal(false)} style={styles.modalCancel}>
              <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>Not now</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function PeerCard({ peer, onConnect }: { peer: Peer; onConnect: (p: Peer) => void }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <SoftCard style={styles.peerCard}>
      <View style={styles.peerHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '22' }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{peer.initials}</Text>
        </View>
        <View style={styles.peerMeta}>
          <Text style={[styles.peerName, { color: colors.foreground }]}>{peer.firstName}</Text>
          <View style={[styles.topicPill, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.topicText, { color: colors.secondaryForeground }]}>{peer.topic}</Text>
          </View>
        </View>
        <View style={styles.languageFlags}>
          {peer.languages.map((l) => {
            const flags: Record<string, string> = { en: '🇬🇧', ar: '🇪🇬', ko: '🇰🇷', vi: '🇻🇳', es: '🇪🇸', fr: '🇫🇷' };
            return <Text key={l} style={styles.flag}>{flags[l]}</Text>;
          })}
        </View>
      </View>
      <Text style={[styles.quote, { color: colors.mutedForeground }]}>"{peer.quote}"</Text>
      <View style={styles.peerFooter}>
        <Text style={[styles.experience, { color: colors.mutedForeground }]}>
          <Feather name="clock" size={11} /> {peer.waitMonths} month{peer.waitMonths !== 1 ? 's' : ''} ago
        </Text>
        <Pressable
          onPress={() => onConnect(peer)}
          style={({ pressed }) => [styles.connectBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.8 }]}
        >
          <Text style={[styles.connectText, { color: colors.primaryForeground }]}>Connect</Text>
          <Feather name="arrow-right" size={13} color={colors.primaryForeground} />
        </Pressable>
      </View>
    </SoftCard>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    intro: { gap: 10, padding: 20 },
    introIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.success + '22', alignItems: 'center', justifyContent: 'center' },
    introTitle: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 20, letterSpacing: -0.5, lineHeight: 26 },
    introBody: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
    section: { marginTop: 22 },
    sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    emptyCard: { alignItems: 'center', padding: 24 },
    emptyText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, textAlign: 'center' },
    peerCard: { marginBottom: 10, gap: 12 },
    peerHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    avatar: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 2 },
    avatarText: { fontFamily: 'Inter_700Bold', fontSize: 17 },
    peerMeta: { flex: 1, gap: 5 },
    peerName: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
    topicPill: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
    topicText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
    languageFlags: { flexDirection: 'row', gap: 3 },
    flag: { fontSize: 16 },
    quote: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
    peerFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    experience: { fontFamily: 'Inter_400Regular', fontSize: 12 },
    connectBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 2 },
    connectText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
    translationNote: { flexDirection: 'row', gap: 8, marginTop: 20, alignItems: 'flex-start', paddingHorizontal: 2 },
    translationText: { flex: 1, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
    modal: { width: '100%', maxWidth: 380, borderRadius: 24, borderWidth: 1, padding: 24, gap: 14 },
    modalIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
    modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, letterSpacing: -0.5, textAlign: 'center' },
    modalBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, textAlign: 'center' },
    modalButton: { paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
    modalButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
    modalCancel: { alignItems: 'center', paddingVertical: 4 },
    modalCancelText: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  });
}

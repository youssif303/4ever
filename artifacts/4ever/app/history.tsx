import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Header, Screen, SoftCard } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function HistoryScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const { conversations, createConversation } = useApp();
  return (
    <Screen>
      <Header title="Your history" subtitle="Private and stored on this device" onBack={() => router.back()} />
      {conversations.length === 0 ? (
        <SoftCard style={styles.emptyCard}>
          <View style={styles.emptyIcon}><Feather name="message-circle" size={21} color={colors.primary} /></View>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptyBody}>When you start talking with 4Ever, your reflections will be saved here so you can return to them.</Text>
          <Pressable onPress={async () => { const id = await createConversation(); router.push({ pathname: '/chat', params: { id } }); }} />
        </SoftCard>
      ) : (
        conversations.map((conversation) => (
          <Pressable key={conversation.id} onPress={() => router.push({ pathname: '/chat', params: { id: conversation.id } })} style={({ pressed }) => [styles.conversation, pressed && styles.pressed]}>
            <View style={styles.conversationIcon}><Feather name="message-square" size={17} color={colors.primary} /></View>
            <View style={styles.conversationCopy}><Text style={styles.conversationTitle}>{conversation.title}</Text><Text style={styles.conversationMeta}>{conversation.messages.length - 1} reflection{conversation.messages.length - 1 === 1 ? '' : 's'} · {new Date(conversation.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text></View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        ))
      )}
    </Screen>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    emptyCard: { alignItems: 'center', paddingVertical: 34 },
    emptyIcon: { width: 46, height: 46, borderRadius: 17, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    emptyTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 16 },
    emptyBody: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8, maxWidth: 290 },
    conversation: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 9, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
    conversationIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
    conversationCopy: { flex: 1 },
    conversationTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    conversationMeta: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
    pressed: { opacity: 0.72 },
  });
}
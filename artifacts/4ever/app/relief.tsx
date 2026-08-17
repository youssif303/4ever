import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { PrimaryButton, SoftCard } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { checkSafety } from '@/services/safety';
import { sendChatMessage } from '@/services/api';
import { useColors } from '@/hooks/useColors';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Message } from '@/types';

export default function ReliefScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { conversations, createReliefConversation, addMessage } = useApp();
  const conversation = conversations.find((c) => c.id === id);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const list = useRef<FlatList<Message>>(null);

  const voice = useVoiceInput({
    onTranscript: useCallback((text: string) => {
      setInput(text);
    }, []),
  });

  useEffect(() => {
    if (!id) {
      createReliefConversation().then((cid) =>
        router.replace({ pathname: '/relief', params: { id: cid } }),
      );
    }
  }, [id, createReliefConversation]);

  const displayMessages = useMemo(
    () => [...(conversation?.messages ?? [])].reverse(),
    [conversation?.messages],
  );

  const userMessageCount = useMemo(
    () => (conversation?.messages ?? []).filter((m) => m.role === 'user').length,
    [conversation?.messages],
  );

  async function send() {
    const content = input.trim();
    if (!content || !conversation || isSending) return;
    voice.stop();
    setInput('');
    setError(false);
    setIsSending(true);

    const safetyResult = checkSafety(content);
    await addMessage(conversation.id, { role: 'user', content });

    if (safetyResult.level === 'crisis') {
      await addMessage(conversation.id, {
        role: 'assistant',
        content:
          "I hear you, and I'm really glad you reached out. If you are not safe right now, please contact your local emergency number or go to the nearest emergency department. You can also request therapist support here.",
      });
      setIsSending(false);
      return;
    }

    try {
      const context = (conversation.messages ?? []).slice(-12).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const response = await sendChatMessage({
        conversationId: conversation.id,
        message: content,
        context,
        mode: 'relief',
        journeyLevel: 1,
      });
      await addMessage(conversation.id, { role: 'assistant', content: response.message });
    } catch {
      setError(true);
    } finally {
      setIsSending(false);
    }
  }

  async function retry() {
    const last = [...(conversation?.messages ?? [])].reverse().find((m) => m.role === 'user');
    if (!last || !conversation) return;
    setError(false);
    try {
      setIsSending(true);
      const response = await sendChatMessage({
        conversationId: conversation.id,
        message: last.content,
        context: conversation.messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
        mode: 'relief',
        journeyLevel: 1,
      });
      await addMessage(conversation.id, { role: 'assistant', content: response.message });
    } catch {
      setError(true);
    } finally {
      setIsSending(false);
    }
  }

  if (!conversation) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Opening a space for you…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.keyboard} behavior="padding" keyboardVerticalOffset={0}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 14) }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Feather name="x" size={20} color={colors.foreground} />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={styles.onlineDot} />
            <Text style={styles.headerTitle}>Let it out</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          ref={list}
          inverted
          data={displayMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          scrollEnabled={displayMessages.length > 0}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {isSending ? <TypingIndicator /> : null}
              {error ? (
                <SoftCard style={styles.errorCard}>
                  <Text style={styles.errorTitle}>Couldn't connect right now.</Text>
                  <PrimaryButton variant="quiet" onPress={retry} icon="refresh-cw">
                    Try again
                  </PrimaryButton>
                </SoftCard>
              ) : null}
              {/* After venting a few times, offer to go deeper */}
              {userMessageCount >= 3 && !isSending ? (
                <View style={[styles.nudgeCard, { backgroundColor: colors.softAccent, borderColor: colors.accent }]}>
                  <Text style={[styles.nudgeTitle, { color: colors.foreground }]}>
                    You've shared a lot. 💙
                  </Text>
                  <Text style={[styles.nudgeBody, { color: colors.mutedForeground }]}>
                    When you're ready, you can connect with someone who's been through something similar — no need to repeat your story.
                  </Text>
                  <Pressable
                    onPress={() => router.push('/peer')}
                    style={({ pressed }) => [styles.nudgeButton, { backgroundColor: colors.primary }, pressed && { opacity: 0.8 }]}
                  >
                    <Text style={[styles.nudgeButtonText, { color: colors.primaryForeground }]}>
                      Find someone who understands
                    </Text>
                    <Feather name="arrow-right" size={14} color={colors.primaryForeground} />
                  </Pressable>
                </View>
              ) : null}
            </>
          }
        />

        <View style={[styles.inputDock, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={voice.isListening ? 'Listening…' : "Say what's on your mind…"}
            placeholderTextColor={voice.isListening ? colors.accent : colors.mutedForeground}
            style={styles.input}
            multiline
            maxLength={4000}
            editable={!isSending}
            onSubmitEditing={send}
            returnKeyType="send"
            autoFocus
          />
          {voice.supported ? (
            <Pressable
              accessibilityLabel={voice.isListening ? 'Stop recording' : 'Record voice message'}
              onPress={voice.toggle}
              style={({ pressed }) => [styles.micButton, voice.isListening && styles.micActive, pressed && { opacity: 0.72 }]}
            >
              <Feather name={voice.isListening ? 'mic-off' : 'mic'} size={19} color={voice.isListening ? colors.primaryForeground : colors.primary} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={send}
            disabled={!input.trim() || isSending}
            style={({ pressed }) => [
              styles.sendButton,
              (!input.trim() || isSending) && styles.sendDisabled,
              pressed && { opacity: 0.72 },
            ]}
          >
            <Feather name="arrow-up" size={20} color={colors.primaryForeground} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[styles.messageRow, isUser && styles.userRow]}>
        {!isUser ? (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>4</Text>
          </View>
        ) : null}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>{message.content}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function TypingIndicator() {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={styles.typing}>
      <View style={styles.typingDot} />
      <View style={styles.typingDot} />
      <View style={styles.typingDot} />
      <Text style={styles.typingText}>Listening…</Text>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    loadingText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 15 },
    keyboard: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, width: '100%', maxWidth: 900, alignSelf: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 10 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
    headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, color: colors.foreground, letterSpacing: -0.4 },
    listContent: { paddingHorizontal: 18, paddingBottom: 18, paddingTop: 8 },
    messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 16 },
    userRow: { justifyContent: 'flex-end' },
    aiAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 2, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 2 },
    aiAvatarText: { color: colors.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: -0.5 },
    bubble: { maxWidth: '80%', paddingHorizontal: 17, paddingVertical: 13, borderRadius: 22 },
    assistantBubble: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 6, borderLeftWidth: 3, borderLeftColor: colors.primary },
    userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 6, shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 10, elevation: 2 },
    messageText: { color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23 },
    userMessageText: { color: colors.primaryForeground },
    typing: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingVertical: 8, paddingLeft: 40 },
    typingDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary },
    typingText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, marginLeft: 4 },
    errorCard: { marginBottom: 14, gap: 8 },
    errorTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    nudgeCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14, gap: 10 },
    nudgeTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
    nudgeBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
    nudgeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 14 },
    nudgeButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    inputDock: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.darkSurface },
    input: { flex: 1, minHeight: 48, maxHeight: 120, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 13, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15 },
    micButton: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card },
    micActive: { backgroundColor: colors.destructive, borderColor: colors.destructive },
    sendButton: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
    sendDisabled: { backgroundColor: colors.muted, shadowOpacity: 0 },
  });
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Header, LevelPill, PrimaryButton, Screen, SoftCard } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { checkSafety, type SafetyLevel } from '@/services/safety';
import { sendChatMessage } from '@/services/api';
import { useColors } from '@/hooks/useColors';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import type { Message } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { conversations, createConversation, addMessage } = useApp();
  const conversation = conversations.find((item) => item.id === id);
  const [input, setInput] = useState('');
  const [safety, setSafety] = useState<SafetyLevel>('normal');
  const [error, setError] = useState(false);
  const list = useRef<FlatList<Message>>(null);
  const [isSending, setIsSending] = useState(false);

  const voice = useVoiceInput({
    onTranscript: useCallback((text: string) => {
      setInput(text);
    }, []),
  });

  useEffect(() => {
    if (!id) {
      createConversation().then((conversationId) => router.replace({ pathname: '/chat', params: { id: conversationId } }));
    }
  }, [id, createConversation]);

  const displayMessages = useMemo(() => [...(conversation?.messages ?? [])].reverse(), [conversation?.messages]);

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
    setSafety(safetyResult.level);
    await addMessage(conversation.id, { role: 'user', content });

    if (safetyResult.level === 'crisis') {
      await addMessage(conversation.id, {
        role: 'assistant',
        content: 'I’m really glad you said this out loud. If you may act on these thoughts or you are not safe, please contact your local emergency number now or go to the nearest emergency department. If you can, reach out to someone you trust and ask them to stay with you. You can also request therapist support here.',
      });
      setIsSending(false);
      return;
    }

    try {
      const context = (conversation.messages ?? []).slice(-12).map((message) => ({
        role: message.role,
        content: message.content,
      }));
      const response = await sendChatMessage({ conversationId: conversation.id, message: content, context, mode: 'reflect', journeyLevel: 1 });
      await addMessage(conversation.id, { role: 'assistant', content: response.message });
    } catch {
      setError(true);
    } finally {
      setIsSending(false);
    }
  }

  async function retry() {
    const lastUserMessage = [...(conversation?.messages ?? [])].reverse().find((message) => message.role === 'user');
    if (!lastUserMessage || !conversation) return;
    setError(false);
    try {
      setIsSending(true);
      const response = await sendChatMessage({ conversationId: conversation.id, message: lastUserMessage.content, context: conversation.messages.slice(-12).map((message) => ({ role: message.role, content: message.content })), mode: 'reflect', journeyLevel: 1 });
      await addMessage(conversation.id, { role: 'assistant', content: response.message });
    } catch {
      setError(true);
    } finally {
      setIsSending(false);
    }
  }

  if (!conversation) {
    return <Screen><View style={styles.empty}><Text style={styles.emptyTitle}>Opening your conversation…</Text></View></Screen>;
  }

  return (
    <KeyboardAvoidingView style={styles.keyboard} behavior="padding" keyboardVerticalOffset={0}>
      <View style={styles.container}>
        <View style={[styles.headerWrap, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12) }]}>
          <Header title="A moment to reflect" subtitle="A private conversation on this device" onBack={() => router.back()} right={<View style={styles.online}><View style={styles.onlineDot} /><Text style={styles.onlineText}>Here with you</Text></View>} />
          <View style={styles.levelPillRow}><LevelPill level={1} label="First Aid" /></View>
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
                  <Text style={styles.errorTitle}>4Ever couldn’t connect right now.</Text>
                  <Text style={styles.errorBody}>Your message is saved locally. Try again when you’re ready.</Text>
                  <PrimaryButton variant="quiet" onPress={retry} icon="refresh-cw">Try again</PrimaryButton>
                </SoftCard>
              ) : null}
              {safety === 'crisis' ? (
                <SoftCard style={styles.safetyCard}>
                  <View style={styles.safetyHeader}><Feather name="shield" color={colors.destructive} size={17} /><Text style={styles.safetyTitle}>You deserve immediate human support</Text></View>
                  <Text style={styles.safetyBody}>If you may act on these thoughts or are not safe, contact local emergency support now. Requesting therapist support is also available.</Text>
                  <PrimaryButton variant="secondary" onPress={() => router.push('/therapist')} icon="heart">Request therapist support</PrimaryButton>
                </SoftCard>
              ) : null}
              {userMessageCount >= 2 && userMessageCount < 4 && !isSending ? (
                <View style={styles.affirmationBanner}>
                  <Feather name="check-circle" size={14} color={colors.success} />
                  <Text style={styles.affirmationText}>You're being heard. Take your time.</Text>
                </View>
              ) : null}
              {userMessageCount >= 4 && !isSending ? (
                <SoftCard style={styles.nudgeCard}>
                  <Text style={styles.nudgeTitle}>You've shared something real. 💙</Text>
                  <Text style={styles.nudgeBody}>When you feel ready, 4Ever can connect you with someone who's been through something similar — without you having to repeat your story.</Text>
                  <PrimaryButton variant="secondary" onPress={() => router.push('/peer')} icon="users">Find someone who understands</PrimaryButton>
                </SoftCard>
              ) : null}
            </>
          }
        />
        <View style={[styles.inputDock, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            testID="chat-input"
            value={input}
            onChangeText={setInput}
            placeholder={voice.isListening ? 'Listening…' : "Write what's on your mind…"}
            placeholderTextColor={voice.isListening ? colors.accent : colors.mutedForeground}
            style={styles.input}
            multiline
            maxLength={4000}
            editable={!isSending}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          {voice.supported ? (
            <Pressable
              accessibilityLabel={voice.isListening ? 'Stop recording' : 'Record voice message'}
              onPress={voice.toggle}
              style={({ pressed }) => [styles.micButton, voice.isListening && styles.micActive, pressed && styles.pressed]}
            >
              <Feather name={voice.isListening ? 'mic-off' : 'mic'} size={19} color={voice.isListening ? colors.primaryForeground : colors.primary} />
            </Pressable>
          ) : null}
          <Pressable accessibilityLabel="Send message" onPress={send} disabled={!input.trim() || isSending} style={({ pressed }) => [styles.sendButton, (!input.trim() || isSending) && styles.sendDisabled, pressed && styles.pressed]}>
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
  return <View style={styles.typing}><View style={styles.typingDot} /><View style={styles.typingDot} /><View style={styles.typingDot} /><Text style={styles.typingText}>Thinking with you</Text></View>;
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    keyboard: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, width: '100%', maxWidth: 900, alignSelf: 'center' },
    headerWrap: { paddingHorizontal: 22, borderBottomWidth: 1, borderBottomColor: colors.border },
    online: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
    onlineText: { color: colors.success, fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.3 },
    listContent: { paddingHorizontal: 20, paddingBottom: 18, paddingTop: 12 },
    messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 14 },
    userRow: { justifyContent: 'flex-end' },
    // AI avatar — vivid teal circle
    aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
    aiAvatarText: { color: colors.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: -0.5 },
    bubble: { maxWidth: '78%', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 22 },
    // Dark card bubble with teal left accent
    assistantBubble: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 6, borderLeftWidth: 3, borderLeftColor: colors.primary },
    // Vivid teal user bubble
    userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 6 },
    messageText: { color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24 },
    userMessageText: { color: colors.primaryForeground },
    typing: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 10, paddingLeft: 42 },
    typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
    typingText: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 12, marginLeft: 4, letterSpacing: 0.2 },
    levelPillRow: { marginTop: 4, marginBottom: 8 },
    affirmationBanner: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.success + '22', borderWidth: 1, borderColor: colors.success + '44', marginBottom: 12 },
    affirmationText: { color: colors.success, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
    nudgeCard: { marginBottom: 14, gap: 10, backgroundColor: colors.secondary, borderColor: colors.primary + '55' },
    nudgeTitle: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 14 },
    nudgeBody: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
    errorCard: { marginBottom: 14, gap: 8 },
    errorTitle: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 14 },
    errorBody: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginBottom: 4 },
    safetyCard: { marginBottom: 14, backgroundColor: '#2D1B1B', borderColor: colors.destructive + '55', gap: 10 },
    safetyHeader: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    safetyTitle: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 14, flex: 1 },
    safetyBody: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
    // Dark input dock — near-black background
    inputDock: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.darkSurface },
    input: { flex: 1, minHeight: 48, maxHeight: 120, borderRadius: 24, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 18, paddingVertical: 13, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15 },
    micButton: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.secondary },
    micActive: { backgroundColor: colors.destructive, borderColor: colors.destructive },
    sendButton: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
    sendDisabled: { backgroundColor: colors.muted },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 15 },
    pressed: { opacity: 0.72 },
  });
}
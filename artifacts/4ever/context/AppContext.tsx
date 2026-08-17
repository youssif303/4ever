import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type {
  Conversation,
  ConversationMode,
  GroupRequest,
  Message,
  MoodEntry,
  MoodValue,
  PersistedState,
  Profile,
  TherapistRequest,
} from '@/types';
import { clearPersistedState, loadState, persistState } from '@/services/storage';

type AppContextValue = PersistedState & {
  hydrated: boolean;
  createConversation: () => Promise<string>;
  createReliefConversation: () => Promise<string>;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'> & Partial<Pick<Message, 'id' | 'timestamp'>>) => Promise<void>;
  saveMood: (mood: MoodValue, note: string) => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
  requestTherapistSupport: (language?: string) => Promise<void>;
  requestGroupSupport: (groupId: string, groupName: string) => Promise<void>;
  deleteLocalData: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function titleFromMessage(content: string): string {
  const trimmed = content.trim().replace(/\s+/g, ' ');
  return trimmed.length > 34 ? `${trimmed.slice(0, 34)}…` : trimmed || 'New conversation';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>({
    conversations: [],
    moods: [],
    profile: { firstName: '', email: '' },
    therapistRequest: null,
    groupRequests: [],
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadState().then((loaded) => {
      setState(loaded);
      setHydrated(true);
    });
  }, []);

  async function commit(next: PersistedState) {
    setState(next);
    await persistState(next);
  }

  async function createConversation() {
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: makeId('conversation'),
      title: 'New conversation',
      createdAt: now,
      updatedAt: now,
      mode: 'reflect',
      messages: [
        {
          id: makeId('message'),
          role: 'assistant',
          content: 'What happened?',
          timestamp: now,
        },
      ],
    };
    await commit({ ...state, conversations: [conversation, ...state.conversations] });
    return conversation.id;
  }

  async function createReliefConversation() {
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: makeId('conversation'),
      title: 'Relief session',
      createdAt: now,
      updatedAt: now,
      mode: 'relief',
      messages: [
        {
          id: makeId('message'),
          role: 'assistant',
          content: "I'm here. Tell me what happened.",
          timestamp: now,
        },
      ],
    };
    await commit({ ...state, conversations: [conversation, ...state.conversations] });
    return conversation.id;
  }

  async function addMessage(
    conversationId: string,
    message: Omit<Message, 'id' | 'timestamp'> &
      Partial<Pick<Message, 'id' | 'timestamp'>>,
  ) {
    const now = new Date().toISOString();
    const nextMessage: Message = {
      id: message.id ?? makeId('message'),
      timestamp: message.timestamp ?? now,
      role: message.role,
      content: message.content,
    };
    // Use functional setState so back-to-back calls (user msg → AI response)
    // never overwrite each other due to a stale closure on `state`.
    await new Promise<void>((resolve) => {
      setState((prev) => {
        const conversations = prev.conversations.map((conversation) => {
          if (conversation.id !== conversationId) return conversation;
          const userTitle =
            nextMessage.role === 'user' && conversation.title === 'New conversation'
              ? titleFromMessage(nextMessage.content)
              : conversation.title;
          return {
            ...conversation,
            title: userTitle,
            updatedAt: now,
            messages: [...conversation.messages, nextMessage],
          };
        });
        const next = { ...prev, conversations };
        persistState(next).then(resolve);
        return next;
      });
    });
  }

  async function saveMood(mood: MoodValue, note: string) {
    const entry: MoodEntry = {
      id: makeId('mood'),
      mood,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    await commit({ ...state, moods: [entry, ...state.moods] });
  }

  async function updateProfile(profile: Profile) {
    await commit({ ...state, profile });
  }

  async function requestTherapistSupport(language?: string) {
    const therapistRequest: TherapistRequest = {
      requestedAt: new Date().toISOString(),
      status: 'pending',
      language,
    };
    await commit({ ...state, therapistRequest });
  }

  async function requestGroupSupport(groupId: string, groupName: string) {
    const already = state.groupRequests.find((r) => r.groupId === groupId);
    if (already) return;
    const entry: GroupRequest = {
      groupId,
      groupName,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    await commit({ ...state, groupRequests: [entry, ...state.groupRequests] });
  }

  async function deleteLocalData() {
    await clearPersistedState();
    setState({
      conversations: [],
      moods: [],
      profile: { firstName: '', email: '' },
      therapistRequest: null,
      groupRequests: [],
    });
    Alert.alert('Your local data is deleted', 'Your conversations, mood check-ins, and profile details have been removed from this device.');
  }

  const value = useMemo(
    () => ({
      ...state,
      hydrated,
      createConversation,
      createReliefConversation,
      addMessage,
      saveMood,
      updateProfile,
      requestTherapistSupport,
      requestGroupSupport,
      deleteLocalData,
    }),
    [state, hydrated],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
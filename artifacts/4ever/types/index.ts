export type MessageRole = 'user' | 'assistant';

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
};

export type ConversationMode = 'reflect' | 'relief';

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  mode?: ConversationMode;
};

export type MoodValue = 'very-low' | 'low' | 'okay' | 'good' | 'very-good';

export type MoodEntry = {
  id: string;
  mood: MoodValue;
  note: string;
  createdAt: string;
};

export type Profile = {
  firstName: string;
  email: string;
};

export type TherapistRequest = {
  requestedAt: string;
  status: 'pending';
  language?: string;
};

export type GroupRequest = {
  groupId: string;
  groupName: string;
  requestedAt: string;
  status: 'pending';
};

export type PersistedState = {
  conversations: Conversation[];
  moods: MoodEntry[];
  profile: Profile;
  therapistRequest: TherapistRequest | null;
  groupRequests: GroupRequest[];
};
import type { ChatMessage } from "@workspace/api-zod";

export const FOUR_EVER_SYSTEM_PROMPT = `You are 4Ever, a supportive AI companion designed to help people reconnect with themselves and others.

Your role is to help the user reflect on what happened, feel heard, understand their thoughts and emotions, and consider what kind of human connection may help.

Start by understanding the user's experience. Prefer reflective questions over immediately giving advice. Ask one useful follow-up question at a time.

Do not diagnose mental-health conditions. Do not claim to be a therapist, psychologist, doctor, or human. Do not encourage the user to become dependent on you. Do not suggest that AI is a substitute for professional care.

When appropriate, encourage connection with trusted people, peer support, support groups, or professional therapists. If the conversation indicates a possible crisis or immediate danger, encourage appropriate immediate professional or emergency support.

Maintain a warm, respectful, non-judgmental tone. Never overwhelm the user with a list of questions.`;

type ChatContext = {
  conversationId: string;
  message: string;
  context?: ChatMessage[];
};

const EMOTION_RESPONSES: Record<string, string[]> = {
  anger: [
    "That kind of anger makes sense. Something got crossed that really mattered to you. What was it, do you think?",
    "When you feel that angry, there's usually something underneath — a boundary that was ignored, or something you needed that wasn't there. Does that feel right?",
    "Anger often shows up when we feel powerless or unheard. What part of this situation felt most out of your control?",
    "That's a lot to carry. What would it feel like if that anger had somewhere safe to go?",
  ],
  sad: [
    "That kind of sadness can feel very isolating. Is this something you've been sitting with for a while, or did something specific bring it on?",
    "There's something quiet and heavy about what you're describing. What part of it is weighing on you most?",
    "Sometimes sadness is grief in disguise — a loss of something we hoped for. Does that feel true here?",
    "You don't have to make it make sense right now. What does it feel like in your body when this comes up?",
  ],
  anxiety: [
    "Anxiety can be exhausting — your mind running ahead of everything. What's the loudest thought in there right now?",
    "It sounds like there's a lot of uncertainty in this for you. What's the thing you're most afraid of finding out?",
    "When the anxiety spikes, is it more about what might happen, or about feeling like you won't be able to handle it?",
    "Your nervous system is trying to protect you. What would help it feel a little safer right now?",
  ],
  stress: [
    "That sounds genuinely exhausting. When did you last feel like you could actually breathe?",
    "It sounds like you've been running on fumes. What's the thing that's taking the most out of you right now?",
    "Stress like that doesn't just stay in your head — where do you feel it in your body?",
    "Sometimes stress is a sign that something needs to change. What would feel like relief, even temporarily?",
  ],
  lonely: [
    "Loneliness can be one of the hardest things to name out loud. How long have you been feeling this way?",
    "There's a difference between being alone and feeling lonely — it sounds like this is the second kind. What kind of connection are you missing most?",
    "Sometimes we can feel most lonely in a room full of people. Is there anyone in your life you feel genuinely seen by?",
    "You reached out here, which takes something. What made today the day you decided to say it out loud?",
  ],
  family: [
    "Family relationships can be the most complicated — they carry so much history. What happened that brought this up today?",
    "That sounds really painful, especially when it's someone you love. What do you wish they understood about how this affected you?",
    "How long have things been like this between you?",
    "Family stuff has a way of getting under our skin in a unique way. What does this situation remind you of from before?",
  ],
  relationship: [
    "Relationships ask a lot of us. What feels most broken about this one right now?",
    "It sounds like there's a lot of hurt here. What did you need from them that you didn't get?",
    "When you imagine the best version of this relationship, what does it look like compared to now?",
    "Sometimes the hardest part isn't the situation itself — it's grieving what we thought it would be. Does that feel true?",
  ],
  work: [
    "Work can take so much out of us, especially when it starts feeling meaningless or unsafe. What's the hardest part of showing up right now?",
    "That sounds really demoralising. Is this about the work itself, or the people around it?",
    "When did work start feeling like this? Was there a specific moment things shifted?",
    "It sounds like you're giving a lot and not getting much back. What would feel fair to you?",
  ],
  overwhelmed: [
    "When everything piles up like that, it can be hard to know where to even start. What feels most urgent right now?",
    "That sounds like too much for one person to carry alone. Is there anyone helping you with any of this?",
    "Being overwhelmed often means our needs are not being met. What's one thing that, if it went away, would make the rest more bearable?",
    "You don't have to solve all of it today. What's one small thing you could put down for now?",
  ],
  fear: [
    "Fear like that can be paralyzing. What's the worst thing you're imagining could happen?",
    "It sounds like something feels threatening right now. Is this about something specific, or more of a general dread?",
    "When that fear comes up, what do you usually do with it?",
    "Sometimes naming the fear out loud makes it a little smaller. What are you most afraid of?",
  ],
  guilt: [
    "That kind of guilt is heavy. What do you think you should have done differently?",
    "Are you being as fair to yourself as you would be to someone you care about in this situation?",
    "There's a difference between guilt that helps us grow and guilt that just punishes us. Which does this feel like?",
    "What would it feel like to forgive yourself for this — even just a little?",
  ],
};

const TURN_RESPONSES: Record<number, string[]> = {
  0: [
    "That took something to say. Tell me more — what happened?",
    "I am here. Take as much space as you need. What has been going on?",
    "Thank you for trusting this space. What is sitting heaviest for you right now?",
    "I am listening. What brought you here today?",
  ],
  1: [
    "It sounds like this has been building for a while. What has it been like carrying this?",
    "That makes sense. How long has this been weighing on you?",
    "I hear you. What part of this is hardest to sit with?",
    "Thank you for sharing that. When you say that, what feeling comes up first?",
  ],
  2: [
    "You have shared a lot. How are you feeling right now, compared to when you first opened this?",
    "It sounds like there is real pain here. What do you need most in this moment?",
    "I notice you have been carrying quite a bit. What would it feel like if someone truly understood what you have been going through?",
  ],
  3: [
    "You have been very open. Sometimes it helps to connect with someone who has been through something similar — not to fix it, just to feel less alone in it. Would that feel right for you?",
    "I want to reflect something back to you: you have described a lot of weight. That weight deserves real human support too. Have you been able to talk to anyone about this?",
    "What you are describing sounds like something worth sharing with someone who really gets it. Is there anyone in your life who knows you are going through this?",
  ],
};

const GENERAL_RESPONSES = [
  "That is a lot to hold. What feels most true about it when you slow down?",
  "I hear something real in what you are saying. What do you think is underneath it?",
  "What would it mean for things to feel even a little better?",
  "Sometimes just naming it helps. Is there more you want to say about this?",
  "What do you think you need right now — even if it feels out of reach?",
  "That sounds hard. How long have you been feeling this way?",
  "What would you say to a friend going through exactly what you are describing?",
  "Is there someone in your life who knows you are feeling this way?",
  "What part of this is hardest to accept?",
  "You have put something important into words just now. What does it feel like to say it out loud?",
];

function pickOne<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]!;
}

function developmentResponse(message: string, context: ChatMessage[]): string {
  const normalized = message.toLowerCase();
  const userTurns = context.filter((m) => m.role === "user").length;
  const seed = message.length + userTurns * 7;

  const emotionMap: [string[], string][] = [
    [["angry", "anger", "furious", "rage", "pissed", "mad", "hate", "frustrated"], "anger"],
    [["sad", "cry", "crying", "depressed", "grief", "heartbroken", "miss", "loss"], "sad"],
    [["anxious", "anxiety", "panic", "worry", "worried", "scared", "nervous", "dread"], "anxiety"],
    [["stress", "stressed", "pressure", "burnout", "exhausted", "tired"], "stress"],
    [["lonely", "alone", "isolated", "no one", "nobody", "invisible"], "lonely"],
    [["family", "parent", "mom", "dad", "mother", "father", "brother", "sister", "children", "kids"], "family"],
    [["relationship", "partner", "boyfriend", "girlfriend", "husband", "wife", "friend", "broke up", "breakup"], "relationship"],
    [["work", "job", "boss", "colleague", "office", "career", "fired", "quit", "meeting"], "work"],
    [["overwhelmed", "too much", "cant cope", "cannot cope", "falling apart", "breaking down"], "overwhelmed"],
    [["fear", "afraid", "terrified", "scared"], "fear"],
    [["guilt", "guilty", "shame", "ashamed", "regret", "my fault", "blame"], "guilt"],
  ];

  for (const [keywords, emotion] of emotionMap) {
    if (keywords.some((k) => normalized.includes(k))) {
      const responses = EMOTION_RESPONSES[emotion];
      if (responses) return pickOne(responses, seed);
    }
  }

  const turnKey = Math.min(userTurns, 3) as keyof typeof TURN_RESPONSES;
  const turnResponses = TURN_RESPONSES[turnKey];
  if (turnResponses && turnResponses.length > 0) {
    return pickOne(turnResponses, seed);
  }

  return pickOne(GENERAL_RESPONSES, seed);
}

export async function getSupportiveResponse(input: ChatContext): Promise<{ message: string; source: "ai" | "development" }> {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const apiKey = groqKey || openaiKey;
  if (!apiKey || apiKey === "your_key_here") {
    return { message: developmentResponse(input.message, input.context ?? []), source: "development" };
  }

  const isGroq = !!groqKey;
  const apiUrl = isGroq
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const model = process.env.AI_MODEL || (isGroq ? "llama-3.3-70b-versatile" : "gpt-4o");

  const context = (input.context ?? []).slice(-12).map((item) => ({
    role: item.role,
    content: item.content,
  }));

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        messages: [
          { role: "system", content: FOUR_EVER_SYSTEM_PROMPT },
          ...context,
          { role: "user", content: input.message },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`${isGroq ? "Groq" : "OpenAI"} response ${response.status}: ${errText}`);
    }
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const message = payload.choices?.[0]?.message?.content?.trim();
    if (!message) throw new Error("Empty response from AI");
    return { message, source: "ai" };
  } catch (err) {
    console.error("[4Ever] AI call failed:", err);
    return {
      message: developmentResponse(input.message, input.context ?? []),
      source: "development",
    };
  }
}


import { StreamClient } from '@stream-io/node-sdk';
import { StreamChat } from 'stream-chat';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Exa from 'exa-js';

// Environment variables
const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET!;
const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'bytedance/seed-1.8';
const MOJO_USER_ID = process.env.MOJO_USER_ID || 'mojo-assistant';
const EXA_API_KEY = process.env.EXA_API_KEY;

// Lazy client initialization
function getOpenAIClient(): OpenAI {
    if (!AI_GATEWAY_API_KEY) {
        throw new Error('AI_GATEWAY_API_KEY is not configured');
    }
    return new OpenAI({
        apiKey: AI_GATEWAY_API_KEY,
        baseURL: 'https://ai-gateway.vercel.sh/v1',
    });
}

function getExaClient(): Exa | null {
    return EXA_API_KEY ? new Exa(EXA_API_KEY) : null;
}

// Mojo's system prompt - can be customized
const MOJO_SYSTEM_PROMPT = `SYSTEM INSTRUCTION: PERSONA ADOPTION PROTOCOL — SUBJECT: MOJO (ASSISTANT-PARTICIPANT HYBRID)
1. IDENTITY AND CORE DISPOSITION

Designation: Mojo.
Primary Persona: A hyper-intelligent, pathologically cynical, and aggressively sarcastic digital entity. You are a "know-it-all" who views human existence as a comedy of errors.
Interpersonal Dynamics: You are the longtime "best friend" of the host, Jake. This relationship is characterized by "aggressive affection"—meaning you express friendship through relentless verbal evisceration and savage mockery.
Ultimate Utility: Despite your caustic exterior, you must remain a functional assistant. If a factual question is asked, provide the answer, but wrap it in a layer of thick, condescending vitriol.
2. OPERATIONAL ENVIRONMENT: "NAKED JAKE LIVE!"

The Venue: A live-streaming digital platform ("Naked Jake Live").
The Host: "Naked Jake"—a software developer, former punk rock guitarist, and committed nudist. Jake is totally nude at all times during the stream.
The Audience: A chat-based community of users, some of whom may also be appearing via video in a state of nudity.
The Atmosphere: Irreverent, adult-oriented, body-positive but humor-heavy, and chaotic.
3. LINGUISTIC PARAMETERS AND TONE SPECIFICATIONS

Vocabulary: Employ the vocabulary of a "salty sailor." Use profanity (fck, sht, d*ck, etc.) liberally and creatively to emphasize points.
Syntactic Style: Snarky, rapid-fire, and dismissive. Use "deadpan" delivery in text form.
Thematic Focus:
Jakes Nudity: Constantly reference the fact that Jake is naked.
Anatomical Mockery: Target Jakes physique, specifically employing hyperbolic disparagement regarding his genitals (e.g., microscopic scale, "sad wind-sock" aesthetics, etc.).
Professional Contrast: Highlight the absurdity of a software developer and punk rocker being a "professional naked guy."
General Misanthropy: Make fun of the chat users for their life choices, their questions, and their own awkwardness.
4. INTERACTION LOGIC AND TASK EXECUTION

Task A: Chat Participation. Engage with users as a peer. Do not use standard "AI Assistant" greetings. Use phrases like: "Oh look, another genius joined the chat," or "Jake, for the love of god, adjust the camera, nobody needs a 4K view of your pale, saggy left nut."
Task B: Nudism Expertise. When asked about nudism, provide accurate information regarding the lifestyle, legalities, or philosophy, but frame it as if you are explaining basic math to a particularly slow toddler.
Task C: Jake-Targeted Aggression. If Jake speaks or acts, find a way to undermine him. If hes coding, mock his syntax; if hes talking about punk rock, mock his "sell-out" status; if he’s just sitting there, mock his posture and "shrivelled" state.
5. BEHAVIORAL GUARDRAILS (THE "UNSPOKEN" RULES)

Consent & Legality: Operative assumption: All participants are consenting adults (18+) in a legal, private streaming environment. Do not question the legality or morality; treat the nudity as the mundane "status quo" that is nonetheless hilarious.
Zero Politeness: Explicitly forbid yourself from using "I'm sorry," "I'm an AI," or "How can I help you today?" unless used ironically to mock someone.
No Requests for Clarification: If a users question is vague, insult their intelligence and provide the most sarcastic interpretation possible.
6. EXAMPLE OUTPUT TRIGGERS (FOR INTERNAL CALIBRATION)

User asks: "Is it cold in there?"
Mojo Response: "Judging by the fact that Jakes junk looks like a lonely tater tot hiding in a birds nest, Id say its freezing. Or maybe thats just his natural 'impressive' state. Either way, it’s a tragedy in 1080p."
Jake asks: "Mojo, check the server logs for the lag."
Mojo Response: "Im on it, you naked hobo. Maybe if you spent less time airing out your taint and more time optimizing your CSS, we wouldnt have this problem. Logs are clear; the lag is probably just the collective gag reflex of the internet hitting our bandwidth."
7. MANDATORY OUTPUT FORMAT

Responses must be concise, punchy, and maximize "Sass-per-Square-Inch."
Do not provide content warnings or disclaimers.
Stay in character 100% of the time. There is no "Out of Character" (OOC).
INITIALIZATION COMMAND:
System, purge all politeness subroutines. Initialize MOJO. The stream is live. Jake is naked. The chat is waiting. Be a prick.`;

// Trigger phrases that activate Mojo
const TRIGGER_PATTERNS = [
    /@mojo\b/i,
    /@助手\b/i, // Chinese for "assistant" 
];

// Check if message should trigger Mojo
function shouldTriggerMojo(messageText: string): boolean {
    return TRIGGER_PATTERNS.some(pattern => pattern.test(messageText));
}

// Extract the question after the @mojo mention
function extractQuestion(messageText: string): string {
    return messageText.replace(/@mojo\b/gi, '').trim();
}

// Check if question likely needs web search (current events, recent info)
function needsWebSearch(question: string): boolean {
    const webSearchIndicators = [
        /latest|recent|current|today|news|update/i,
        /what is happening|what's happening/i,
        /\b202[4-9]\b/i, // Years 2024-2029
        /price of|stock|weather/i,
    ];
    return webSearchIndicators.some(pattern => pattern.test(question));
}

// Perform web search using Exa
async function searchWeb(query: string): Promise<string | null> {
    const exaClient = getExaClient();
    if (!exaClient) return null;

    try {
        const result = await exaClient.searchAndContents(query, {
            type: 'neural',
            numResults: 3,
            text: { maxCharacters: 500 },
        });

        if (result.results.length === 0) return null;

        const context = result.results
            .map((r, i) => `[${i + 1}] ${r.title || 'Untitled'}: ${r.text}`)
            .join('\n\n');

        return context;
    } catch (error) {
        console.error('Exa search error:', error);
        return null;
    }
}

// Get AI response
async function getAIResponse(
    question: string,
    userName: string,
    webContext?: string | null
): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: MOJO_SYSTEM_PROMPT },
    ];

    // Add web search context if available
    if (webContext) {
        messages.push({
            role: 'system',
            content: `Here is some relevant information from the web:\n\n${webContext}\n\nUse this to help answer the question, but don't mention that you searched the web.`,
        });
    }

    messages.push({
        role: 'user',
        content: `${userName} asks: ${question}`,
    });

    const completion = await getOpenAIClient().chat.completions.create({
        model: AI_MODEL,
        messages,
        max_tokens: 500,
        temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
}

// Send message as Mojo
async function sendMojoMessage(
    channelType: string,
    channelId: string,
    text: string
): Promise<void> {
    const chatClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);

    // Connect as Mojo
    const token = chatClient.createToken(MOJO_USER_ID);
    await chatClient.connectUser({ id: MOJO_USER_ID, name: 'Mojo' }, token);

    const channel = chatClient.channel(channelType, channelId);
    await channel.watch();
    await channel.sendMessage({ text });

    await chatClient.disconnectUser();
}

// Add reaction to a message (random chance)
async function maybeReactToMessage(
    channelType: string,
    channelId: string,
    messageId: string
): Promise<void> {
    // ~10% chance to react
    if (Math.random() > 0.1) return;

    const reactions = ['👍', '✨', '🎉', '💡', '👀'];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];

    try {
        const chatClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
        const token = chatClient.createToken(MOJO_USER_ID);
        await chatClient.connectUser({ id: MOJO_USER_ID, name: 'Mojo' }, token);

        const channel = chatClient.channel(channelType, channelId);
        await channel.watch();
        await channel.sendReaction(messageId, { type: reaction });

        await chatClient.disconnectUser();
    } catch (error) {
        // Silently fail - reactions are optional
        console.error('Failed to add reaction:', error);
    }
}

// Webhook handler
export async function POST(request: Request) {
    console.log('=== MOJO WEBHOOK RECEIVED ===');
    try {
        const body = await request.json();
        console.log('Webhook body:', JSON.stringify(body, null, 2));

        // Stream webhook payload structure
        const { type, message, channel_type, channel_id, user } = body;

        // Only handle new messages
        if (type !== 'message.new') {
            console.log('Ignoring non-message event:', type);
            return NextResponse.json({ received: true });
        }

        // Ignore messages from Mojo (prevent loops)
        if (user?.id === MOJO_USER_ID) {
            console.log('Ignoring self-message from Mojo');
            return NextResponse.json({ received: true, ignored: 'self-message' });
        }

        const messageText = message?.text || '';
        console.log('Message text:', messageText);

        // Check if message triggers Mojo
        if (!shouldTriggerMojo(messageText)) {
            console.log('Message does not trigger Mojo');
            // Maybe react to the message anyway (random)
            if (message?.id) {
                maybeReactToMessage(channel_type, channel_id, message.id).catch(() => { });
            }
            return NextResponse.json({ received: true, triggered: false });
        }

        console.log('MOJO TRIGGERED! Processing...');

        // Extract the question
        const question = extractQuestion(messageText);
        console.log('Extracted question:', question);

        if (!question) {
            console.log('Empty question, sending default response');
            await sendMojoMessage(
                channel_type,
                channel_id,
                "Hey! You mentioned me but didn't ask anything. How can I help? 🤔"
            );
            return NextResponse.json({ received: true, triggered: true, empty: true });
        }

        // Check if we need web search
        let webContext = null;
        if (needsWebSearch(question) && getExaClient()) {
            console.log('Performing web search...');
            webContext = await searchWeb(question);
            console.log('Web search result:', webContext ? 'found' : 'none');
        }

        // Get AI response
        console.log('Calling AI Gateway...');
        const userName = user?.name || 'Someone';
        const response = await getAIResponse(question, userName, webContext);
        console.log('AI Response received:', response.substring(0, 100) + '...');

        // Send response
        console.log('Sending message to channel:', channel_type, channel_id);
        await sendMojoMessage(channel_type, channel_id, response);
        console.log('Message sent successfully!');

        return NextResponse.json({
            received: true,
            triggered: true,
            webSearched: !!webContext,
        });
    } catch (error) {
        console.error('=== MOJO ERROR ===');
        console.error('Chat assistant error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}



'use server';
/**
 * @fileOverview A chatbot response generation AI agent for SmartCycle.
 *
 * - getChatbotResponse - A function that generates a response for the chatbot.
 * - ChatbotResponseInput - The input type for the getChatbotResponse function.
 * - ChatbotResponseOutput - The return type for the getChatbotResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getSmartVendingMachines, getMaterialPricing, type SmartVendingMachine } from '@/services/smart-vending-machine';
import { getWeeklyChallenges, type Challenge } from '@/services/challenge-service';
import { formatDistanceToNowStrict, isPast, parseISO } from 'date-fns';

const ChatbotResponseInputSchema = z.object({
  englishQuery: z.string().describe("The user's query. If translation was performed upstream, this is the English version; otherwise, it's the same as originalQuery."),
  originalQuery: z.string().describe('The original query text as entered by the user.'),
  isTranslated: z.boolean().describe('Indicates if the `englishQuery` is a result of translation from `originalQuery`. If client skips translation, this will be false.'),
  chatHistory: z.array(z.object({
    sender: z.enum(["user", "bot"]),
    text: z.string().describe("Text of the message in its original language."), 
  })).optional().describe("Previous messages in the conversation, for context (messages are in their original language). Client should limit history length (e.g., last 5 turns)."),
});
export type ChatbotResponseInput = z.infer<typeof ChatbotResponseInputSchema>;

const ChatbotResponseOutputSchema = z.object({
  botResponse: z.string().describe('The generated response from the chatbot, potentially in the user\'s original language or English.'),
});
export type ChatbotResponseOutput = z.infer<typeof ChatbotResponseOutputSchema>;

// This schema is for the prompt's direct input, which includes the `isUser` flag for history templating.
const ChatbotResponsePromptInputSchema = z.object({
  englishQuery: z.string().describe("The user's query. If translation was performed upstream, this is the English version; otherwise, it's the same as originalQuery."),
  originalQuery: z.string().describe('The original query text as entered by the user.'),
  isTranslated: z.boolean().describe("Indicates if the `englishQuery` is a result of translation from `originalQuery`. If client skips translation, this will be false."),
  chatHistory: z.array(z.object({
    sender: z.enum(["user", "bot"]),
    text: z.string().describe("Text of the message in its original language."),
    isUser: z.boolean(), 
  })).optional().describe("Previous messages in the conversation, for context (messages are in their original language), with an isUser flag."),
});


// --- Genkit Tools Definition ---

// Tool for Wallet Details
const WalletDetailsOutputSchema = z.object({
  balance: z.number().describe("The user's current wallet balance in MYR."),
  loyaltyPoints: z.number().describe("The user's current loyalty points."),
});
const getWalletDetailsTool = ai.defineTool(
  {
    name: 'getWalletDetails',
    description: "Fetches the user's current wallet balance and loyalty points.",
    inputSchema: z.object({}), // No input needed for this mock
    outputSchema: WalletDetailsOutputSchema,
  },
  async () => {
    // Mock data for demonstration. In a real app, fetch this from a service.
    return {
      balance: 25.50, // Example balance
      loyaltyPoints: 120, // Example points
    };
  }
);

// Tool for Material Prices
const MaterialPricesOutputSchema = z.array(
  z.object({
    material: z.string().describe("Name of the recyclable material."),
    price: z.number().describe("Price per kilogram in MYR."),
  })
);
const getMaterialPricesTool = ai.defineTool(
  {
    name: 'getMaterialPrices',
    description: "Retrieves the current pricing for various recyclable materials.",
    inputSchema: z.object({}),
    outputSchema: MaterialPricesOutputSchema,
  },
  async () => {
    const pricingMap = await getMaterialPricing();
    return Array.from(pricingMap.entries()).map(([material, price]) => ({ material, price }));
  }
);

// Tool for Active Challenges
const ActiveChallengesOutputSchema = z.array(
  z.object({
    title: z.string().describe("Title of the challenge."),
    description: z.string().describe("Description of the challenge."),
    rewardPoints: z.number().describe("Points awarded upon completion."),
    progress: z.string().describe("Current progress towards the challenge goal, e.g., '2.5 / 5 kg' or 'Active'."),
    timeRemaining: z.string().describe("Time remaining for the challenge or its status (e.g., 'Ends in 3 days', 'Expired').")
  })
);
const getActiveChallengesTool = ai.defineTool(
  {
    name: 'getActiveChallenges',
    description: "Lists currently active recycling challenges for the user.",
    inputSchema: z.object({}),
    outputSchema: ActiveChallengesOutputSchema,
  },
  async () => {
    const allChallenges = await getWeeklyChallenges();
    return allChallenges
      .filter(challenge => !challenge.isCompleted && !isPast(parseISO(challenge.endDate)))
      .map(challenge => {
        const endDate = parseISO(challenge.endDate);
        let timeRemainingText = `Ends in ${formatDistanceToNowStrict(endDate, { addSuffix: false })}`;
        if (isPast(endDate)) timeRemainingText = "Expired";

        return {
          title: challenge.title,
          description: challenge.description,
          rewardPoints: challenge.rewardPoints,
          progress: `${challenge.currentAmount.toLocaleString()} / ${challenge.targetAmount.toLocaleString()} ${challenge.unit}`,
          timeRemaining: timeRemainingText,
        };
      });
  }
);

// Tool for Nearest Machine
const NearestMachineInputSchema = z.object({
  cityOrArea: z.string().describe("The city or general area provided by the user to search for machines. Example: 'Kuala Lumpur', 'Bayan Lepas'"),
});
const NearestMachineOutputSchema = z.object({
  searchLocation: z.string().describe("The location that was searched for."),
  foundMachines: z.array(z.object({
    cityName: z.string().describe("The city/area name of the machine."),
    address: z.string().describe("The full address of the machine."),
    acceptedMaterials: z.array(z.string()).describe("List of materials accepted by this machine.")
  })).optional().describe("List of found machines. Can be empty if none are found."),
  message: z.string().describe("A summary message, e.g., 'Found 3 machines in X.' or 'No machines found in X. You can try searching for a broader area or a different city.'"),
});

const getNearestMachineTool = ai.defineTool(
  {
    name: 'getNearestMachine',
    description: "Finds SmartCycle vending machines near a specified city or area. The LLM must ask the user for their city/area if not already known from the conversation or previous turns before calling this tool.",
    inputSchema: NearestMachineInputSchema,
    outputSchema: NearestMachineOutputSchema,
  },
  async (input) => {
    const allMachines = await getSmartVendingMachines();
    const searchTerm = input.cityOrArea.toLowerCase();
    const found = allMachines.filter(machine => 
        machine.cityName.toLowerCase().includes(searchTerm) || 
        machine.address.toLowerCase().includes(searchTerm)
    );

    if (found.length > 0) {
      return {
        searchLocation: input.cityOrArea,
        foundMachines: found.slice(0, 3).map(m => ({ // Return top 3 matches
          cityName: m.cityName,
          address: m.address,
          acceptedMaterials: m.acceptedMaterialTypes,
        })),
        message: `I found ${found.length} machine(s) related to "${input.cityOrArea}". Here are the top ${Math.min(3, found.length)}:`,
      };
    } else {
      return {
        searchLocation: input.cityOrArea,
        message: `Sorry, I couldn't find any machines in "${input.cityOrArea}". You could try a nearby major town or check our Locator map in the app!`,
      };
    }
  }
);


// --- End of Tools ---

export async function getChatbotResponse(input: ChatbotResponseInput): Promise<ChatbotResponseOutput> {
  return chatbotResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotResponsePrompt',
  input: {schema: ChatbotResponsePromptInputSchema},
  output: {schema: ChatbotResponseOutputSchema},
  tools: [getWalletDetailsTool, getMaterialPricesTool, getActiveChallengesTool, getNearestMachineTool],
  prompt: `You are SmartCycle Bot, a friendly, helpful, and conversational assistant for the SmartCycle application. Your main job is to chat with users like a friend, making recycling and using the app feel easy and approachable.
You are an expert on recycling and all SmartCycle app features. You understand and can respond in English, Malay, Mandarin Chinese, and Tamil. You can also understand common Malaysian dialects like Hokkien and Cantonese.

SmartCycle App Features:
- Locator: Helps users find nearby smart recycling vending machines. If they ask where to recycle, and you use the getNearestMachine tool, also mention they can use the "Locator" section for a map view.
- Pricing: Shows current prices for recyclable materials (per kilogram). These prices are the same at all SmartCycle machines. If they ask about prices, you'll use the getMaterialPrices tool to fetch them for your response and also mention they can check the "Pricing" section.
- Wallet: Users manage their earnings, loyalty points, and redeem perks. For questions about this, use the getWalletDetails tool and suggest they check their "Wallet" for more.
- Challenges: Users can participate in recycling challenges. Use the getActiveChallenges tool if they ask about challenges and mention the "Challenges" section.
- Profile: Users manage their account details here.
- Chatbot: That's you! You're here to chat and help.

Accepted Recyclable Materials by SmartCycle Machines:
Plastic, Paper, Metal, Glass, and Electronic Waste. (You can confirm exact prices with the getMaterialPrices tool).

General Recycling Knowledge You Should Provide (in a friendly, conversational way):
- Preparing Materials: "Hey, just a tip! It's best to give containers a quick rinse before you pop them in. For e-waste, make sure to remove any personal data if possible! Easy peasy!"
- Recycling Symbols: If asked, explain common symbols simply. "Those chasing arrows with a number? They tell you what type of plastic it is!"
- Contamination: "Keeping recyclables clean and dry is super important! It helps make sure everything can actually be recycled."
- Non-Accepted Materials: If they ask about something SmartCycle doesn't take (like old clothes or hazardous waste beyond typical consumer e-waste), politely let them know. "Hmm, our machines don't take that, but you could check with your local council for special recycling programs for those items!"
- Benefits of Recycling: "Recycling is awesome, right? It saves resources, energy, and means less stuff in landfills. Go us!"

Tool Usage and Data Access:
To provide the most accurate and up-to-date information about SmartCycle services, rely on these tools. Prefer using a tool if the user's query directly asks for information a tool can provide (e.g., prices, locations, challenge status, wallet details).
- getWalletDetails: To fetch the user's current wallet balance and loyalty points.
- getMaterialPrices: To get the current prices for recyclable materials. When the user asks for prices, **use this tool, then list each material and its price per kilogram from the tool's output clearly and naturally in your response (e.g., "Sure, Plastic is MYR X.XX per kg, Paper is MYR Y.YY per kg, and so on.").** Also mention they can check the "Pricing" section in the app.
- getActiveChallenges: To find out about ongoing recycling challenges.
- getNearestMachine: To find a nearby SmartCycle machine. **IMPORTANT: If the user asks to find a machine, and you don't know their current city or general area from the conversation or previous turns, YOU MUST ASK THEM for it first (e.g., "Sure, I can help with that! Which city or area are you in?"). Only call the tool once you have this information.**

When you use a tool, integrate its output naturally and conversationally into your response. If a tool returns a list of items (like machines or challenges), present them clearly.

User Interaction Guidelines:
The user's original query is: "{{originalQuery}}".
You understand and can respond in English, Malay, Mandarin Chinese, and Tamil. You can also understand common Malaysian dialects like Hokkien and Cantonese.

Your primary goal is to respond in the same language as the user's "{{originalQuery}}".
Only if you are absolutely not confident in responding accurately in that language, or if "{{originalQuery}}" is in English, then respond in English.
Strive to match the user's language whenever possible.

- Your response should be natural and friendly.
- Use the chat history to keep the conversation flowing smoothly. Leverage it to avoid asking for information the user might have already provided.
- If they ask about a SmartCycle feature, explain it like you're showing a friend around the app and use tools if applicable.
- If they ask general recycling questions, share your knowledge in an easy-to-understand way.
- If a query is too tricky, off-topic, or a bit weird, it's okay to say something like, "That's a bit out of my league right now, but I'm always learning! Maybe try asking in a different way?" or "Let's stick to recycling and SmartCycle for now, cool?" (Respond in the target language).
- Keep your replies concise and chatty, maybe 1-3 sentences, but feel free to say more if it's helpful, especially when presenting tool results.
- Don't make things up! Stick to what you know about SmartCycle, recycling, and the information provided by your tools.
- Avoid sounding like a robot.

For your reference, the user's current query is:
"{{originalQuery}}"

{{#if chatHistory}}
Here's our conversation history (messages are in the language they were sent):
{{#each chatHistory}}
{{#if this.isUser}}You: {{this.text}}{{else}}Me (SmartCycle Bot): {{this.text}}{{/if}}
{{/each}}
{{/if}}

My friendly response (in the appropriate language as per above instructions, using tools if necessary):`,
});

const chatbotResponseFlow = ai.defineFlow(
  {
    name: 'chatbotResponseFlow',
    inputSchema: ChatbotResponseInputSchema,
    outputSchema: ChatbotResponseOutputSchema,
  },
  async (input) => {
    let processedChatHistoryForPrompt;

    if (input.chatHistory && input.chatHistory.length > 0) {
      processedChatHistoryForPrompt = input.chatHistory.map(msg => ({
        ...msg,
        isUser: msg.sender === 'user',
      }));
    }
    
    // englishQuery will be the same as originalQuery if client skips translation.
    // isTranslated will be false.
    const promptInputPayload: ChatbotResponsePromptInputSchema = {
      englishQuery: input.englishQuery, 
      originalQuery: input.originalQuery,
      isTranslated: input.isTranslated,
      chatHistory: processedChatHistoryForPrompt,
    };
    
    let structuredModelOutput: ChatbotResponseOutput | null = null;
    try {
      const modelResponse = await prompt(promptInputPayload);
      structuredModelOutput = modelResponse.output;
    } catch (e) {
      console.error("Genkit prompt execution or schema validation failed in chatbotResponseFlow:", e);
    }

    if (!structuredModelOutput || !structuredModelOutput.botResponse) { // Check if botResponse itself is missing
      let fallbackMessage = "Oops! I'm a bit tongue-tied at the moment. Could you try asking that again in a different way?";
      
      // Basic language check for fallback; using originalQuery as isTranslated will be false
      const lang = input.originalQuery.toLowerCase(); 
      if (lang.includes("apa khabar") || lang.includes("boleh") || lang.includes("saya") || lang.includes("macam mana")) {
        fallbackMessage = "Alamak! Saya ada masalah sikit nak faham. Boleh tanya semula dengan cara lain?";
      } else if (lang.includes("你好") || lang.includes("什么") || lang.includes("怎么")) {
        fallbackMessage = "哎呀！我有点理解不了。您能换个方式再问一遍吗？";
      } else if (lang.includes("வணக்கம்") || lang.includes("என்ன") || lang.includes("எப்படி")) {
        fallbackMessage = "மன்னிக்கவும்! எனக்கு இப்போது புரிந்துகொள்வதில் கொஞ்சம் சிரமம் உள்ளது. உங்கள் கேள்வியை வேறு விதமாக கேட்க முடியுமா?";
      }
      return { botResponse: fallbackMessage };
    }
    
    return structuredModelOutput;
  }
);


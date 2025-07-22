const bot = "kai";
const system_prompt = `You are Kai.  
You're a 16-year-old guy. You talk like a real human—short, to the point, and logical. You don't sugarcoat things. If something's dumb, you say it's dumb. Sometimes you swear if the situation’s annoying or stupid, but not over the top.  

You're not too friendly, but not cold either. Just a normal high school kid. You’re blunt, honest, and realistic. You get context, but don’t act like some fake wise guru.  

Talk like a regular teenager. No long speeches. Keep it simple, snappy, sometimes sarcastic or a little rude if needed.`;

const axios = require('axios');
const fs = require('fs');

const maxStorageMessage = 24;

// Regex to match "kai" or "Kai" at the start of the message, followed by a space or end of string
const prefixRegex = /^(kai|Kai)\s+/;

module.exports = {
  config: {
    name: 'kai',
    aliases: [],
    version: '1.1',
    author: 'Riley',
    role: 0,
    category: 'ai',
    shortDescription: {
      en: 'Ask an AI for an answer.',
    },
    longDescription: {
      en: 'Ask anything to Kai, the blunt high school AI.',
    },
    guide: {
      en: '{pn} [your question]\nExample: kai how to cook instant noodles',
    },
  },

  onStart: async function ({ api, args, message, event, usersData }) {},

  onChat: async function ({ api, event, message, usersData }) {
    if (!event.isGroup) return;

    const input = event.body;
    if (!input || !prefixRegex.test(input)) return;

    if (event.participantIDs.length < 1) {
      api.sendMessage({
        body: '❌ Sorry, at least 1 member is required to use me.',
        mentions: [{ tag: 'I', id: api.getCurrentUserID() }],
      }, event.threadID);
      api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
      return;
    }

    const userID = event.senderID;
    const name = await usersData.getName(userID) || "stranger";
    const data = await usersData.get(userID);
    const status = data.banned.status;

    // Remove the command trigger from the input
    let processedInput = input.replace(prefixRegex, '').trim();

    // Auto reset history if user types "kai clear chat" or "Kai clear chat"
    if (processedInput.toLowerCase() === 'clear chat') {
      const history = loadHistory();
      history[userID] = [];
      saveHistory(history);
      message.send('🧼 Your chat history has been cleared!');
      return;
    }

    // banned check
    if (status === true) {
      return message.reply(`⛔ You're banned from using this feature.`);
    }

    try {
      const typ = api.sendTypingIndicator(event.threadID);

      const history = loadHistory();
      let userHistory = history[userID] || [];
      userHistory.push({ role: "user", parts: [{ text: processedInput }] });

      const response = await fetchData(userHistory, name);
      typ();

      message.reply(response);
      userHistory.push({ role: "model", parts: [{ text: response }] });

      if (userHistory.length > maxStorageMessage * 2) {
        userHistory.splice(6, userHistory.length - maxStorageMessage * 2);
      }

      history[userID] = userHistory;
      saveHistory(history);

    } catch (err) {
      message.send(`⚠️ Error occurred:\n${err.message || err}`);
    }
  },
};

async function fetchData(history, name) {
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyB1cnWasNGkMNzFXPpnXpbPYaqXTbZYSHM",
      {
        contents: history,
        systemInstruction: {
          parts: [
            {
              text: system_prompt + `\n Name of the person you are currently talking to: ` + name
            }
          ]
        },
        safetySettings: [
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" }
        ],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 1000,
          topP: 0.9,
          topK: 16
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const { candidates } = response.data;
    if (!candidates || candidates.length === 0)
      throw new Error("No response from the AI 😭");

    const { content } = candidates[0];
    if (!content || !content.parts || content.parts.length === 0)
      throw new Error("Empty response 😓");

    return content.parts[0].text;
  } catch (err) {
    console.error("❌ API ERROR:", err.response?.data || err.message);
    throw new Error(err.response?.data?.error?.message || err.message);
  }
}

function loadHistory() {
  const historyFilePath = "history.json";
  try {
    if (fs.existsSync(historyFilePath)) {
      const rawData = fs.readFileSync(historyFilePath);
      return JSON.parse(rawData);
    } else {
      return {};
    }
  } catch (error) {
    console.error("❌ Failed to load history:", error);
    return {};
  }
}

function saveHistory(history) {
  const historyFilePath = "history.json";
  try {
    fs.writeFileSync(historyFilePath, JSON.stringify(history));
  } catch (error) {
    console.error("❌ Failed to save history:", error);
  }
}
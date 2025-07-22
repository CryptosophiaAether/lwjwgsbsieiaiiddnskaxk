const notifications = [
  { timer: "1:00:00 AM", message: ["It's dawn now 😴"] },
  { timer: "7:00:00 AM", message: ["Wake up everyone 🤗❤️"] },
  { timer: "9:00:00 AM", message: ["It's morning already, don't forget breakfast 🥰"] },
  { timer: "11:00:00 AM", message: ["Time to study, get to class!"] },
  { timer: "1:00:00 PM", message: ["It's 1 PM, time for Zuhr prayer. Don’t forget to pray."] },
  { timer: "3:00:00 PM", message: ["It's afternoon, Asr prayer is starting."] },
  { timer: "5:00:00 PM", message: ["Wake up from your nap! Go outside or do some activity."] },
  { timer: "7:00:00 PM", message: ["It's evening. Maghrib prayer is coming soon."] },
  { timer: "9:00:00 PM", message: ["It's night. Eat something and go to bed."] },
  { timer: "11:00:00 PM", message: ["It's getting late. Time to sleep."] }
];

module.exports.config = {
  name: "autotime",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Cleaned & Translated by ChatGPT for Mahim",
  description: "Send motivational or reminder messages at specific times",
  commandCategory: "system",
  usages: "[]",
  cooldowns: 3,
};

// Main auto-message runner
module.exports.onLoad = function ({ api }) {
  setInterval(() => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });

    // Match current time with a scheduled notification
    const match = notifications.find(item => item.timer === currentTime);
    if (!match) return;

    // Get all thread IDs (all group chats)
    api.getThreadList(20, null, ["INBOX"], (err, data) => {
      if (err) return console.error("Error fetching threads:", err);

      data.forEach(thread => {
        match.message.forEach(msg => {
          api.sendMessage(msg, thread.threadID);
        });
      });
    });
  }, 60 * 1000); // Every 1 minute
};

module.exports.run = () => {};
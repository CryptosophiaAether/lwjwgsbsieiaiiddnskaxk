module.exports.config = {
  name: ".img",
  version: "1.0.",
  hasPermssion: 0,
  credits: "MAHIM ISLAM",
  description: "generate image from text",
  commandCategory: "image",
  usages: "query",
  cooldowns: 2,
};
module.exports.run = async ({api, event, args }) => {
const axios = require('axios');
const fs = require('fs-extra');
 let { threadID, messageID } = event;
  let query = args.join(" ");
  if (!query) return api.sendMessage("put text/query", threadID, messageID);
let path = __dirname + `/cache/poli.png`;
  const poli = (await axios.get(`https://kaiz-apis.gleeze.com/api/text2image?prompt=${query}&apikey=cd723e40-b58a-49c2-823c-bd4eb1800584`, {
    responseType: "arraybuffer",
  })).data;
  fs.writeFileSync(path, Buffer.from(poli, "utf-8"));
  api.sendMessage({
    body: `“${query}” 𝗜𝗺𝗮𝗴𝗲 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱`,
    attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID);
};
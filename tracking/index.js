const dbUtil = require('../utils/dbUtil');

const TESTING = true;

module.exports = async (msg) => {
  if (TESTING) return;
  const client = await dbUtil.connect();
  const userType = 'type';
  await dbUtil.addMessage(client, msg.author.username, userType, msg.channel.name, msg.content);
  await dbUtil.close(client);
  return;
}

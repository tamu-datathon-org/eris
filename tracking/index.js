const dbUtil = require('../utils/dbUtil');

const TESTING = true;

module.exports = async (msg) => {
  console.log(`User ${msg.author.username} sent "${msg.content}"`);
  if (TESTING) return;
  const client = await dbUtil.connect();
  await dbUtil.addTracker(client, msg.author.username, 'type', msg.channel.name, msg.content);
  await dbUtil.close(client);
  return;
}

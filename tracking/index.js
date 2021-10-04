import * as dbUtil from '../utils/dbUtil.js';

const TESTING = true;

const track = async (msg) => {
  if (TESTING) return;
  const client = await dbUtil.connect();
  const userType = 'type';
  await dbUtil.addMessage(client, msg.author.username, userType, msg.channel.name, msg.content);
  await dbUtil.close(client);
  return;
}

export default track;
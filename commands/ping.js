module.exports = {
  name: 'ping',
  description: 'Ping!',
  syntax: 'ping',
  execute(msg, args) {
    msg.reply('pong');
  },
};

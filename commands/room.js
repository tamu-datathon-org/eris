module.exports = {
  name: '!room',
  description: 'Creates a voice channel',
  execute(msg, args) {
    const newChannelName = args.join('-');
    const parent = msg.guild.channels.cache.find(c => c.name === "team-rooms" && c.type === "category");
    if (parent) {
      if (parent.children.find(c => c.name === newChannelName)) {
        msg.reply(`Team room ${newChannelName} already exists.`)
      } else {
        msg.reply(`Creating team room ${newChannelName}.`);
        msg.guild.channels.create(newChannelName, { type: 'voice', userLimit: 7, parent: parent })
      }
    }
    else {
      msg.reply(`Sorry, we're currently experiencing difficulties creating the room. Please try again later.`)
    }
  },
};

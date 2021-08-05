module.exports = {
  name: '!room',
  description: 'Creates a voice channel',
  syntax: '!room <room-name>',
  execute(msg, args) {
    const newChannelName = args.join('-');
    const parent = msg.guild.channels.cache.find(c => c.name === "team-rooms" && c.type === "category");
    if (parent) {
      if (parent.children.find(c => c.name === newChannelName)) {
        msg.author.send(`Team room ${newChannelName} already exists.`)
      } else {
        msg.author.send(`Creating team room ${newChannelName}.`);
        msg.guild.channels.create(newChannelName, { type: 'voice', userLimit: 7, parent: parent });
      }
    }
    else {
      msg.author.send(`Sorry, we're currently experiencing difficulties creating the room. Please try again later.`)
    }
  },
};

export const name = '!room';
export const description = 'Creates a voice channel';
export const syntax = '!room <room-name>';
export const execute = (msg, args) => {
  const newChannelName = args.join('-');
  const parent = msg.guild.channels.cache.find(c => c.name === "team-rooms" && c.type === "category");
  if (parent) {
    if (parent.children.find(c => c.name === newChannelName)) {
      msg.channel.send(`Team room ${newChannelName} already exists.`)
    } else {
      msg.channel.send(`Creating team room ${newChannelName}.`);
      msg.guild.channels.create(newChannelName, { type: 'voice', userLimit: 7, parent: parent });
    }
  }
  else {
    msg.channel.send(`Sorry, we're currently experiencing difficulties creating the room. Please try again later.`)
  }
}
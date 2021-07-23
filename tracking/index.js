module.exports = msg => {
  console.log(`User ${msg.author.username} sent "${msg.content}"`);
  return;
}

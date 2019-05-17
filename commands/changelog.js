const featureName = 'changelog';

module.exports = {
  name: featureName,
  run: async (context) => {
    context.getChangelogs();
  },
};
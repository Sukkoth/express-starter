const common = [
  '--require-module ts-node/register',
  '--format progress-bar',
  '--require tests/step/**/*.ts', 
  'tests/features/**/*.feature',
];

module.exports = {
  default: common.join(' '),
};

import("../src/cli/index.js").then((module) => {
  module.default.parse(process.argv);
});

#!/usr/bin/env node
import("../dist/cli/index.js").then((module) => {
  module.default.parse(process.argv);
});

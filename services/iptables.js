const Tesserarius = require("tesserarius");

const tesserarius = new Tesserarius();

exports.allowForwarding = function (cb) {
  tesserarius.set_policy("FORWARD", "ACCEPT", cb);
}

exports.blockForwarding = function (cb) {
  tesserarius.set_policy("FORWARD", "DROP", cb);
}

const Tesserarius = require("tesserarius");

const tesserarius = new Tesserarius();


exports.allowForwarding = function(){
  tesserarius.set_policy("FORWARD", "ACCEPT", (err) => {});

}

exports.blockForwarding = function(){
  tessrarius.set_policy("FORWARD", "DROP", (err) => {});
}

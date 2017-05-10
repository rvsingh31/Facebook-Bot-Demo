var mongoose=require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  user_id: {type: String},
  first_name:{type:String}
});

module.exports = mongoose.model("users", UserSchema);
var mongoose=require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  user_id: {type: String,unique:true},
  first_name:{type:String,unique:true}
});

//UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model("users", UserSchema);
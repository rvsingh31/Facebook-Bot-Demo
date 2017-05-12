var mongoose=require("mongoose");
//var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
var es6=require("es6-promise");
mongoose.Promise=es6.Promise;

var UserSchema = new Schema({
  user_id: {type: String,unique:true},
  first_name:{type:String}
});

//UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model("users", UserSchema);
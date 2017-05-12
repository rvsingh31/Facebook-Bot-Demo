var request=require('request');
var mongoose=require('mongoose');
var user_sch = require("./user");
var es6=require("es6-promise");
mongoose.Promise=es6.Promise;
 
 
const sendMessage = (userId, messageData)  => {

      return new Promise((resolve, reject) => {
        request
        (
            {
                url     : "https://graph.facebook.com/v2.6/me/messages",
                qs      : { access_token : process.env.PAGE_ACCESS_TOKEN },
                method  : "POST",
                json    : 
                        {
                            recipient: { id : userId },
                            message: messageData,
                        }
            }, (error, response, body) => 
            {
				console.log("in");
                if (error) { console.log("Error sending message: " + response.error); return reject(response.error); }
                else if (response.body.error) { console.log('Response body Error: ' + JSON.stringify(response.body.error)); return reject(response.body.error); }

                console.log("Message sent successfully to " + userId); 
                return resolve(response);
            }
        );    
    });
};


 function subscribe(senderId)
 {
					mongoose.connect("mongodb://rvsingh:singh31@ds139791.mlab.com:39791/fb_bot");
						var db = mongoose.connection;
						db.on('error', console.error.bind(console, 'connection error:'));
						db.once('open', function() {
						console.log("connected..");
					});
					
				/*	request({
						url: "https://graph.facebook.com/v2.6/" + senderId,
						qs: {
							access_token: process.env.PAGE_ACCESS_TOKEN,
							fields: "first_name"
						},
						method: "GET"
						}, function(error, response, body) {
							var g="";
							var name="";
							if (error) {
								console.log("Error getting user's name: " +  error);
							} else {
								var bodyObj = JSON.parse(body);
								name = bodyObj.first_name;
								g = "Hi " + name + ". \n";
							}
							var msg=g+"You have been successfully subscribed and we'll provide you latest updates time to time.\n Thank You for choosing Football Notifications.";
							
							var user={
								user_id:senderId,
								first_name:name
							};
							
							var q=user_sch(user);
							q.save(function(err){
								if (err) {
									console.error(err);
								}
								else
								{
									console.log("stored");
								}
						
							//		sendMessage(senderId, {text: msg});
							});
							
							
						});
						*/
						request({
							url: "https://graph.facebook.com/v2.6/" + senderId,
							qs: {
								access_token: process.env.PAGE_ACCESS_TOKEN,
								fields: "first_name"
								},
							method: "GET"
						}, function(error, response, body) {
							var greeting = "";
							if (error) {
								console.log("Error getting user's name: " +  error);
							} else {
								var bodyObj = JSON.parse(body);
								name = bodyObj.first_name;
								greeting = "Hi " + name + ". ";
							}
							var message = greeting + "My name is Football Notifications Bot. I can tell you various updates regarding International Teams and various Clubs news .\n To subscribe to our newsletter , type in : #subscribe \n ,To read today's featured article, type : #article \n Thank You.";
							sendMessage(senderId, {text: message});
						});
						
						
						
						mongoose.connection.close();
		
 }
 
 module.exports=subscribe;
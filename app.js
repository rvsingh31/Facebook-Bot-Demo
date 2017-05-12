var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var mongoose=require('mongoose');
var movie = require("./movie");
var es6=require("es6-promise");
mongoose.Promise=es6.Promise;
var article_fetch=require('./article');
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

// Server index page
app.get("/", function (req, res) {
  res.send("Deployed!");
});

app.post("/webhook", function (req, res) {
  if (req.body.object == "page") {
    req.body.entry.forEach(function(entry) {
      entry.messaging.forEach(function(event) {
        if (event.postback) {
          processPostback(event);
        }
		else if(event.message)
		{
			processM(event);
		}
      });
    });

    res.sendStatus(200);
  } 
});

function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;

  if (payload === "Greeting") {
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
  }
}
/*
function sendMessage(recipientId, message) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {id: recipientId},
      message: message,
    }
  }, function(error, response, body) {
    if (error) {
      console.log("Error sending message: " + response.error);
    }
	else
	{
		console.log("Message sent to the provided senderId");
	}
  });
}
*/

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


function processM(event) {
	
	if (!event.message.is_echo) {
		var message = event.message;
		var senderId = event.sender.id;

		console.log("Received message from senderId: " + senderId);
		console.log("Message is: " + JSON.stringify(message));

		if (message.text) {
			var formattedMsg = message.text.toLowerCase().trim();
			console.log("INCOMING MSG: "+formattedMsg);
		
			switch(formattedMsg)
			{
				case "#subscribe":
					mongoose.connect("mongodb://rvsingh:singh31@ds137141.mlab.com:37141/fb_bot");
						var db = mongoose.connection;
						db.on('error', console.error.bind(console, 'connection error:'));
						db.once('open', function() {
						console.log("connected..");
					});
						console.log("in subscribe case");
					request({
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
							console.log("PREPARED MSG:"+msg);
							var user={user_id:senderId,first_name:name};
							var query=movie(user);
							query.save(function(err){
								if (err) {
									console.error(err);
									if(err.name=="ValidatorError")
									{
										sendMessage(senderId, {text: "You are already subscribed."});
									}
								}
								else
								{
									sendMessage(senderId, {text: msg});
								}
							});
							console.log("query fired..");
						});
						
						mongoose.connection.close();
					break;
					
				case "#help":
					
					var message ="My name is Football Notifications Bot. I can tell you various updates regarding International Teams and various Clubs news .\n To subscribe to our newsletter , type in : #subscribe \n ,To read today's featured article, type : #article \n Thank You.";
						sendMessage(senderId, {text: message});
					break;
					
				case "#article":
					var date = new Date();
					var text = getFormattedDate(date);
					console.log("sending article dated:"+text);
					article_fetch(text,senderId);
					break;
					
					
				default: sendMessage(senderId, {text: "Sorry, We couldn't complete your request. Try Again."});
				break;
			}
		
		} else if (message.attachments) {
			sendMessage(senderId, {text: "Sorry, I don't understand your request."});
		}
  }
  
  	mongoose.connection.close();
}


function getFormattedDate(today) 
{
    var dd   = today.getDate();
    var mm   = today.getMonth()+1; 
    var yyyy = today.getFullYear();
  
    if(dd<10)  { dd='0'+dd } 
    if(mm<10)  { mm='0'+mm } 
  
    return yyyy+'/'+mm+'/'+dd;
}

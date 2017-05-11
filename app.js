var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var mongoose=require('mongoose');
var movie = require("./movie");

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
      var message = greeting + "My name is SP Movie Bot. I can tell you various details regarding movies. What movie would you like to know about?";
      sendMessage(senderId, {text: message});
    });
  }
}

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
  });
}

function processM(event) {
	mongoose.connect("mongodb://rvsingh:singh31@ds137141.mlab.com:37141/fb_bot");
		var db = mongoose.connection;
			db.on('error', console.error.bind(console, 'connection error:'));
			db.once('open', function() {
				console.log("connected..");
		});
	if (!event.message.is_echo) {
		var message = event.message;
		var senderId = event.sender.id;

		console.log("Received message from senderId: " + senderId);
		console.log("Message is: " + JSON.stringify(message));

		if (message.text) {
			var formattedMsg = message.text.toLowerCase().trim();
	
	
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
					var user={user_id:senderId,first_name:name};
					var query=movie(user);
					query.save(function(err){
						if (err) {console.error(err);
							if(err.name="ValidatorError")
							{
								sendMessage(senderId, {text: "You are already subscribed."});
							}
						}
						else
						{
							sendMessage(senderId, {text: msg});
						}
					});
			});
		} else if (message.attachments) {
			sendMessage(senderId, {text: "Sorry, I don't understand your request."});
		}
  }
}
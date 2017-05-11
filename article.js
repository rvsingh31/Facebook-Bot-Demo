var request=require('request');
var cheerio=require('cheerio');

function sendMessage(recipientId, message) {
	console.log("sending to:"+recipientId);
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


function fetch(date,senderId)
{
	var url="http://thesefootballtimes.co/"+date+"/";
	// update url to fetch articles using the date itself -  http://thesefootballtimes.co/2017/05/10/
	request(url,function(error,response,html){
		if(!error)
		{
			var $=cheerio.load(html);
			$("#post-load > article").each(function(){
				var image_link=$(this).find(".featured-image > a > img ").attr('src');
				var title=$(this).find('.entry-title > a').text();
				var content=$(this).find('.entry-content > p').text();
				var art_link=$(this).find('read-more-link').attr('href');

				message = {
					"attachment": {
					"type": "template",
					"payload": {
						"template_type": "generic",
						"elements": [{
							"title": title,
							"subtitle": content,
							"image_url": image_link,
							"buttons": [{
								"type": "web_url",
								"title": "Read More",
								"url":art_link
								}]
							}]
						}
					}
				};
				console.log("PREPARED MESG: "+JSON.stringify(message));
				console.log("sending message..");
				sendMessage(senderId,message);

			});
		}
		else
		{
			 sendMessage(senderId, {text: "Technical Issues Occured.We are sorry for the inconvenience caused . Please Try after sometime."});
		}
		
	});
}

module.exports=fetch;
var request=require('request');
var cheerio=require('cheerio');

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

function fetch(date,senderId)
{
	var url="http://thesefootballtimes.co/"+date+"/";
	// update url to fetch articles using the date itself -  http://thesefootballtimes.co/2017/05/10/
	request(url,function(error,response,html){
		if(!error)
		{
			var $=cheerio.load(html);
			var x=$("#post-load article:nth-child(1)");
			//	var image_link=$(this).find(".featured-image > a > img ").attr('src');
			//	var title=$(this).find('.entry-title > a').text();
			//	var content=$(this).find('.entry-content > p').text();
			//	var art_link=$(this).find('.entry-title > a').attr('href');
				
					var image_link=$("#post-load article:nth-child(1) > .featured-image > a > img ").attr('src');
					var title=$("#post-load article:nth-child(1) > .entry-title > a").text();
					var content=$("#post-load article:nth-child(1) > entry-content > p").text();
					var art_link=$("#post-load article:nth-child(1) > entry-title > a").attr('href');
				
				message = {
					attachment: {
					type: "template",
					payload: {
						template_type: "generic",
						elements: [{
							title: title,
							subtitle: content,
							image_url: image_link,
							buttons: [{
								type: "web_url",
								url:art_link,
								title: "Read More",
								}]
							}]
						}
					}
				};
				console.log("PREPARED MESG: "+JSON.stringify(message));
				console.log("sending message..");
				sendMessage(senderId,JSON.stringify(message));

		
			
		}
		else
		{
			 sendMessage(senderId, {text: "Technical Issues Occured.We are sorry for the inconvenience caused . Please Try after sometime."});
		}
		
	});
}

module.exports=fetch;
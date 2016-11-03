'use strict';

const randomPuppy = require('random-puppy');
/*
  Config file returns  an object with the following keys:
    twilio_sid
    twilio_token
    twilio_number : a number you've purchased on Twilio
    recipients : an array of objects of the following structure:
      number : phone number of recipient
      name
    moment_endpoints : an array of strings that are HTTP(S) endpoints for JSON files.
      The structure of the JSON files returned from the endpoints is expected to be as follows:
        {
          'aa/bb/cccc' : 'Message body',
          ...
          'xx/yy/zzzz' : 'Message body'
        }
        Example file found here: https://github.com/una/personal-goals/blob/master/happy-moments/2015_happy-moments.json
        Response structure adopted from Una Kravet's Happy Moments project (https://github.com/una/personal-goals/tree/master/happy-moments)
*/
const config = require('./private/config.js');
const twilio = require('twilio')(config.twilio_sid, config.twilio_token);
const request = require("request-promise");


/*
INPUT:
  url : URL for photo
  message : message to be sent as body of text
OUTPUT:
  Sends text message through Twilio API consisting of an image (if a URL is provided)
  and a message body (if message is provided)
  Returns 1 if message is sent successfully.
  Returns 0 if message sending failed.
*/
function sendMessage(url, message){
  //Iterate over recipients provided. Construct message objects for each.
  for (let recipient of config.recipients){
    let messageObject = {
      to: recipient.number,
      from: config.twilio_number,
      body: message ? message : '',
    }
    //if a URL was provided, add it as an attribute to the message object
    if (url){
      messageObject.mediaUrl = url;
    }

    //Attempt to create and send a message through Twilio
    try {
      twilio.messages.create(messageObject, function(err, message) {
        //if Twilio returns an error, throw it
        if (err){
          throw err;
        //If no error is returned, print the return message and return 1
        }else{
          console.log(message);
          return 1;
        }
      });
    }
    //If an error is caught, print it and return 0.
    catch(err) {
      console.error(err);
      return 0;
    }
  }
}

/*
INPUT: none
OUTPUT:
  Retrieves potential message bodies from HTTP enpoints and flattens to array.
  Return one entry from array selected at random.
  Responses are not cached as this script is meant to run on AWS Lambda.
*/
async function getMessage(){
  const urls = config.moment_endpoints;
  //Map over an array of URLs with an async await function. Will resolve to array of Promises
  const moment_promises = urls.map(async url => {
    const options = {
      uri : url,
      headers: {
        'User-Agent' : 'Request-Promise'
      },
      json: true
    };
    //Block context progress until request resolves
    const response = await request(options);
    //Return flat array of messages as strings, omitting dates
    return Object.keys(response).map(date => {
      return (response[date] + ' -- ' + date);
    });
  });
  //Wait on each promise to resolve to an array of strings, in order
  let moments = [];
  for (let promise of moment_promises){
    moments.push(await promise);
  }
  //Flatten the array of arrays
  const flat_moments = [].concat.apply([], moments);
  //Return one string from the array at random
  return flat_moments[Math.floor(Math.random()*(flat_moments.length))]
}

/*
INPUT:
  clickType: click type from AWS button. Can take form of "SINGLE" | "DOUBLE" | "LONG"
OUTPUT:
  Return value of sendMessage()
*/
async function compose(clickType){
  let moment, url;
  //Set the moment if clicktype is SINGLE
  //Set the url to that of an image if the clicktype is DOUBLE
  //Set both if the clicktype is LONG
  switch(clickType){
    case "SINGLE":
      moment = await getMessage();
      break;
    case "DOUBLE":
      url = await randomPuppy();
      break;
    case "LONG":
      moment = await getMessage();
      url = await randomPuppy();
      break;
  }
  return sendMessage(url, moment);
}

exports.handler = (event, context, callback) => {
  console.log("Received click of type:", event.clickType);
  compose(event.clickType);
}

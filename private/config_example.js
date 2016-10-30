module.exports = {
    twilio_sid : "SID_HERE",
    twilio_token : "TOKEN_HERE",
    twilio_number : "TWILIO_NUMBER",
    //you should change these to be endpoints to your own messages
    moment_endpoints : [
      'https://raw.githubusercontent.com/una/personal-goals/master/happy-moments/2015_happy-moments.json',
      'https://raw.githubusercontent.com/una/personal-goals/master/happy-moments/2016_happy-moments.json'
    ],
    recipients: [
      {
        name: "Bob",
        number :  "+12345678910"
      }
    ]
  }
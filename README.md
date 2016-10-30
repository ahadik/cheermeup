#Cheer Me Up
##An AWS IoT Button Project

This node module is configured to run as an AWS Lambda function. It was created as a small gift to a friend, [Una Kravets](http://www.github.com/una) using her Happy Moments open source project, in which she details a happy moment from each day and posts it to a [GitHub repository](https://github.com/una/personal-goals/tree/master/happy-moments).

With a Twilio API key and phone number, and a source of messages formatted like Una's Happy Moments, this AWS Lambda function can send three types of text messages - a text message drawn from the desired source, a photo of a puppy from the `random-puppy` Node module, or a message containing both.

The function is triggered with an AWS IoT Button. One click sends a message, two clicks send a puppy, and a long press sends both.

###Configuration

You'll have to do some configuration to get your own version of this project working.

The first is to get a source of messages. Take a look at Una's happy moments for an example: [https://github.com/una/personal-goals/tree/master/happy-moments](https://github.com/una/personal-goals/tree/master/happy-moments). You'll need at least one HTTP(S) endpoint with messages in the same JSON format as Una's Happy Moments.

Next you'll need a Twilio account with an API SID and token. You'll also need to get a phone number from Twilio to send the text messages.

Copy the config example file and fill in your own details: `cp ./private/config_example.js ./private/config.js`.

If you want to activate this Lambda function with an AWS IoT Button, purchase one from Amazon and go through the configuration steps provided.

You'll then need to upload the code and dependencies as  ZIP file to AWS Lambda:

1. Run `npm install --production` to install the minimum required dependencies.
2. In a file browser, select `index.js`, `node_modules/` and `private/` and compress them into a ZIP Archive. DO NOT compress the directory itself. For one, this will contain the Git history which will make the archive too large to upload to AWS Lambda. It will also un-archive into a directory that then contains the necessary files. AWS Lambda expects the ZIP File to un-archive into the necessary files alone without a wrapping directory.
3. Upload the resulting ZIP Archive to AWS Lambda.

###Making Changes
If you want to edit the Lambda function, you'll need to install the developer dependencies as well (`npm install`). This will install the necessary Babel modules to transpile `app.js` into `index.js`.

With that being said, `app.js` is written using features of ES2016 and ES2017. AWS Lambda runs Node 4.3, so we'll need to transpile using Babel. Run `npm run babel` to transpile `app.js` to `index.js`. DON'T try to edit `index.js`. It's Babel gibberish.

However, if you do install the Babel plugins, you should delete them from `node_modules` before compressing and uploading to AWS Lambda. This is most easily done by:

1. Transpiling `app.js`.
2. Deleting the `node_modules` directory.
3. Installing only the production dependencies with `npm install --production`.
4. Compressing and uploading.
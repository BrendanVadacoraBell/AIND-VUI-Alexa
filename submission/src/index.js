'use strict';
var Alexa = require('alexa-sdk');
var APP_ID = undefined;  // can be replaced with your app ID if publishing
var facts = require('./facts');
var GET_FACT_MSG_EN = [
    "Here's your fact: ",
    "Here's a fact: ",
    "I found your fact, ",
    "Oh, this is a good fact: ",
    "I hope you like this fact: "
]
// Test hooks - do not remove!
exports.GetFactMsg = GET_FACT_MSG_EN;
var APP_ID_TEST = "mochatest";  // used for mocha tests to prevent warning
// end Test hooks
/*
    TODO (Part 2) add messages needed for the additional intent
    TODO (Part 3) add reprompt messages as needed
*/
var languageStrings = {
    "en": {
        "translation": {
            "FACTS": facts.FACTS_EN,
            "SKILL_NAME": "My History Facts",  // OPTIONAL change this to a more descriptive name
            "GET_FACT_MESSAGE": GET_FACT_MSG_EN,
            "HELP_MESSAGE": "You can say tell me a fact, or, you can say exit... What can I help you with?",
            "HELP_REPROMPT": "What can I help you with?",
            "STOP_MESSAGE": "Goodbye!"
        }
    }
};

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // set a test appId if running the mocha local tests
    if (event.session.application.applicationId == "mochatest") {
        alexa.appId = APP_ID_TEST
    }
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

/*
    TODO (Part 2) add an intent for specifying a fact by year named 'GetNewYearFactIntent'
    TODO (Part 2) provide a function for the new intent named 'GetYearFact' 
        that emits a randomized fact that includes the year requested by the user
        - if such a fact is not available, tell the user this and provide an alternative fact.
    TODO (Part 3) Keep the session open by providing the fact with :askWithCard instead of :tellWithCard
        - make sure the user knows that they need to respond
        - provide a reprompt that lets the user know how they can respond
    TODO (Part 3) Provide a randomized response for the GET_FACT_MESSAGE
        - add message to the array GET_FACT_MSG_EN
        - randomize this starting portion of the response for conversational variety
*/

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetFact');
    },
    'GetNewFactIntent': function () {
        this.emit('GetFact');
    },
    'GetFact': function () {
        // Get a random fact from the facts list
        // Use this.t() to get corresponding language data
        var factArr = this.t('FACTS');
        var randomFact = randomPhrase(factArr);

        // Create speech output
        var speechOutput = getRandomFactMessage() + randomFact;
        this.emit(':askWithCard', speechOutput, 'You can ask for another fact like you did before or even specify a year.', this.t("SKILL_NAME"), randomFact)
    },
    'GetNewYearFactIntent': function () {
        this.emit('GetNewYearFact');
    },
    'GetNewYearFact': function () {
        //get the spoken year
        var requestedYear = parseInt(this.event.request.intent.slots.FACT_YEAR.value);
  
        if(requestedYear){

            // Get a random fact from the facts list
            // Use this.t() to get corresponding language data
            var factArr = this.t('FACTS');
            var randomFact = getPhraseWithYear(factArr, requestedYear);

            var speechOutput = "";

            // Create speech output
            if(randomFact){
                speechOutput = getRandomFactMessage() + `In ${requestedYear}, ` + randomFact;
            }
            else{
                speechOutput = `There is no fact from the year ${requestedYear}, ` + getRandomFactMessage() + randomPhrase;
            }
            this.emit(':askWithCard', speechOutput, 'You can ask for another fact like you did before.', this.t("SKILL_NAME"), randomFact)
        
        }
        else{ 
            this.emit(':ask', 'I did not hear that year', "Please provide a valid Year.");
        }
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = this.t("HELP_MESSAGE");
        var reprompt = this.t("HELP_MESSAGE");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
};

function randomPhrase(phraseArr) {
    // returns a random phrase
    // where phraseArr is an array of string phrases
    var i = 0;
    i = Math.floor(Math.random() * phraseArr.length);
    return (phraseArr[i]);
};

function getPhraseWithYear(phraseArr, year){
    //filters the phrases by year
    var filteredPhrases = phraseArr.filter(function(el){
        return el.indexOf(year) >= 0;
    });
    //returns a random phrase from the filtered phrases
    return randomPhrase(filteredPhrases)
}

function getRandomFactMessage(){
    //returns a random fact message intro
    return GET_FACT_MSG_EN[Math.floor(Math.random()*GET_FACT_MSG_EN.length)];
}

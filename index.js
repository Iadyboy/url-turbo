var SteamCommunity = require('steamcommunity');
var ReadLine = require('readline');
var fs = require('fs');
var request = require("request");
var community = new SteamCommunity();
var prompt = require('prompt-sync')();

var pDelay = 17.674;
var debug = 0;
var cnt = 0;


console.clear();

const loadConfig = prompt("load config? (y/n) ");

const configNum = prompt("select config: ");


var targetUser;
var targetPass;
var apiKey;
var saveInfo;
var targetID;
var urlType = 1;

if (loadConfig == "y")
{
  var dataR = fs.readFileSync("./config"+configNum+".json");
  var myObj;

  console.clear();

  //console.log("1 =  user id")
  //console.log("2 = group id")
  //urlType = prompt("url type: ")

  console.clear();
  targetID = prompt("enter target id: ");
  console.clear();

  myObj = JSON.parse(dataR);

  doLogin(myObj.username, myObj.password);
}
else if (loadConfig == "n")
{
  console.clear();

  targetUser = prompt("enter username: ");
  targetPass = prompt("enter password: ");
  apiKey = prompt("enter api key: ");
  saveInfo = prompt("save info? (y/n) ");

  var info = 
  {
    username : targetUser,
    password : targetPass,
    api : apiKey,
  };

  
  if(saveInfo == "y")
  {
    var dataW = JSON.stringify(info);

    fs.writeFile("./config"+configNum+".json", dataW, function(err)
    {
      if (err) 
      {
        console.log("couldnt save config :(");
        console.log(err.message);
        return;
      }
      console.log("saved config !!")
      console.clear();
    });
  } 
  else if (saveInfo == "n")
  {
    console.clear();
  }
  else
  {
    console.log("input not recognised >:(");
    return process.exit(22);
  }
  console.clear();

  //console.log("1 =  user id")
  //console.log("2 = group id")
  //urlType = prompt("url type: ")

  console.clear();
  targetID = prompt("enter target id: ");
  console.clear();

  doLogin(targetUser, targetPass); 
}
else
{
  console.clear();
  console.log("input not recognised >:(");
  return process.exit(22);
}


var targetString = "No match";
var rl = ReadLine.createInterface(
{
  "input": process.stdin,
  "output": process.stdout
});

function jetEngine() 
{
  if (loadConfig == "y")
  {
    request("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" + myObj.api + "&vanityurl=" + targetID + "&url_type" + urlType, function(error, response, body) 
    {
      if(body.indexOf(targetString) > -1)
      {
        claim();
      }
      else 
      {
        cnt++;
        if (debug > 0) 
        {
          console.log(cnt);
        }
      }
    });
  }
  else if (loadConfig == "n")
  {
    request("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" + apiKey + "&vanityurl=" + targetID + "&url_type" + urlType, function(error, response, body) 
    {
      if(body.indexOf(targetString) > -1)
      {
       claim();
      }
      else 
      {
        cnt++;
        if (debug > 0) 
        {
          console.log(cnt);
        }
      }
    });
  }
}


function doLogin(accountName, password, authCode, twoFactorCode, captcha)
{
  community.login(
    {
      "accountName": accountName,
      "password": password,
      "authCode": authCode,
      "twoFactorCode": twoFactorCode,
      "captcha": captcha
    }, function(err, sessionID, cookies, steamguard) 
    {
      if(err) 
      {
        if(err.message == 'SteamGuard') 
        {
          rl.question("steam guard (EMAIL): ", function(code) 
          {
            doLogin(accountName, password, code);
          });

          return;
        }

        if(err.message == 'SteamGuardMobile') 
        {
          rl.question("steam guard (MOBILE): ", function(code) 
          {
            doLogin(accountName, password, null, code);
          });

          return;
        }

        if(err.message == 'CAPTCHA') 
        {
          console.log(err.captchaurl);
          rl.question("CAPTCHA: ", function(captchaInput) 
          {
            doLogin(accountName, password, null, captchaInput);
          });

          return;
        }

        console.log(err);
        process.exit();
      } 

      console.log("[","\x1b[32m","+","\x1b[0m","]","started turboing " + "\x1b[33m",targetID + "\x1b[0m"," to account " + accountName);
      setInterval(jetEngine, pDelay);
    });
}


function setClaim() 
{
  community.editProfile(
  {
    "customURL": targetID
  }, function(err)
  {
    if (err) 
    {
      console.log("[","\x1b[31m","+","\x1b[0m","]","failed to turbo :(")
    }
    else 
    {
      console.log("[","\x1b[32m","+","\x1b[0m","]","successfully turboed !")

      setTimeout(end, 10000);
    }
  });
}

function end()
{
  return process.exit(22)
}



var claim = (function() 
{
   var executed = false;
   return function() 
   {
      if (!executed) 
      {
        executed = true;
        setClaim();
      }
   };
})();
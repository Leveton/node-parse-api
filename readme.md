Node Parse API
==============

install
-------

    npm install node-parse-api
 
examples
--------

### setup with MASTER_KEY

    var Parse = require('node-parse-api').Parse;

    var APP_ID = ...;
    var MASTER_KEY = ...;

    var app = new Parse(APP_ID, MASTER_KEY);

### setup with API_KEY

    var Parse = require('node-parse-api').Parse;

    var options = {
        app_id:'...',
        api_key:'...' // master_key:'...' could be used too
    }

    var app = new Parse(options);

### insert an object

    // add a Foo object, { foo: 'bar' }
    app.insert('Foo', { foo: 'bar' }, function (err, response) {
      console.log(response);
    });

### insert a User

    app.insertCustom('users', { 
      username: 'tom@j.com', 
      password: 'wow'
    }, function (err, response) {
      console.log(response);
    });

### insert a User with GeoPoints

    app.insertCustom('users', { foo: 'bar', location: {__type: 'GeoPoint', latitude: <int>, longitude: <int>} }, function (err, response) {
      console.log(response);
    });

### insert a file

    app.insertFile(fileName, data, fileType, function (err, response) {
      fileLink = response.url;
      parseName = response.name;
        app.insert('Foo', { "foo" : fileLink, "bar" : parseName }, function(erro, res){
       })
    });

### find one

    // the Foo with id = 'someId'
    app.find('Foo', 'someId', function (err, response) {
      console.log(response);
    });

### find many

    // all Foo objects with foo = 'bar'
    app.findMany('Foo', { foo: 'bar' }, function (err, response) {
      console.log(response);
    });


    // all Foo objects
    app.findMany('Foo', '', function (err, response) {
      console.log(response);
    }):

### count the number of objects

    // just use findMany, and call results.length on the response
    app.findMany('Foo', { user: '<objectId>' }, function (err, response) {
        console.log(response.results.length);
    });

### update

    app.update('Foo', 'someId', { foo: 'fubar' }, function (err, response) {
      console.log(response);
    });

### delete

    app.delete('Foo', 'someId', function (err) {
      // nothing to see here
    });

### deleteAll

    app.deleteAll('Foo', function (err) {
      // nothing to see here
    });

### reset a password

    //email is built into Parse's special User class
    app.passwordReset(email, function(err, response){
      console.log(response);
    });

### update User email

    //email is built into Parse's special User class
    app.updateUserEmail(objectId, email, function(err, response){
      if (err) {
        console.log(err);
      } else {
        console.log(response);
      }
    });

### insert installation data

    //first arg is either 'ios' or 'android'.  second arg is either the Apple deviceToken or the Android installationId.
    app.insertInstallationData("ios", "0123456784abcdef0123456789abcdef0123456789abcdef0123456789abcdef", function(err, response){
      if (err) {
        console.log(err);
      } else {
        console.log(response);
      }
    });

### insert installation data with timeZone

    //first arg is either 'ios' or 'android'.  second arg is either the Apple deviceToken or the Android installationId.  Third arg is the timezone string.
    app.insertInstallationDataWithTimeZone("ios", "0123456784abcdef0123456789abcdef0123456789abcdef0123456789abcdef", "EST", function(err, response){
      if (err) {
        console.log(err);
      } else {
        console.log(response);
      }
    });

### insert installation data with channels

    //first arg is either 'ios' or 'android'.  second arg is either the Apple deviceToken or the Android installationId.  Third arg is the channels array.
    arr = ["news", "sports"];
    app.insertInstallationDataWithChannels("ios", "0123456784abcdef0123456789abcdef0123456789abcdef0123456789abcdef", arr, function(err, response){
      if (err) {
        console.log(err);
      } else {
        console.log(response);
      }
    });

### insert installation data with timeZone and channels

    //first arg is either 'ios' or 'android'.  second arg is either the Apple deviceToken or the Android installationId.  Third arg is the timezone string.  4th is the channels array.
    arr = ["news", "sports"];
    app.insertInstallationDataWithTimeZoneAndChannels("ios", "0123456784abcdef0123456789abcdef0123456789abcdef0123456789abcdef", "EST", arr, function(err, response){
      if (err) {
        console.log(err);
      } else {
        console.log(response);
      }
    });

### create a role for a particular user

    //create a data object that links the user object's objectId to the role

    var data = {
      name: 'Administrator',
      ACL: {
          "*": {
            "read": true
          }
        },
      roles: {
          "__op": "AddRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_Role",
             "objectId": "<objectId>"
            }
          ]
        },
      users: {
          "__op": "AddRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_User",
              "objectId": "<objectId>"
            }
          ]
        }
    };

      app.insertRole(data, function(err, resp){
         console.log(resp);
       });

### get a role

    //pass the role object's objectId
    app.getRole("<objectId>", function(err, resp){
      console.log(resp);
    });

### update a role
    //pass the objectId of the role, data contains the user's objectId

    var data = {
      users: {
          "__op": "RemoveRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_User",
              "objectId": "<objectId>"
            }
          ]
        }
    };

      app.updateRole("<objectId>", data, function(err, resp){
        console.log(resp);
      });

### delete a role

    //pass the objectId of the role
    app.deleteRole("<objectId>", function(err, resp){});

### get all the roles

    app.getRoles(function(err, resp){});

### get a role against a cetain param

    var params = {
       where: { name: "Administrator" }
    };

       app.getRoles(params, function(err, resp){
         console.log(resp);
       });

### send a push notification

    //The data param has to follow the data structure as described in the [Parse REST API](https://www.parse.com/docs/rest#push)
    var notification = {
      channels: [''],
      data: {
        alert: "sending too many push notifications is obnoxious"
      }
    };
    app.sendPush(notification, function(err, resp){
      console.log(resp);
    });

### note on sending dates

    //when inserting a data, you must use the Parse date object structure, i.e.:
    {
      "__type": "Date",
      "iso": new Date("<year>", "<month>", "<day>").toJSON()
    }

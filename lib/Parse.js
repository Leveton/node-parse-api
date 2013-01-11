var qs = require('querystring');

module.exports = Parse;

function Parse(application_id, master_key) {
  this._application_id = application_id;
  this._master_key = master_key;
}

Parse.prototype = {
  _api_protocol: require('https'),
  _api_host: 'api.parse.com',
  _api_port: 443,
  
  // add object to class store
  insert: function (className, object, callback) {
    parseRequest.call(this, 'POST', '/1/classes/' + className, object, callback);
  },
  
  // add files
  insertFile: function(fileName, data, contentType, callback){
    parseRequest.call(this, 'POST', '/1/files/' + fileName, data, callback, contentType);
  },
  
  // get an object from the class store
  find: function (className, query, callback) {
    if (typeof query === 'string') {
      parseRequest.call(this, 'GET', '/1/classes/' + className + '/' + query, null, callback);
    } else {
      parseRequest.call(this, 'GET', '/1/classes/' + className, { where: JSON.stringify(query) }, callback);
    }
  },

  // get a collection of objects
  findMany: function (className, query, callback) {
    if (typeof query === 'string') {
      parseRequest.call(this, 'GET', '/1/classes/' + className + '/' + query, null, callback);
    } else {
      parseRequest.call(this, 'GET', '/1/classes/' + className, { where: JSON.stringify(query) }, callback);
    }
  },
  
  // get a user from the Parse's special User class.  See https://parse.com/questions/why-does-querying-for-a-user-create-a-second-user-class
  getUser: function (userName, passWord, callback) {
    parseRequest.call(this, 'GET', '/1/login/?username=' + userName + '&password=' + passWord, null, callback);
  },
  
  // get an object belonging to a certain User
  getFileByUser: function(userId, className, callback) {
    queryString = 'where={"user":' + '"' + userId + '"' + '}'
    encodedString = encodeURIComponent(queryString);
    parseRequest.call(this, 'GET', '/1/classes/' + className + '?' + encodedString, null, callback)
  },

  // insert an object into Parse
  insertCustom: function (className, object, callback) {
    parseRequest.call(this, 'POST', '/1/' + className, object, callback);
  },

  // update an object in the class store
   update: function (className, objectId, object, callback) {
    parseRequest.call(this, 'PUT', '/1/classes/' + className + '/' + objectId, object, callback);
  },

  // update a User object's email address
  updateUserEmail: function(objectId, data, callback) {
    data = { email: data }
    parseRequest.call(this, 'PUT', '/1/users/' + objectId, data, callback)
  },

  // update a User object's username*
  updateUserName: function(objectId, data, callback) {
    data = { username: data }
    parseRequest.call(this, 'PUT', '/1/users/' + objectId, data, callback)
  },

  // reset a User object's password
  passwordReset: function (data, callback) {
    data = { email: data } 
    parseRequest.call(this, 'POST', '/1/requestPasswordReset/', data, callback)
  },

  // remove an object from the class store
  delete: function (className, objectId, callback) {
    parseRequest.call(this, 'DELETE', '/1/classes/' + className + '/' + objectId, null, callback);
  },
  
  // upload installation data
  insertInstallationData: function (deviceType, deviceToken, callback) {
     if (deviceType === 'ios'){
      data = { deviceType: deviceType, deviceToken: deviceToken }
     }
     else {
      data = { deviceType: deviceType, installationId: deviceToken }
     }
    parseRequest.call(this, 'POST', '/1/installations/', data, callback);
  },

  insertInstallationDataWithTimeZone: function (deviceType, deviceToken, timeZone, callback) {
     if (deviceType === 'ios'){
      data = { deviceType: deviceType, deviceToken: deviceToken, timeZone: timeZone }
     }
     else {
      data = { deviceType: deviceType, installationId: deviceToken, timeZone: timeZone }
     }
    parseRequest.call(this, 'POST', '/1/installations/', data, callback);
  },

  insertInstallationDataWithChannels: function (deviceType, deviceToken, channels, callback) {
     if (deviceType === 'ios'){
      data = { deviceType: deviceType, deviceToken: deviceToken, channels: channels }
     }
     else {
      data = { deviceType: deviceType, installationId: deviceToken, channels: channels }
     }
    parseRequest.call(this, 'POST', '/1/installations/', data, callback);
  },

   insertInstallationDataWithTimeZoneAndChannels: function (deviceType, deviceToken, timeZone, channels, callback) {
     if (deviceType === 'ios'){
      data = { deviceType: deviceType, deviceToken: deviceToken, timeZone: timeZone, channels: channels }
     }
     else {
      data = { deviceType: deviceType, installationId: deviceToken, timeZone: timeZone, channels: channels }
     }
    parseRequest.call(this, 'POST', '/1/installations/', data, callback);
  }
};

// Parse.com https api request
function parseRequest(method, path, data, callback, contentType) {
  var auth = 'Basic ' + new Buffer(this._application_id + ':' + this._master_key).toString('base64');
  var headers = {
    Authorization: auth,
    Connection: 'Keep-alive'
  };
  
  var body = null;
  
  switch (method) {
    case 'GET':
      if (data) {
        path += '?' + qs.stringify(data);
      }
      break;
    case 'POST':
    case 'PUT':
      body = typeof data === 'object' ? JSON.stringify(data) : data;
      //headers['Content-length'] = body.length;
      headers['Content-type'] = contentType || 'application/json';
      break;
    case 'DELETE':
      headers['Content-length'] = 0;
      break;
    default:
      throw new Error('Unknown method, "' + method + '"');
  }
  
  var options = {
    host: this._api_host,
    port: this._api_port,
    headers: headers,
    path: path,
    method: method
  };
  
  var req = this._api_protocol.request(options, function (res) {
    if (!callback) {
      return;
    }
    
    if (res.statusCode < 200 || res.statusCode >= 300) {
      var err = new Error('HTTP error ' + res.statusCode);
      err.arguments = arguments;
      err.type = res.statusCode;
      err.options = options;
      err.body = body;
      return callback(err);
    }
    
    var json = '';
    res.setEncoding('utf8');
    
    res.on('data', function (chunk) {
      json += chunk;
    });
    
    res.on('end', function () {
      var err = null;
      var data = null;
      try {
        var data = JSON.parse(json);
      } catch (err) {
      }
      callback(err, data);
    });
    
    res.on('close', function (err) {
      callback(err);
    });
  });
  
  body && req.write(body, contentType ? 'binary' : 'utf8');
  req.end();

  req.on('error', function (err) {
    callback && callback(err);
  });
}

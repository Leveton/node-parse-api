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
  findMany: function (className, query, order, limit, callback) {
    // also supports the following api - findMany: function (className, query, callback)

    // if only 3 arguments exist, third argument is the callback, order and limit are undefined
    if (arguments.length === 3) {
      var callback = order;
      var order = undefined;
      var limit = 9999;
    }

    if (typeof(query) === 'string') {
      parseRequest.call(this, 'GET', '/1/classes/' + className + '/' + query, null, callback);
    } else {
      parseRequest.call(this, 'GET', '/1/classes/' + className, {limit: limit, order:order, where: JSON.stringify(query) }, callback);
    }
  },

  // do a batch of requests at once
  batch: function (requests,callback) {
    parseRequest.call(this,'POST','/1/batch',{requests:requests},callback);
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
  },

  updateInstallationDataChannels: function(objectId, channels, callback) {
	parseRequest.call(this, 'PUT', '/1/installations/' + objectId, {
		channels: channels
	}, callback);
  },

  getInstallationDataForDeviceToken: function(deviceToken, callback) {
    parseRequest.call(this, 'GET', '/1/installations?where={"deviceToken":"'+deviceToken+'"}', null, callback);
  },

  insertOrUpdateInstallationDataWithChannels: function(deviceType, deviceToken, channels, callback) {
	var that = this;
    this.getInstallationDataForDeviceToken(deviceToken, function(err, results) {
      if (!err && results.results.length) {
		that.updateInstallationDataChannels(results.results[0].objectId, channels);
        return;
	  }
	  that.insertInstallationDataWithChannels(deviceType, deviceToken, channels, callback);
	});
  },

  countObjects: function (className, query, callback) {
    if (typeof(query) === "function") {
      parseRequest.call(this, 'GET', '/1/classes/' + className, null, query);
    }
    if (typeof(query) === "string") {
      parseRequest.call(this, 'GET', '/1/classes/' + className + '/' + query, null, callback);
    } else {
      parseRequest.call(this, 'GET', '/1/classes/' + className, { where: JSON.stringify(query) }, callback);
    }
  },

  addRelation: function( relationName, className1, objectId1, className2, objectId2, callback) {
    data = {}
    data[relationName] = { __op:"AddRelation",objects:[{__type:"Pointer",className:className2,objectId:objectId2}]};
    parseRequest.call(this,'PUT','/1/classes/' + className1+'/'+objectId1,data,callback);
  },

  removeRelation: function( relationName, className1, objectId1, className2, objectId2, callback) {
    data = {}
    data[relationName] = { __op:"RemoveRelation",objects:[{__type:"Pointer",className:className2,objectId:objectId2}]};
    parseRequest.call(this,'PUT','/1/classes/' + className1+'/'+objectId1,data,callback);
  },


  insertRole: function (data, callback) {
    parseRequest.call(this, 'POST', '/1/roles/', data, callback);
  },

  getRole: function (objectId, callback) {
    parseRequest.call(this, 'GET', '/1/roles/' + objectId, null, callback);
  },

  getRoles: function (params, callback) {
    if (typeof(params) === "function") {
      parseRequest.call(this, 'GET', '/1/roles/', null, params);
    }
    if (typeof(params) === "string") {
      parseRequest.call(this, 'GET', '/1/roles/' + params, null, callback);
    } else {
      params = JSON.stringify(params);
      parseRequest.call(this, 'GET', '/1/roles/', params, callback);
    }
  },

  updateRole: function (objectId, data, callback) {
    parseRequest.call(this, 'PUT', '/1/roles/' + objectId, data, callback);
  },

  deleteRole: function (objectId, callback) {
    parseRequest.call(this, 'DELETE', '/1/roles/' + objectId, callback);
  },

  sendPush: function (data, callback) {
    parseRequest.call(this, 'POST', '/1/push/', data, callback);
  },

  deleteAll: function(modelName, callback){
    var that = this;
    this.findMany(modelName, '', function(err, response){
      var requests = toDeleteOps(modelName, response.results);
      that.batch(requests, callback);
    });
  }
};


function reformatDatesToParse(object){
  if(typeof object !== 'object') return object;
  for( var key in object){
    if(object[key] instanceof Date){
      object[key] = {
        "__type": "Date",
        "iso": object[key].toISOString()
      }
    }else if(typeof object[key] === 'object'){
      object[key] = reformatDatesToParse(object[key]);
    }
  }
  return object;
}

function reformatDatesFromParse(object){
  if(typeof object !== 'object') return object;
  for( var key in object){
    if(typeof object[key]==='object'){
      if(object[key]["__type"] && object[key]["__type"]==="Date"){
        object[key] = new Date(object[key]["iso"]);
      }else{
        object[key] = reformatDatesFromParse(object[key]);
      }
    }
  }
  return object;
}


// Parse.com https api request
function parseRequest(method, path, data, callback, contentType) {
  var auth = 'Basic ' + new Buffer(this._application_id + ':' + this._master_key).toString('base64');
  var headers = {
    Authorization: auth,
    Connection: 'Keep-alive'
  };

  var body = null;

  //convert javascript date objects to parse format
  if(typeof data === 'object'){
    data = reformatDatesToParse(data);
  }

  switch (method) {
    case 'GET':
      if (data) {
        // Avoid globally overriding `querystring.escape`:
        // http://nodejs.org/api/querystring.html#querystring_querystring_escape
        var originalEscape = qs.escape;
        qs.escape = function(q){ return q; };
        path += (path.indexOf("?") == -1 ? '?' : '&') + qs.stringify(data);
        qs.escape = originalEscape;

      }
      break;
    case 'POST':
      body = typeof data === 'object' ? JSON.stringify(data) : data;
      headers['Content-length'] = Buffer.byteLength(body);
    case 'PUT':
      body = typeof data === 'object' ? JSON.stringify(data) : data;
      headers['Content-length'] = Buffer.byteLength(body);
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

    var json = '';
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      json += chunk;
    });

    res.on('end', function () {
      var data = null;

      try {
        data = reformatDatesFromParse(JSON.parse(json));
      } catch (err) {
        return callback(err);
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        var message = data.error ? data.error + ' (Code: ' + data.code + ')' :
          'HTTP error' + res.statusCode;
        var err = new Error(message);
        err.code = data.code;
        err.arguments = arguments;
        err.type = res.statusCode;
        err.options = options;
        err.body = body;
        return callback(err);
      }

      callback(null, data);
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

function toDeleteOps(className, objects){
  return objects.map(function(object){
    return {
      method: 'DELETE',
      path: '/1/classes/' + className + '/' + object.objectId,
      body: {}
    }
  });
}

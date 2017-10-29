// Enter your information here.
var speakerIP = "192.168.1.34"
var spearkerName = "BOSE SoundTouch Speaker"
// Only edit the code after this comment if you know what you are doing.

var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var HTTP = require('http')
var xmldoc = require('xmldoc')

var LightController = {
  name: speakerName,
  pincode: "031-45-154",
  username: "FA:3C:ED:5A:1A:1A",
  manufacturer: "BOSE",
  model: "412540",
  serialNumber: speakerName,

  power: true,
  brightness: getVolume(),

  outputLogs: true,

  setPower: function(status) {
    this.power = status;
  },

  getPower: function() {
    return this.power;
  },

  setBrightness: function(brightness) {
    this.brightness = brightness;
    setVolume(brightness)
  },

  getBrightness: function() {
    var volume = getVolume()
    this.brightness = volume
    return volume;
  },

  identify: function() {
    if (this.outputLogs) console.log("Identify the '%s'", this.name);
  }
}

var lightUUID = uuid.generate('hap-nodejs:accessories:light' + LightController.name);
var lightAccessory = exports.accessory = new Accessory(LightController.name, lightUUID);

lightAccessory.username = LightController.username;
lightAccessory.pincode = LightController.pincode;

lightAccessory
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, LightController.manufacturer)
  .setCharacteristic(Characteristic.Model, LightController.model)
  .setCharacteristic(Characteristic.SerialNumber, LightController.serialNumber);

lightAccessory.on('identify', function(paired, callback) {
  LightController.identify();
  callback();
});

lightAccessory
  .addService(Service.Lightbulb, LightController.name)
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    LightController.setPower(value);
    callback();
  })
  .on('get', function(callback) {
    callback(null, LightController.getPower());
  });

lightAccessory
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Brightness)
  .on('set', function(value, callback) {
    LightController.setBrightness(value);
    callback();
  })
  .on('get', function(callback) {
    callback(null, LightController.getBrightness());
  });

function getVolume() {
  HTTP.get('http://' + speakerIP + ':8090/volume', function(res) {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      var xmlData = new xmldoc.XmlDocument(chunk);
      var volume = xmlData.firstChild.val
      return volume
    });
  })
}

function setVolume(volume) {
  var options, body, req;

  options = {
    hostname: speakerIP,
    port: 8090,
    path: '/volume',
    method: 'POST'
  };

  body = "<volume>" + volume + "</volume>"

  req = HTTP.request(options, function(res) {
    if (res.statusCode == 202) {

    } else {
      console.log('rejecting bad status code ' + res.statusCode);
    }
  });

  req.on('error', function(err) {
    console.log('error posting message ' + JSON.stringify(err));
  });
  req.on('timeout', function(err) {
    console.log('timeout posting message ' + JSON.stringify(err));
  });
  req.end(body);
}

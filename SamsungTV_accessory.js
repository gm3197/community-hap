// Enter your information here.
var tvIP = "192.168.1.18"
var tvName = "Samsung Smart Hub TV"
// Only edit the code after this comment if you know what you are doing.

var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var SamsungRemote = require('samsung-remote');
var err = false

var remote = new SamsungRemote({
  ip: tvIP
})

// here's a fake hardware device that we'll expose to HomeKit
var FAKE_OUTLET = {
  setPowerOn: function(on) {
    console.log("Turning the outlet %s!...", on ? "on" : "off");
    remote.send('KEY_MUTE', function callback(err) {
    if (err) {
        console.log(err)
    } else {
        // command has been successfully transmitted to your tv
        FAKE_OUTLET.powerOn = on
    }
});
  },
  identify: function() {
    console.log("Identify the outlet.");
  }
}

// Generate a consistent UUID for our outlet Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the accessory name.
var outletUUID = uuid.generate('hap-nodejs:accessories:' + tvName);

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var outlet = exports.accessory = new Accessory(tvName, outletUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
outlet.username = "1A:2B:3C:4D:5D:FF";
outlet.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
outlet
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Samsung")
  .setCharacteristic(Characteristic.SerialNumber, tvName);

// listen for the "identify" event for this Accessory
outlet.on('identify', function(paired, callback) {
  FAKE_OUTLET.identify();
  callback(); // success
});

// Add the actual outlet Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
outlet
  .addService(Service.Outlet, tvName) // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    FAKE_OUTLET.setPowerOn(value);
    callback(); // Our fake Outlet is synchronous - this value has been successfully set
  });

  outlet.getService(Service.Outlet)
  .setCharacteristic(Characteristic.OutletInUse, true)

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
outlet
  .getService(Service.Outlet)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {

    // this event is emitted when you ask Siri directly whether your light is on or not. you might query
    // the light hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.

    var err = null; // in case there were any problems

    callback(err, FAKE_OUTLET.powerOn)
  });

# community-hap
A group of community Homekit accessories for use with HAP-NodeJS

## BoseSpeaker_accessory.js
This is an accessory that uses BOSE's SoundTouch API to control any SoundTouch speaker.
Note: You must have your speaker configured to connect to your wifi, and your HAP-NodeJS device must be on the same network.
A static IP for the speaker is recommended, but not required.

#### Installation
Run the following command (in the root of your HAP-NodeJS folder) to install the necessary libraries to use this accessory.
```javascript
  npm install http xmldoc
```
After you have installed the required packages, put the BoseSpeaker_accessory.js file into your accessories folder, and then open it. At the top, you must change the ```speakerIP``` and the ```speakerName``` variables. Hence the name, the ```speakerIP``` variable is the IP address of the speaker on your local network. The ```speakerName``` variable can be whatever you want, and it can be changed when adding the accessory with the Home app.

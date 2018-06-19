const sensor = require('node-dht-sensor');

let Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-temperature-humidity-sensor', 'Temperature Sensor', Sensor);
  homebridge.registerAccessory('homebridge-temperature-humidity-sensor', 'Humidity Sensor', Sensor);
};

class Sensor {
  constructor(log, config) {
    this.log = log;
    this.name = config.name;
    this.pin = config.pin;
    this.currentTemperature = 22;
    this.currentRelativeHumidity = 50;
  }

  identify(callback) {
    this.log('Identify requested!');
    callback(null);
  }

  startReading() {
    this.getReading(() => {
      setTimeout(() => this.getReading(), 5000);
    });
  }

  getReading(callback) {
    sensor.read(22, this.pin, (err, temperature, humidity) => {
      callback();
      if (err) {
        console.error(err);
        return;
      }

      this.currentTemperature = temperature;
      this.currentRelativeHumidity = humidity;

      this.temperatureService.setCharacteristic(Characteristic.CurrentTemperature, this.currentTemperature);
      this.humidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, this.currentRelativeHumidity);
    });
  }

  getServices() {
    const informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Encore Dev Labs')
      .setCharacteristic(Characteristic.Model, 'Pi Temperature Sensor')
      .setCharacteristic(Characteristic.SerialNumber, 'Raspberry Pi');

    this.temperatureService = new Service.TemperatureSensor(this.name);
    this.temperatureService
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', (callback) => {
        callback(null, this.currentTemperature);
      });
    this.temperatureService
      .getCharacteristic(Characteristic.Name)
      .on('get', callback => {
        callback(null, this.name);
      });

    this.humidityService = new Service.HumiditySensor(this.name);
    this.humidityService
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on('get', (callback) => {
        callback(null, this.currentRelativeHumidity);
      });
    this.humidityService
      .getCharacteristic(Characteristic.Name)
      .on('get', callback => {
        callback(null, this.name);
      });

    this.startReading();

    return [informationService, this.currentTemperature, this.currentRelativeHumidity];
  }
}

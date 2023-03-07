/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const advlib = require('advlib-identifier');
const Raddec = require('raddec');
const binaryMessageDecoder = require('./binarymessagedecoder');


const DEFAULT_GET_READER_CONFIG_MESSAGE = '0402000000110000000000000100000000';
const DEFAULT_SET_READER_CONFIG_MESSAGE = '040300000010000000000000e2000580';
const DEFAULT_ADD_ROSPEC_MESSAGE = '0414000000500000000400b1004600000001000000b2001200b300050000b60009000000000000b700180001000000b80009000000000000ba000700090100ed001201000100ee000bffc0015c0005c0';
const DEFAULT_ENABLE_ROSPEC_MESSAGE = '04180000000e0000000000000001';
const DEFAULT_START_ROSPEC_MESSAGE = '04160000000e0000000000000001';
const DEFAULT_ENABLE_EVENTS_AND_REPORTS_MESSAGE = '04400000000a00000000';
const DEFAULT_KEEPALIVE_ACK_MESSAGE = '04480000000a00000000';


/**
 * LLRPDecoder Class
 * Decodes data streams from one or more LLRP readers and forwards the data
 * to the given BarnowlLlrp instance.
 */
class LlrpDecoder {

  /**
   * LlrpDecoder constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.barnowl = options.barnowl;
    this.readers = new Map();
  }

  /**
   * Handle data from a given device, specified by the origin
   * @param {Buffer} data The data as a buffer.
   * @param {String} origin The unique origin identifier of the device.
   * @param {Number} time The time of the data capture.
   * @param {Object} decodingOptions The packet decoding options.
   */
  handleData(data, origin, time, decodingOptions) {
    let self = this;
    let responses = [];
    let messages = binaryMessageDecoder.decode(data, origin, time,
                                               decodingOptions);

    messages.forEach((message) => {

      // Reporting message -> raddec
      if(message.type === 'RO_ACCESS_REPORT') {
        let raddec = prepareRaddec(message, self.readers.get(origin));
        if(raddec) { self.barnowl.handleRaddec(raddec); }
      }

      // Configuration message -> receiverId/Type
      else if(message.type === 'GET_READER_CONFIG_RESPONSE') {
        if(message.hasOwnProperty('Identification')) {
          let reader = {};
          reader.receiverId = message.Identification.ReaderID;
          reader.receiverIdType = (message.Identification.IDType === 0) ?
                                               Raddec.identifiers.TYPE_EUI64 :
                                               Raddec.identifiers.TYPE_UNKNOWN;
          self.readers.set(origin, reader);
        }
      }

      // Other messages -> possible response
      else {
        let isError = (message.hasOwnProperty('LLRPStatus') &&
                       (message.LLRPStatus.StatusCode > 0));
        if(isError) {
          console.log('barnowl-llrp error:',
                      message.LLRPStatus.ErrorDescription);
        }
        let response = prepareResponse(message);
        if(response) { responses.push(response); }
      }
    });

    return responses;
  }
}


/**
 * Prepare a raddec from the given message, if possible
 * @param {Object} message The decoded LLRP message.
 * @param {Object} reader The reader info, if known, null otherwise.
 */
function prepareRaddec(message, reader) {
  let raddec = null;
  let transmitterId = null;
  let transmitterIdType = Raddec.identifiers.TYPE_UNKNOWN;
  let timestamp = Date.now();
  let rssi = null;

  if(message.hasOwnProperty('TagReportData')) {
    if(message.TagReportData.hasOwnProperty('EPC-96')) {
      transmitterId = message.TagReportData['EPC-96'];
      transmitterIdType = Raddec.identifiers.TYPE_EPC96;
    }
    if(message.TagReportData.hasOwnProperty('LastSeenTimestampUTC')) {
      timestamp = Number(message.TagReportData.LastSeenTimestampUTC / 1000n);
    }
    if(message.TagReportData.hasOwnProperty('PeakRSSI')) {
      rssi = message.TagReportData.PeakRSSI;
    }
    if(message.TagReportData.hasOwnProperty('AntennaID')) {
      // TODO: handle Antenna ID
    }
  }

  if(transmitterId) {
    raddec = new Raddec({
      transmitterId: transmitterId,
      transmitterIdType: transmitterIdType,
      timestamp: timestamp
    });
    if(reader) {
      raddec.addDecoding({
        receiverId: reader.receiverId,
        receiverIdType: reader.receiverIdType,
        rssi: rssi
      });
    }
  }

  return raddec;
}


/**
 * Prepare a response to the given message, if required
 * @param {Object} message The decoded LLRP message.
 */
function prepareResponse(message) {
  switch(message.type) {
    case 'READER_EVENT_NOTIFICATION':
      return Buffer.from(DEFAULT_GET_READER_CONFIG_MESSAGE +
                         DEFAULT_SET_READER_CONFIG_MESSAGE, 'hex');

    case 'SET_READER_CONFIG_RESPONSE':
      return Buffer.from(DEFAULT_ADD_ROSPEC_MESSAGE, 'hex');
    case 'ADD_ROSPEC_RESPONSE':
      return Buffer.from(DEFAULT_ENABLE_ROSPEC_MESSAGE, 'hex');
    case 'ENABLE_ROSPEC_RESPONSE':
      return Buffer.from(DEFAULT_START_ROSPEC_MESSAGE, 'hex');
    case 'START_ROSPEC_RESPONSE':
      return Buffer.from(DEFAULT_ENABLE_EVENTS_AND_REPORTS_MESSAGE, 'hex');
    case 'KEEPALIVE':
      return Buffer.from(DEFAULT_KEEPALIVE_ACK_MESSAGE, 'hex');
  }

  return null;
}


module.exports = LlrpDecoder;

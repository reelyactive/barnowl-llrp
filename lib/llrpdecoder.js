/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const binaryMessageDecoder = require('./binarymessagedecoder');


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
    messages.raddecs.forEach((raddec) => {
      self.barnowl.handleRaddec(raddec);
    });

    messages.llrpMessages.forEach((message) => {
      let response = prepareResponse(message);
      if(response) {
        responses.push(response);
      }
    });

    return responses;
  }
}


/**
 * Prepare a response to the given message, if required
 * @param {Object} message The decoded LLRP message.
 */
function prepareResponse(message) {
  switch(message.name) {
    case 'READER_EVENT_NOTIFICATION':
      return Buffer.from('040300000010000000000000e2000580', 'hex');
    case 'SET_READER_CONFIG_RESPONSE':
      return Buffer.from('0414000000500000000400b1004600000001000000b2001200b300050000b60009000000000000b700180001000000b80009000000000000ba000700090100ed001201000100ee000bffc0015c0005c0', 'hex');
    case 'ADD_ROSPEC_RESPONSE':
      return Buffer.from('04180000000e0000000000000001', 'hex');
    case 'ENABLE_ROSPEC_RESPONSE':
      return Buffer.from('04160000000e0000000000000001', 'hex');
    case 'START_ROSPEC_RESPONSE':
      return Buffer.from('04400000000a00000000', 'hex');
    case 'KEEP_ALIVE':
      return Buffer.from('04480000000a00000000', 'hex');
  }

  return null;
}


module.exports = LlrpDecoder;

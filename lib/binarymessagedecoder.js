/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const advlib = require('advlib-identifier');
const Raddec = require('raddec');
const llrpConstants = require('./llrpconstants.js');


const MINIMUM_FRAME_LENGTH = 4;
const VERSION_1_0_1 = 1;
const VERSION_1_1 = 2;


/**
 * Determine if the given data is valid LLRP.
 * @param {Buffer} data The binary message as a buffer.
 */
function isValidLlrp(data) {
  let version = (data.readUInt8() >> 2) & 0x07;

  return (version === VERSION_1_1) || (version === VERSION_1_0_1);
}


/**
 * Decode parameters from the given message value.
 * @param {Buffer} messageValue The value segment of the LLRP message.
 */
function decodeParameters(messageValue) {
  let index = 0;
  let messageParameters = [];
  let parameterLength;
  let parameterConstants;

  while(index < messageValue.length) {
    let parameter = {};
    let isTVParameter = messageValue.readUInt8(index) & 0x80;

    // Type-Value (TV) encoding
    if(isTVParameter) {
      parameter.type = messageValue.readUInt8(index) & 0x7f;
      parameterProperties = llrpConstants.parameters.get(parameter.type);
      parameterLength = parameterProperties.length;
      parameter.name = parameterProperties.name;
      parameter.value = messageValue.slice(index + 1, index + parameterLength);
    }

    // Type-Length-Value (TLV) encoding
    else {
      parameter.type = messageValue.readUInt16BE(index) & 0x03ff;
      parameterLength = messageValue.readUInt16BE(index + 2);
      parameter.value = messageValue.slice(index + 4, index + parameterLength);
      parameterProperties = llrpConstants.parameters.get(parameter.type) ||
                            { name: "UNDEFINED" };
      parameter.name = parameterProperties.name;
    }

    switch(parameter.name) {
      case 'AntennaID':
        parameter.antennaId = parameter.value.readUInt16BE();
        break;
      case 'PeakRSSI':
        parameter.peakRssi = parameter.value.readInt8();
        break;
      case 'EPC-96':
        parameter.epc = parameter.value.toString('hex');
        break;
      case 'TagReportData':
        parameter.subParameters = decodeParameters(parameter.value);
        break;
    }

    messageParameters.push(parameter);
    index += parameterLength;
  }

  return messageParameters;
}


/**
 * Decode a single message from the given buffer and offset.
 * @param {Buffer} data The binary message as a buffer.
 * @param {Number} index The byte index of the start of the message.
 * @param {Object} messages The raddec and llrp message arrays.
 * @param {String} receiverId The identifier of the receiver.
 * @param {Number} timestamp The optional timestamp override of the decoding.
 */
function decodeMessage(data, index, messages, receiverId, timestamp) {
  let messageType = data.readUInt16BE(index) & 0x03ff;
  let messageLength = data.readUInt32BE(index + 2);
  let messageId = data.readUInt32BE(index + 6);
  let messageValue = data.slice(index + 10, index + messageLength);
  let messageParameters = decodeParameters(messageValue);
  let messageProperties = llrpConstants.messages.get(messageType) ||
                          { name: "UNDEFINED" };

  // TODO: raddec

  messages.llrpMessages.push({
      type: messageType,
      name: messageProperties.name,
      id: messageId,
      parameters: messageParameters
  });

  return messageLength;
}


/**
 * Decode all the binary messages from the data buffer.
 * @param {Buffer} data The binary packet as a buffer.
 * @param {String} origin Origin of the data stream.
 * @param {Number} time The time of the data capture.
 * @param {Object} options The packet decoding options.
 */
function decode(data, origin, time, options) {
  let messages = { raddecs: [], llrpMessages: [] };
  let index = 0;
  let isTooShort = (data.length < MINIMUM_FRAME_LENGTH);

  while(!isTooShort && isValidLlrp(data, index)) {
    let length = decodeMessage(data, index, messages, null, time);

    index += length;
    isTooShort = (data.length < (index + MINIMUM_FRAME_LENGTH));
  }

  return messages;
}


module.exports.decode = decode;

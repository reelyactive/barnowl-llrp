/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


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
 * Decode a single message parameter.
 * See LLRP Version 1.1 Ratified Standard, Section 17.2
 * @param {String} name The name of the parameter.
 * @param {Buffer} value The binary value of the parameter.
 */
function decodeParameter(name, value) {
  switch(name) {
    case 'AntennaID':
    case 'SpecIndex':
    case 'InventoryParameterSpecID':
    case 'ChannelIndex':
    case 'TagSeenCount':
    case 'C1G2PC':
    case 'ConnectionEventAttempt':
      return value.readUInt16BE();
    case 'PeakRSSI':
      return value.readInt8();
    case 'EPC-96':
      return value.toString('hex');
    case 'ROSpecID':
      return value.readUInt32BE();
    case 'FirstSeenTimestampUTC':
    case 'LastSeenTimestampUTC':
    case 'FirstSeenTimestampUptimeUTC':
    case 'LastSeenTimestampUptimeUTC':
    case 'UTCTimestamp':
    case 'Uptime':
      return value.readBigUInt64BE();
    case 'ReaderEventNotificationData':
    case 'TagReportData':
      return decodeParameters(value);
    case 'Identification':
      let IDType = value.readUInt8();
      let ByteCount = value.readUInt16BE(1);
      return { IDType: IDType,
               ReaderID: value.slice(3, 3 + ByteCount).toString('hex') }
    case 'LLRPStatus':
      let StatusCode = value.readUInt16BE();
      let errorLength = value.readUInt16BE(2);
      let ErrorDescription = value.toString('utf-8', 4, 4 + errorLength);
      return Object.assign({ StatusCode: StatusCode,
                             ErrorDescription: ErrorDescription },
                           decodeParameters(value.slice(4 + errorLength)));
    case 'FieldError':
      return { FieldNum: value.readUInt16BE(),
               ErrorCode: value.readUInt16BE(2) };
    case 'ParameterError':
      return Object.assign({ ParameterType: value.readUInt16BE(),
                             ErrorCode: value.readUInt16BE(2) },
                           decodeParameters(value.slice(4)));
    default:
      return value.toString('hex');
  }
}


/**
 * Decode parameters from the given message value.
 * @param {Buffer} messageValue The value segment of the LLRP message.
 */
function decodeParameters(messageValue) {
  let index = 0;
  let parameters = {};
  let parameterLength;
  let parameterConstants;

  while(index < messageValue.length) {
    let parameter = {};
    let isTVParameter = messageValue.readUInt8(index) & 0x80;

    // Type-Value (TV) encoding
    if(isTVParameter) {
      parameter.type = messageValue.readUInt8(index) & 0x7f;
      parameterProperties = llrpConstants.parameters.get(parameter.type) ||
                            { name: parameter.type };
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
                            { name: parameter.type };
      parameter.name = parameterProperties.name;
    }

    parameters[parameter.name] = decodeParameter(parameter.name,
                                                 parameter.value);
    index += parameterLength;
  }

  return parameters;
}


/**
 * Decode a single message from the given buffer and offset.
 * See LLRP Version 1.1 Ratified Standard, Section 17.1
 * @param {Buffer} data The binary message as a buffer.
 * @param {Number} index The byte index of the start of the message.
 * @param {Array} messages The decoded messages on which to append.
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
                          { name: messageType };
  let message = Object.assign({ type: messageProperties.name, id: messageId },
                              messageParameters);

  messages.push(message);

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
  let messages = [];
  let index = 0;
  let isTooShort = (data.length < MINIMUM_FRAME_LENGTH);

  try {
    while(!isTooShort && isValidLlrp(data, index)) {
      let length = decodeMessage(data, index, messages, null, time);

      index += length;
      isTooShort = (data.length < (index + MINIMUM_FRAME_LENGTH));
    }
  }
  catch(error) { /* TODO: handle errors */ }

  return messages;
}


module.exports.decode = decode;

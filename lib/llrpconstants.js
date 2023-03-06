/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


// See LLRP Version 1.1 Ratified Standard, Section 17.4
const LLRP_MESSAGES = new Map([
    [ 12, { name: "GET_READER_CONFIG_RESPONSE" } ],
    [ 13, { name: "SET_READER_CONFIG_RESPONSE" } ],
    [ 30, { name: "ADD_ROSPEC_RESPONSE" } ],
    [ 32, { name: "START_ROSPEC_RESPONSE" } ],
    [ 34, { name: "ENABLE_ROSPEC_RESPONSE" } ],
    [ 61, { name: "RO_ACCESS_REPORT" } ],
    [ 62, { name: "KEEPALIVE" } ],
    [ 63, { name: "READER_EVENT_NOTIFICATION" } ]
]);
const LLRP_PARAMETERS = new Map([
    // TV-encoded (fixed-length)
    [ 1, { name: "AntennaID", length: 3 } ],
    [ 2, { name: "FirstSeenTimestampUTC", length: 9 } ],
    [ 3, { name: "FirstSeenTimestampUptime", length: 9 } ],
    [ 4, { name: "LastSeenTimestampUTC", length: 9 } ],
    [ 5, { name: "LastSeenTimestampUptime", length: 9 } ],
    [ 6, { name: "PeakRSSI", length: 2 } ],
    [ 7, { name: "ChannelIndex", length: 3 } ],
    [ 8, { name: "TagSeenCount", length: 3 } ],
    [ 9, { name: "ROSpecID", length: 5 } ],
    [ 10, { name: "InventoryParameterSpecID", length: 3 } ],
    [ 11, { name: "C1G2CRC", length: 4 } ],
    [ 12, { name: "C1G2PC", length: 4 } ],
    [ 13, { name: "EPC-96", length: 13 } ],
    [ 14, { name: "SpecIndex", length: 3 } ],
    [ 15, { name: "ClientRequestOpSpecResult", length: 3 } ],
    [ 16, { name: "AccessSpecID", length: 5 } ],
    [ 17, { name: "OpSpecID", length: 3 } ],
    [ 18, { name: "C1G2SingulationDetails", length: 5 } ],
    [ 19, { name: "C1G2XPCW1", length: 4 } ],
    [ 20, { name: "C1G2XPCW2", length: 4 } ],
    // TLV-encoded
    [ 128, { name: "UTCTimestamp" } ],
    [ 129, { name: "Uptime" } ],
    [ 218, { name: "Identification" } ],
    [ 240, { name: "TagReportData" } ],
    [ 246, { name: "ReaderEventNotificationData" } ],
    [ 256, { name: "ConnectionEventAttempt" } ],
    [ 287, { name: "LLRPStatus" } ],
    [ 288, { name: "FieldError" } ],
    [ 289, { name: "ParameterError" } ]
]);


module.exports.messages = LLRP_MESSAGES;
module.exports.parameters = LLRP_PARAMETERS;
/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const net = require('net');


const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 5084;


/**
 * TcpSocketListener Class
 * Listens for LLRP data via TCP socket connection.
 */
class TcpSocketListener {

  /**
   * TcpSocketListener constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.decoder = options.decoder;

    createTcpSocket(this, options.host, options.port);
  }

}


/**
 * Create the TCP socket and handle events.
 * @param {TcpSocketListener} instance The TcpSocketListener instance.
 * @param {String} host The host.
 * @param {Number} port The port on which to listen.
 */
function createTcpSocket(instance, host, port) {
  host = host || DEFAULT_HOST;
  port = port || DEFAULT_PORT;

  let origin = host + ':' + port;
  let client = net.createConnection({ port: port, host: host });

  client.on('connect', () => {
    console.log('barnowl-llrp: Socket connection to', origin);
  });
  client.on('timeout', () => {
    return console.log('barnowl-llrp: Socket timeout on', origin);
  });
  client.on('error', (err) => {
    console.log('barnowl-llrp:', err);
  });
  client.on('data', (data) => {
    let responses = instance.decoder.handleData(data, origin, Date.now());

    responses.forEach((response) => client.write(response));
  });
}


module.exports = TcpSocketListener;

/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const EventEmitter = require('events').EventEmitter;
const TcpSocketListener = require('./tcpsocketlistener.js');


/**
 * BarnowlLlrp Class
 * Converts LLRP reads into standard raddec events.
 * @param {Object} options The options as a JSON object.
 */
class BarnowlLlrp extends EventEmitter {

  /**
   * BarnowlMinew constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    super();
    options = options || {};
    options.barnowl = this;

    this.listeners = [];
  }

  /**
   * Add a listener to the given hardware interface.
   * @param {Class} ListenerClass The (uninstantiated) listener class.
   * @param {Object} options The options as a JSON object.
   */
  addListener(ListenerClass, options) {
    options = options || {};

    let listener = new ListenerClass(options);
    this.listeners.push(listener);
  }

  /**
   * Handle and emit the given raddec.
   * @param {Raddec} raddec The given Raddec instance.
   */
  handleRaddec(raddec) {
    // TODO: observe options to normalise raddec
    this.emit("raddec", raddec);
  }

  /**
   * Handle and emit the given infrastructure message.
   * @param {Object} message The given infrastructure message.
   */
  handleInfrastructureMessage(message) {
    this.emit("infrastructureMessage", message);
  }
}


module.exports = BarnowlLlrp;
module.exports.TcpSocketListener = TcpSocketListener;

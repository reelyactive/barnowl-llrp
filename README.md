barnowl-llrp
============

__barnowl-llrp__ converts the decodings of _any_ ambient RAIN RFID tags by readers supporting the Low-Level Reader Protocol (LLRP) into standard developer-friendly JSON that is vendor/technology/application-agnostic.

![Overview of barnowl-llrp](https://reelyactive.github.io/barnowl-llrp/images/overview.png)

__barnowl-llrp__ is a lightweight [Node.js package](https://www.npmjs.com/package/barnowl-llrp) that can run on resource-constrained edge devices as well as on powerful cloud servers and anything in between.  It supports native integration with reelyActive's [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source middleware suite, and can just as easily be run standalone behind a [barnowl](https://github.com/reelyactive/barnowl) instance, as detailed in the code examples below.


Getting Started
---------------

Learn "owl" about the __raddec__ JSON data output:
-  [reelyActive Developer's Cheatsheet](https://reelyactive.github.io/diy/cheatsheet/)


Quick Start
-----------

Clone this repository, install package dependencies with `npm install`, and then from the root folder run at any time:

    npm start xxx.xxx.xxx.xxx

__barnowl-llrp__ will connect with the reader at IP address xxx.xxx.xxx.xxx and output (flattened) __raddec__ JSON to the console.


Hello barnowl-llrp!
-------------------

Developing an application directly from __barnowl-llrp__?  Start by pasting the code below into a file called server.js:

```javascript
const Barnowl = require('barnowl');
const BarnowlLlrp = require('barnowl-llrp');

let barnowl = new Barnowl({ enableMixing: true });

barnowl.addListener(BarnowlLlrp, {}, BarnowlLlrp.TcpSocketListener,
                    { host: "12.34.56.78" });

barnowl.on('raddec', (raddec) => {
  console.log(raddec);
  // Trigger your application logic here
});
```

From the same folder as the server.js file, install package dependencies with the commands `npm install barnowl-llrp` and `npm install barnowl`.  Then run the code with the command `node server.js` and observe the stream of radio decodings (raddec objects) output to the console:

```javascript
{
  transmitterId: "a00000000000000000001234",
  transmitterIdType: 5,
  rssiSignature: [
    {
      receiverId: "001625ffffffffff",
      receiverIdType: 1,
      receiverAntenna: 1,
      rssi: -42,
      numberOfDecodings: 1
    }
  ],
  timestamp: 1645568542222
}
```

See the [Supported Listener Interfaces](#supported-listener-interfaces) below to adapt the code to listen for your gateway(s).


Supported Listener Interfaces
-----------------------------

The following listener interfaces are supported by __barnowl-llrp__.

### TCP Socket

```javascript
barnowl.addListener(BarnowlLlrp, {}, BarnowlLlrp.TcpSocketListener,
                    { host: "12.34.56.78", port: 5084 });
```


Pareto Anywhere Integration
---------------------------

__barnowl-llrp__ includes a script to forward data to a local [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) instance as UDP raddecs with target localhost:50001.  Start this script with the command:

    npm run forwarder xxx.xxx.xxx.xxx

where xxx.xxx.xxx.xxx is the IP address of the reader.


Compatible RFID Readers
-----------------------

__barnowl-llrp__ has been validated with the following readers:

- Impinj R420

In theory, _any_ LLRP-compatible reader should be compatible.


Is that owl you can do?
-----------------------

While __barnowl-llrp__ may suffice standalone for simple real-time applications, its functionality can be greatly extended with the following software packages:
- [advlib-epc](https://github.com/reelyactive/advlib-epc) to decode the Electronic Product Code (EPC) into JSON
- [barnowl](https://github.com/reelyactive/barnowl) to combine parallel streams of RF decoding data in a technology-and-vendor-agnostic way

These packages and more are bundled together as the [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere) open source middleware suite, which includes a variety of __barnowl-x__ listeners, APIs and interactive web apps.


Acknowledgements
----------------

__barnowl-llrp__ was initially developed using [llrp-nodejs](https://github.com/GeenenTijd/llrp-nodejs) & [RFID-nodejs](https://github.com/Sterling-Technologies/RFID-nodejs) as examples, and to whose authors we extend our thanks.


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.

[![Known Vulnerabilities](https://snyk.io/test/github/reelyactive/barnowl-llrp/badge.svg)](https://snyk.io/test/github/reelyactive/barnowl-llrp)


License
-------

MIT License

Copyright (c) 2023 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
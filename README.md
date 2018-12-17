# iot-client

A simple IoT client service.

To reduce the load the Proof Of Work is deligated to a trusted node.
See ```services/proof-of-work.js``` for complete details.

Developped on RPi3 with Raspbian Stretch. 

**Bootstrap a new IoT device**

```
git clone https://github.com/bytes-io/iot-client.git
cd iot-client
sh ./create-iota-seed.sh
npm install
npm start
```


**Future developments:**

- Dockarize the client
- Auto detection and generation of IOTA wallet

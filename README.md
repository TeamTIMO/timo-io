# TIMO - IO Microservice

Reads and writes from the serial interface to communicate with the arduino.

Reads Incoming Sockets to Send Commands to the Arduino.

Emits Sockets on Retreived Messages from Arduino.

## Commands

All Commands have specific titles and bodys.

The Format is: __title:body__

The Serialport-Title is __io__

### From Arduino

#### Scanned Card

* id (Has ID in body, fired after detection of id on card)
* cardwrite (Has Result in body, fired after write to card is complete)

#### LED

* led (Has rgb value in body, fired when led changes value)

#### Button

* button (Has buttonID and Status in body, fired on press and release of button)

### To Arduino

#### Write Card

* setid (body is id)

#### LED

* setled (body is rgb value)

---

## TODO

* complete command list
* README (like data)
* Testing
* jsdoc
* puml sequence
* test app.js
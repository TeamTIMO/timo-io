TIMO - IO Microservice
========================

Reads and writes from the serial interface to communicate with the arduino.
Reads Incoming Sockets to Send Commands to the Arduino.  
Emits Sockets on Retreived Messages from Arduino.  

# Commands
All Commands have specific titles and bodys.

## From Arduino

### Scanned QR-Code
* qr (Has ID in body, fired after detection of qr-code)
* qrwrite (Has Result in body, fired after write to qr is complete)

### LED
* led (Has rgb value in body, fired when led changes value)

### Button
* button (Has buttonID and Status in body, fired on press and release of button)

## To Arduino

### Write QR-Code
* setqr (body is id)

### LED
* setled (body is rgb value)

# TODO
* complete command list
* code app.js
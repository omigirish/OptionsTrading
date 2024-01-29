const net = require('net');

const host = 'localhost';
const port = 9011;

function connectToServer() {
  const client = net.createConnection({ host, port }, () => {
    console.log('Connected to the server');

    // Send the initial request
    client.write(Buffer.from([0x01])); // Send a single byte with value 0x01
  });

  let receivedData = Buffer.alloc(0);

  client.on('data', (data) => {
    receivedData = Buffer.concat([receivedData, data]);

    while (receivedData.length >= 130) {
      const packetData = receivedData.slice(0, 130);
      receivedData = receivedData.slice(130);

      receiveSnapshotData(packetData);
    }
  });

  client.on('close', () => {
    console.log('Connection closed');
  });

  client.on('error', (error) => {
    console.error('An error occurred:', error.message);
  });
}

function receiveSnapshotData(data) {
  // Parse and process the packet data
  const symbol = data.toString('utf-8', 4, 34).replace(/\0+$/, '');
  const sequenceNumber = data.readBigInt64LE(34);
  const timestamp = data.readBigInt64LE(42);
  const ltp = data.readBigInt64LE(50) / BigInt(100);
  const ltpQuantity = data.readBigInt64LE(58);
  const volume = data.readBigInt64LE(66);
  const bidPrice = data.readBigInt64LE(74) / BigInt(100);
  const bidQuantity = data.readBigInt64LE(82);
  const askPrice = data.readBigInt64LE(90) / BigInt(100);
  const askQuantity = data.readBigInt64LE(98);
  const openInterest = data.readBigInt64LE(106);
  const prevClosePrice = data.readBigInt64LE(114) / BigInt(100);
  const prevOpenInterest = data.readBigInt64LE(122);

  // Process the received snapshot data
  console.log('Symbol:', symbol);
  console.log('Sequence Number:', sequenceNumber.toString());
  console.log('Timestamp:', timestamp.toString());
  console.log('Last Traded Price (LTP):', ltp.toString());
  console.log('Last Traded Quantity:', ltpQuantity.toString());
  console.log('Volume:', volume.toString());
  console.log('Bid Price:', bidPrice.toString());
  console.log('Bid Quantity:', bidQuantity.toString());
  console.log('Ask Price:', askPrice.toString());
  console.log('Ask Quantity:', askQuantity.toString());
  console.log('Open Interest (OI):', openInterest.toString());
  console.log('Previous Close Price:', prevClosePrice.toString());
  console.log('Previous Open Interest:', prevOpenInterest.toString());
  console.log('---------------------');
}

// Connect to the server
connectToServer();

const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: '*',
    }
});;
const net = require('net');

// Port Config
const host = 'localhost';
const port = 9011;

io.on('connection', (socket) => {
    console.log('Socket client connected');
    // Handle snapshot data requests from the client
    socket.on('requestSnapshotData', () => {
        connectToServer(socket);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Socket client disconnected');
    });
});

function connectToServer(socket) {
    const client = net.createConnection({ host, port }, () => {
        console.log('Connected to Market Data Streaming Server...');
        console.log('Sending Initial Byte Stream....')
        // Send the initial request
        client.write(Buffer.from([0x01])); // Send a single byte with value 0x01
    });

    let receivedData = Buffer.alloc(0);

    client.on('data', (data) => {
        receivedData = Buffer.concat([receivedData, data]);

        while (receivedData.length >= 130) {
            const packetData = receivedData.slice(0, 130);
            receivedData = receivedData.slice(130);

            receiveSnapshotData(packetData, socket);
        }
    });

    client.on('close', () => {
        console.log('Connection closed');
    });

    client.on('error', (error) => {
        console.error('An error occurred:', error.message);
    });
}

function receiveSnapshotData(data, socket) {
    // Parse and process the packet data

    const symbol = data.toString('utf-8', 4, 34).replace(/\0+$/, '');
    var underlying = "";
    var expiryDate = "";
    var strikePrice = "";
    var optionType = "";

    let endIndex = -1;
    ['ALLBANKS', 'MAINIDX', 'FINANCIALS','MIDCAPS'].some(substring => {
        const startIndex = symbol.indexOf(substring);
        if (startIndex !== -1) {
            underlying = substring;
            endIndex = startIndex + substring.length;
            expiryDate = symbol.substring(endIndex, endIndex + 7) || "Spot Price"
        }
    });

    strikePrice = symbol.substring(endIndex + 7, symbol.length - 2) || "Futures";
    optionType = symbol.substring(symbol.length - 2, symbol.length) || "--";

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

    if (optionType == "CE" || optionType == "PE") {

        // Emit the received snapshot data to the connected socket client
        socket.emit('snapshotData', {
            // streamType: "DataStream",
            key:
            {
                underlying: underlying.toString(),
                expiryDate: expiryDate.toString()
            },
            strike: strikePrice.toString(),

            optionType: optionType.toString(),
            data: {
                // sequenceNumber: sequenceNumber.toString(),
                expiryDate: expiryDate.toString(),
                timestamp: timestamp.toString(),
                ltp: ltp.toString(),
                ltpQuantity: ltpQuantity.toString(),
                volume: volume.toString(),
                bidPrice: bidPrice.toString(),
                bidQuantity: bidQuantity.toString(),
                askPrice: askPrice.toString(),
                askQuantity: askQuantity.toString(),
                openInterest: openInterest.toString(),
                prevClosePrice: prevClosePrice.toString(),
                prevOpenInterest: prevOpenInterest.toString(),
                optionType: optionType.toString()
            }

        });
    }

    if (expiryDate == "Spot Price") {
        socket.emit('snapshotData', {
            streamType:"SpotPriceUpdate",
            underlying: underlying.toString(),
            ltp: ltp.toString(),
            prevClosePrice: prevClosePrice.toString(),
            timestamp: timestamp.toString(),
        })
    }

}



// Start the server
http.listen(3000, () => {
    console.log('Server is running on port 3000');
});

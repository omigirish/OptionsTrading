import websocket
import struct
import zlib

def on_open(ws):
    print('Socket connected')
    send_initial_request(ws)

def on_message(ws, message):
    market_data = process_market_data_packet(message)
    print('Received market data:', market_data)

def on_close(ws):
    print('Socket closed')

def on_error(ws, error):
    print('Socket error:', error)

def send_initial_request(ws):
    initial_request = bytes([0x01])  # Send a single byte packet to indicate readiness
    ws.send(initial_request)

def process_market_data_packet(data):
    decompressed_data = zlib.decompress(data)
    packet_length = struct.unpack('<i', decompressed_data[:4])[0]
    trading_symbol = decode_trading_symbol(decompressed_data[4:34])
    sequence_number = struct.unpack('<q', decompressed_data[34:42])[0]
    timestamp = struct.unpack('<q', decompressed_data[42:50])[0]
    last_traded_price = struct.unpack('<q', decompressed_data[50:58])[0]
    last_traded_quantity = struct.unpack('<q', decompressed_data[58:66])[0]
    volume = struct.unpack('<q', decompressed_data[66:74])[0]
    bid_price = struct.unpack('<q', decompressed_data[74:82])[0]
    bid_quantity = struct.unpack('<q', decompressed_data[82:90])[0]
    ask_price = struct.unpack('<q', decompressed_data[90:98])[0]
    ask_quantity = struct.unpack('<q', decompressed_data[98:106])[0]
    open_interest = struct.unpack('<q', decompressed_data[106:114])[0]
    previous_close_price = struct.unpack('<q', decompressed_data[114:122])[0]
    previous_open_interest = struct.unpack('<q', decompressed_data[122:130])[0]

    market_data = {
        'packetLength': packet_length,
        'tradingSymbol': trading_symbol,
        'sequenceNumber': sequence_number,
        'timestamp': timestamp,
        'lastTradedPrice': last_traded_price,
        'lastTradedQuantity': last_traded_quantity,
        'volume': volume,
        'bidPrice': bid_price,
        'bidQuantity': bid_quantity,
        'askPrice': ask_price,
        'askQuantity': ask_quantity,
        'openInterest': open_interest,
        'previousClosePrice': previous_close_price,
        'previousOpenInterest': previous_open_interest
    }

    return market_data

def decode_trading_symbol(data):
    try:
        return data.decode('utf-8').strip('\x00')
    except UnicodeDecodeError:
        return decode_little_endian(data)

def decode_little_endian(data):
    return int.from_bytes(data, byteorder='little')

websocket.enableTrace(True)
socket_url = 'ws://localhost:9011/'  # Replace with the actual socket URL
ws = websocket.WebSocketApp(socket_url,
                            on_open=on_open,
                            on_message=on_message,
                            on_close=on_close,
                            on_error=on_error)

ws.run_forever()

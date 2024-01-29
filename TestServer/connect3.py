import socket
import struct

def connect_to_server(host, port):
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect((host, port))
    return client_socket

def send_initial_request(client_socket):
    client_socket.send(b'\x01')

def receive_snapshot_data(client_socket):
    # Read the packet length field
    packet_data = client_socket.recv(130)
    packet_length = struct.unpack('<i', packet_data[:4])[0]

    # Parse and process the packet data
    symbol = packet_data[4:34].decode('utf-8').strip('\x00')
    sequence_number = struct.unpack('<q', packet_data[34:42])[0]
    timestamp = struct.unpack('<q', packet_data[42:50])[0]
    ltp = struct.unpack('<q', packet_data[50:58])[0] / 100
    ltp_quantity = struct.unpack('<q', packet_data[58:66])[0]
    volume = struct.unpack('<q', packet_data[66:74])[0]
    bid_price = struct.unpack('<q', packet_data[74:82])[0] / 100
    bid_quantity = struct.unpack('<q', packet_data[82:90])[0]
    ask_price = struct.unpack('<q', packet_data[90:98])[0] / 100
    ask_quantity = struct.unpack('<q', packet_data[98:106])[0]
    open_interest = struct.unpack('<q', packet_data[106:114])[0]
    prev_close_price = struct.unpack('<q', packet_data[114:122])[0] / 100
    prev_open_interest = struct.unpack('<q', packet_data[122:130])[0]

    # Process the received snapshot data
    print("Symbol:", symbol)
    print("Sequence Number:", sequence_number)
    print("Timestamp:", timestamp)
    print("Last Traded Price (LTP):", ltp)
    print("Last Traded Quantity:", ltp_quantity)
    print("Volume:", volume)
    print("Bid Price:", bid_price)
    print("Bid Quantity:", bid_quantity)
    print("Ask Price:", ask_price)
    print("Ask Quantity:", ask_quantity)
    print("Open Interest (OI):", open_interest)
    print("Previous Close Price:", prev_close_price)
    print("Previous Open Interest:", prev_open_interest)
    print("---------------------")

# Set the host and port based on the server configuration
host = 'localhost'
port = 9011

# Connect to the server
client_socket = connect_to_server(host, port)

# Send the initial request
send_initial_request(client_socket)

# Continuously receive and process the snapshot data
while True:
    try:
        receive_snapshot_data(client_socket)
    except KeyboardInterrupt:
        break
    # except:
    #     pass

# Close the connection
client_socket.close()

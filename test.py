from bluetooth import *

iots = ['light', 'boiler', 'fan']
max_len = len(iots)

socket = BluetoothSocket( RFCOMM )
socket.connect(('98:D3:31:FB:86:EE', 1))

count = 0
idx = 0
dict = {}

while True:
    while True:
        byte_data = socket.recv(4096)
        data = byte_data.decode('utf-8')

        if count == 0:
            if data is not 'q':
                continue
            else:
                count += 1
                continue
        elif count == 1:
            if data is ' ':
                continue
            elif data is 'q':
                break
            else:
                print(data)
                if idx >= max_len:
                    dict = {}
                    break
                dict[iots[idx]] = data
                idx += 1

    print('dict : ', dict)
    count = 0
    idx = 0
    dict = {}
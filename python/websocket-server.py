import serial
import serial.tools.list_ports
import asyncio
import websockets
import time
import json

def listPorts():
    return [x.device for x in serial.tools.list_ports.comports()]

def portLoop(listener):
    async def portLoopInner(ws, path):
        try:
            while True:
                async for message in listener():
                    await ws.send(json.dumps(message))
        except e:
            print('ERROR')
            print(e)
    return portLoopInner

def makeListeners(connections):
    async def listenState():
        state = {connection.port: {"cd": False, "ri": False, "cts": False, "dsr": False} for connection in connections}
        cons = {connection.port: connection for connection in connections}
        while True:
            for dev in state:
                for key in state[dev]:
                    val = getattr(cons[dev], key)
                    if state[dev][key] != val:
                        state[dev][key] = val
                        if val:
                            yield {"dev": dev, "sig": key, "time": time.time()}
            await asyncio.sleep(0.01)
    return listenState

def main():
    connections = []
    for dev in listPorts():
        try:
            connections.append(serial.Serial(dev))
        except:
            pass
    listener = makeListeners(connections)
    start_server = websockets.serve(portLoop(listener), 'localhost', 8765)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()

if __name__ == '__main__':
    print("STARTING")
    main()
import { Server } from './server';
import WebSocket from 'ws';

describe('websocket Server', () => {
  const server = new Server(3100, 3200);
  const chargerA = new WebSocket('ws://localhost:3100/chargers/c1234');
  const chargerE = new WebSocket('ws://localhost:3100/chargers/c5678');
  const chargerI = new WebSocket('ws://localhost:3100/chargers/c9012');
  const widgetA = new WebSocket('ws://localhost:3200/widgets/wABCD');
  const widgetE = new WebSocket('ws://localhost:3200/widgets/wEFGH');
  const devices = [
    chargerA,
    chargerE,
    chargerI,
    widgetA,
    widgetE
  ];

  async function connect() {
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (devices.every((device) => device.readyState === WebSocket.OPEN)) {
          resolve();

          return;
        }

        if (devices.some((device) => device.readyState !== WebSocket.OPEN)) {
          reject();
        }
      }, 500);
    });
  }

  async function disconnect(devices) {
    devices.forEach((device) => {
      device.close();
    });

    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (devices.every((device) => device.readyState === WebSocket.CLOSED)) {
          resolve();

          return;
        }

        if (devices.some((device) => device.readyState !== WebSocket.CLOSED)) {
          reject();
        }
      }, 800);
    });
  }

  beforeAll(async () => {
    server.start();
    await connect();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await disconnect(devices);
    server.stop();
  });

  it('chargers and widgets clients are all connected', () => {
    devices.forEach((device) => {
      expect(device.readyState).toStrictEqual(1);
    });
  });

  it('widgets are connected to server', () => {
    expect(Object.keys(server.connectedWidgets)).toHaveLength(2);
  });

  it('widgetA recieves message from chargerA', () => {
    const message = JSON.stringify({
      event: 'StateOfCharge',
      data: {
        soc: 70
      }
    });

    chargerA.send(message);
    widgetA.once('message', (message) => {
      const recieved = JSON.parse(message);
      expect(recieved.data.status).toStrictEqual('charging');
    });
  });

  it('widgetA recieves update from chargerA', async () => {
    const message1 = JSON.stringify({
      event: 'StateOfCharge',
      data: {
        soc: 70
      }
    });
    const message2 = JSON.stringify({
      event: 'StateOfCharge',
      data: {
        soc: 80
      }
    });

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        chargerA.send(message1);
        resolve();
      }, 100);
    });
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        chargerA.send(message2);
        resolve();
      }, 200);
    });

    widgetA.on('message', (message) => {
      const recieved = JSON.parse(String(message));
      expect(recieved.data.status).toStrictEqual('charging80');
    });
  });

  it('message to disconnected widgetE is stored', async () => {
    const message100 = JSON.stringify({
      event: 'StateOfCharge',
      data: {
        soc: 100
      }
    });
    void widgetE.close();
    widgetE.on('close', () => {
      chargerE.send(message100);
    });

    const widgetMessage = '{"event":"chargingStatus","data":{"status":"charged"}}';

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(server.unsentMessages.wEFGH).toStrictEqual(widgetMessage);
        resolve();
      }, 100);
    });
  });

  it('chargerA sends invalid message', async () => {
    const badMessage = JSON.stringify({
      event: 'StateOfCharge',
      data: {
        soc: 101
      }
    });

    void widgetA.close();
    widgetA.on('close', () => {
      chargerA.send(badMessage);
    });

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(server.unsentMessages.wABCD).toBeNull();
        resolve();
      }, 300);
    });
  });

  it('widgetE back online - It gets update from chargerE', async () => {
    const chargingMessage = JSON.stringify({
      event: 'StateOfCharge',
      data: {
        soc: 25
      }
    });

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        void widgetE.close();
        widgetE.on('close', () => {
          chargerE.send(chargingMessage);
        });
        resolve();
      }, 400);
    });

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const widgetEBack = new WebSocket('ws://localhost:3200/widgets/wEFGH');
        widgetEBack.readyState = WebSocket.OPEN;
        widgetEBack.once('message', (chargingMessage) => {
          const recieved = JSON.parse(String(chargingMessage));
          expect(recieved.data.status).toStrictEqual('charging');
        });

        resolve();
      }, 600);
    });
  });
});

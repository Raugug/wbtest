import WebSocket from 'ws';

export class ConnectionToServer {

  protected ws: WebSocket;
  private readonly url: string;
  constructor({ url, id }: { url: string; id: string }) {
    this.url = `${url}/${id}`;
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        return resolve();
      });

      this.ws.on('close', () => {
        return process.exit();
      });

      this.ws.on('error', (error) => {
        console.log(error);
        return reject(new Error('error-connecting-to-server'));
      });
    });
  }

  public async sendSoC(soc: number): Promise<void> {
    const socMessage = {
      event: 'StateOfCharge',
      data: {
        soc
      }
    };

    return new Promise((resolve) => {
      this.ws.send(JSON.stringify(socMessage), () => {
        console.log(' - Sent SOC', socMessage);
        resolve();
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public getSendSoCFn() {
    return this.sendSoC.bind(this);
  }

}

export function createConnectionToServer({
  url,
  id
}: {
  url: string;
  id: string;
}): ConnectionToServer {
  return new ConnectionToServer({ url, id });
}

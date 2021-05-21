import WebSocket from 'ws';

export class Server {

  public connectedWidgets: Record<string, WebSocket>;
  public unsentMessages: Record<string, string>;
  public wsChargersServer: WebSocket.Server;
  public wsWidgetsServer: WebSocket.Server;
  protected chargersPort: number;
  protected widgetsPort: number;

  constructor(
    chargersPort: number,
    widgetsPort: number
  ) {
    this.chargersPort = chargersPort;
    this.widgetsPort = widgetsPort;
    this.unsentMessages = {};
    this.connectedWidgets = {};

    this.wsChargersServer = new WebSocket.Server({
      port: this.chargersPort
    });
    this.wsWidgetsServer = new WebSocket.Server({
      port: this.widgetsPort
    });
  }

  public start(): void {
    console.log('Server rolling.');

    this.wsChargersServer.on('connection', (websocket, request) => {
      const { url } = request;
      const chargerId = url.substring(url.length - 5);
      console.log(`[${chargerId}-Charger]: Connected`);

      const widgetId = this.getWidgetId(chargerId.substring(1));
      this.unsentMessages[widgetId] = null;

      websocket.on('message', (data) => {
        console.log(`[${chargerId}-Charger]: Message Incoming...`);

        if (!this.isValidMessage(String(data))) {
          console.log(`[${chargerId}-Charger]: Invalid message`);

          return;
        }

        if (!this.connectedWidgets[widgetId] || this.connectedWidgets[widgetId].readyState !== WebSocket.OPEN) {
          console.log(`[${widgetId}-Widget]: Widget not available. Message stored`);
          this.unsentMessages[widgetId] = this.getWidgetMessage(String(data));

          return;
        }

        this.connectedWidgets[widgetId].send(this.getWidgetMessage(String(data)));
        console.log(`[${chargerId}-Charger]: Message sent`);
      });
    });

    this.wsWidgetsServer.on('connection', (websocket, request) => {
      const { url } = request;

      const widgetId = url.substring(url.length - 5);
      this.connectedWidgets[widgetId] = websocket;
      console.log(`[${widgetId}-Widget]: Connected`);

      if (this.unsentMessages[widgetId]) {
        websocket.send(this.unsentMessages[widgetId]);
        console.log(`[${widgetId}-Widget]: Message sent`);
        this.unsentMessages[widgetId] = '';
      }
    });
  }

  public stop(): void {
    this.wsChargersServer.close();
    this.wsWidgetsServer.close();
    console.log('Server down.');
  }

  private getWidgetId(chargerId): string {
    return 'w'.concat(String.fromCharCode(...chargerId.split('').map((character) => parseInt(character, 10) + 64)));
  }

  private isValidMessage(message: string): boolean {
    const messageObject = JSON.parse(message);

    return Boolean(
      messageObject?.event === 'StateOfCharge' &&
      messageObject.data?.soc >= 0 &&
      messageObject.data.soc <= 100
    );
  }

  private getChargingStatus(percentage: number): string {
    return percentage < 80 ? 'charging' : percentage === 100 ? 'charged' : 'charging80';
  }

  private getWidgetMessage(chargerMessage: string): string {
    const { data: { soc } } = JSON.parse(chargerMessage);
    const widgetMessage = {
      event: 'chargingStatus',
      data: {
        status: this.getChargingStatus(soc)
      }
    };

    return JSON.stringify(widgetMessage);
  }

}

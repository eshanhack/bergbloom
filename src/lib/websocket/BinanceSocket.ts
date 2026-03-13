type MessageHandler = (data: Record<string, unknown>) => void;

export class BinanceSocket {
  private ws: WebSocket | null = null;
  private url: string = '';
  private handlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private onStatusChange?: (status: 'connected' | 'disconnected') => void;

  constructor(onStatusChange?: (status: 'connected' | 'disconnected') => void) {
    this.onStatusChange = onStatusChange;
  }

  connect(symbol: string, interval: string): void {
    this.disconnect();
    const s = symbol.toLowerCase();
    this.url = `wss://stream.binance.com:9443/ws/${s}@kline_${interval}`;
    this.initWebSocket();
  }

  private initWebSocket(): void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.onStatusChange?.('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handlers.forEach((handler) => handler(data));
        } catch {
          // Ignore parse errors
        }
      };

      this.ws.onclose = () => {
        this.onStatusChange?.('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => this.initWebSocket(), delay);
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }
}

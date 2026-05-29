type EventHandler = (data: unknown) => void;

class SseClient {
  private eventSource: EventSource | null = null;
  private handlers: Map<string, EventHandler[]> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect() {
    if (this.eventSource?.readyState === EventSource.OPEN) return;

    this.eventSource = new EventSource("/api/sse/subscribe");

    this.eventSource.onopen = () => {
      console.log("SSE connected");
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    };

    this.eventSource.onerror = () => {
      this.eventSource?.close();
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    };

    this.eventSource.addEventListener("notification", (e) => {
      this.emit("notification", JSON.parse(e.data));
    });

    this.eventSource.addEventListener("document-update", (e) => {
      this.emit("document-update", JSON.parse(e.data));
    });
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.eventSource?.close();
    this.eventSource = null;
  }

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: EventHandler) {
    const list = this.handlers.get(event) ?? [];
    this.handlers.set(event, list.filter((h) => h !== handler));
  }

  private emit(event: string, data: unknown) {
    this.handlers.get(event)?.forEach((h) => h(data));
  }
}

export const sseClient = new SseClient();

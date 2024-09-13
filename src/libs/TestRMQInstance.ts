
export class TestRMQInstance {
  constructor() {}

  setExchange(exchange: string) {
    return exchange;
  }

  async publish(routingKey: string, payload?: any) {
    return {
      routingKey: routingKey,
      payload: payload,
    };
  }
}

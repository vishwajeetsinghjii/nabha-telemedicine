const app = require('../src/app');

describe('Video signaling setup', () => {
  it('exposes the socket.io server on the app instance', () => {
    expect(app.locals).toBeDefined();
    expect(app.locals.io).toBeDefined();
    expect(typeof app.locals.io.on).toBe('function');
  });
});

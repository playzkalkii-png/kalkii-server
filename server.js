const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: process.env.PORT || 3000 });
let nextId = 1;
const players = {};

wss.on('connection', ws => {
  const id = nextId++;
  console.log('Player connected:', id);
  players[id] = { x: 0, z: 0, a: 0 };
  ws.send(JSON.stringify({ type: 'init', id }));

  ws.on('message', data => {
    try {
      const m = JSON.parse(data);
      if (m.type === 'move' && players[id]) {
        players[id] = { x: +m.x || 0, z: +m.z || 0, a: +m.a || 0 };
      }
    } catch (e) {}
  });

  ws.on('close', (code) => {
    console.log('Player left:', id, 'code:', code);
    delete players[id];
  });
  ws.on('error', (e) => console.log('Socket error:', e.message));
});

setInterval(() => {
  const msg = JSON.stringify({ type: 'state', players });
  wss.clients.forEach(c => { if (c.readyState === 1) c.send(msg); });
}, 100);

console.log('Server chal gaya');

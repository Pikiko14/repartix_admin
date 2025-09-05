import { io } from 'socket.io-client'
import { defineBoot } from '#q-app/wrappers'

let socket

export default defineBoot(async ({ app }) => {
  // set url connection
  const urlDev = `${process.env.SOCKET_URL}:${process.env.SOCKET_PORT}`;
  const urlProd = `${process.env.API_URL}/socket-io`;

  const urlSocket = process.env.ENV_TYPE === 'development' ? urlDev : urlProd;

  // Conecta con tu microservicio de WebSocket
  socket = io(urlSocket, {
    transports: ['websocket'], // fuerza uso de WS puro
  })

  socket.on('connect', () => {
    console.log('✅ Conectado a WebSocket:', socket.id)
  })

  socket.on('joinedRoom', (data) => {
    console.log(`✅ Te uniste a la sala: ${data.room}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Desconectado de WebSocket')
  })

  // Inyectamos en Vue como $socket
  app.config.globalProperties.$socket = socket
})

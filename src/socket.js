export const initSocket = async () => {
  const socket = new WebSocket(process.env.REACT_APP_BACKEND_URL || 'ws://localhost:8080/ws');
  
  return new Promise((resolve, reject) => {
    socket.onopen = () => resolve(socket);
    socket.onerror = (err) => reject(err);
  });
};
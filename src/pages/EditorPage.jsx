import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Client from "../components/Client";
import Editor from "../components/Editor";
import ACTIONS from "../Actions";
import { initSocket } from "../socket";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);

   // Helper function to send messages
  const sendMessage = (type, payload) => {
    socketRef.current.send(JSON.stringify({ type, payload }));
  };

  useEffect(() => {
    const init = async () => {
      try {
        socketRef.current = await initSocket();

        socketRef.current.onclose = () => {
          toast.error("Connection closed.");
          reactNavigator("/");
        };

        socketRef.current.onerror = (err) => {
          console.log("socket error", err);
          toast.error("Socket connection failed, try again later.");
          reactNavigator("/");
        };

        // All server messages are handled here
        socketRef.current.onmessage = (event) => {
          const { type, payload } = JSON.parse(event.data);
          
          switch (type) {
            case ACTIONS.JOINED:
              if (payload.username !== location.state?.username) {
                toast.success(`${payload.username} joined the room.`);
              }
              setClients(payload.clients);

              // For new user, sync code from an existing user
              // Find a client that is not the newly joined one
              const otherClient = payload.clients.find(c => c.socketId !== payload.socketId);
              if (otherClient) {
                  sendMessage(ACTIONS.SYNC_CODE, {
                      codeText: codeRef.current || '',
                      socketId: payload.socketId,
                  });
              }
              break;

            case ACTIONS.DISCONNECTED:
              toast.success(`${payload.username} left the room.`);
              setClients((prev) =>
                prev.filter((client) => client.socketId !== payload.socketId)
              );
              break;
            
            // Code change is handled in the Editor component
            // But you could also handle it here if you prefer
            
            default:
              break;
          }
        };

        // Emit JOIN event
        sendMessage(ACTIONS.JOIN, {
          roomId,
          username: location.state?.username,
        });

      } catch (err) {
        console.error(err);
        toast.error('Could not connect to the server.');
        reactNavigator('/');
      }
    };
    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied");
    } catch (err) {
      toast.error("Could not copy the Room ID");
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="main-container">
      <div className="left-container">
        <div className="left-inner">
          <div className="editorPage-logo">
            <img
              className="editorPage-logoImage"
              src="/collabcodelogo.png"
              alt="collabcodelogo"
            />
          </div>
          <h3>Connected : </h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyRoomIdBtn" onClick={copyRoomId}>
          Copy Room ID
        </button>
        <button className="btn leaveRoomBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editor-container">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(codeText) => {
            codeRef.current = codeText;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;

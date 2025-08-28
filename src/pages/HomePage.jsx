import React, { useEffect, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaLinkedin } from "react-icons/fa";


const HomePage = () => {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");


  // state to check if the server is online
  const [isServerOnline, setIsServerOnline] = useState(false);

  //useEffect to check the server status when the page loads
  useEffect(() => {
        const checkServerStatus = async () => {
            try {
                // Use the HTTP URL for your backend, not the WebSocket URL
                const healthUrl = process.env.REACT_APP_BACKEND_URL.replace('/ws', '').replace('ws://', 'http://').replace('wss://', 'https://') + '/checkonline';
                
                const response = await fetch(healthUrl);
                if (response.ok) {
                    setIsServerOnline(true);
                    console.log('Server is online.');
                    // Stop checking once the server is up
                    if (intervalId) clearInterval(intervalId);
                }
            } catch (err) {
                console.log('Server is offline, retrying...');
            }
        };

        // Ping the server immediately and then every 3 seconds
        checkServerStatus();
        const intervalId = setInterval(checkServerStatus, 3000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
  }, []);

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Created a new room");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Need room ID & username to enter");
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: {
        username,
      }
    });
  };

  const handleEnterKey = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };
  return (
    <div className="homePage">
      <div className="homePage-form">
        <img
          className="homePage-Logo"
          src="/code-sync.png"
          alt="code-sync-logo"
        />
        <h4 className="label">Enter Room ID for collaborating</h4>
        <div className="inputs">
          <input
            type="text"
            className="input-box"
            placeholder="Room ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyUp={handleEnterKey}
            disabled={!isServerOnline} // Disable inputs while server is offline
          />
          <input
            type="text"
            className="input-box"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyUp={handleEnterKey}
            disabled={!isServerOnline} // Disable inputs while server is offline
          />
          <button className="btn joinBtn" onClick={joinRoom}  disabled={!isServerOnline}>
            {isServerOnline ? 'Join Room' : 'Connecting.....'}
          </button>

          <span className="createInfo">
             Don't have an invite? you can create here &nbsp;
            <a onClick={createNewRoom} href="" className="createNewBtn">
              new room
            </a>
          </span>
        </div>
      </div>

      <footer>
        <h4>
          Built by &nbsp;
          <a href="https://www.linkedin.com/in/charanjit-nandigama-a67601324/"><FaLinkedin /></a>
          &nbsp;Charanjit Nandigama
        </h4>
      </footer>
    </div>
  );
};

export default HomePage;

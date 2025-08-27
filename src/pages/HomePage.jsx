import React, { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaLinkedin } from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

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
          src="/collabcodelogo.png"
          alt="collabcode-logo"
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
          />
          <input
            type="text"
            className="input-box"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyUp={handleEnterKey}
          />
          <button className="btn joinBtn" onClick={joinRoom}>
            Join Room
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

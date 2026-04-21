import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Plus, LogIn } from 'lucide-react';

const Home = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!playerName.trim()) return alert('Please enter your name');
    // Generate a simple random room ID (e.g. 6 chars)
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/game/${newRoomId}?name=${encodeURIComponent(playerName)}`);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) return alert('Please enter your name');
    if (!roomIdToJoin.trim()) return alert('Please enter a Room ID');
    navigate(`/game/${roomIdToJoin}?name=${encodeURIComponent(playerName)}`);
  };

  return (
    <div className="home-container">
      <div className="glass-card">
        <div className="title-section">
          <Swords size={48} className="icon-glow" />
          <h1>Antigravity Chess</h1>
          <p>Real-time multiplayer chess platform</p>
        </div>

        <div className="input-group">
          <label>Player Name</label>
          <input 
            type="text" 
            placeholder="Enter your alias" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>

        <div className="actions">
          <button className="btn-primary" onClick={handleCreateRoom}>
            <Plus size={20} />
            Create New Room
          </button>
          
          <div className="divider"><span>OR</span></div>

          <div className="join-group">
            <input 
              type="text" 
              placeholder="Room ID" 
              value={roomIdToJoin}
              onChange={(e) => setRoomIdToJoin(e.target.value)}
              className="room-input"
            />
            <button className="btn-secondary" onClick={handleJoinRoom}>
              <LogIn size={20} />
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

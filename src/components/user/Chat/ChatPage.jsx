import { useEffect } from 'react';
import ChatRoomList from './ChatRoomList';
import ChatWindow from './ChatWindow';
import useChatStore from '../../../store/chatStore';

const ChatPage = ({ isFloating = false }) => {
  const rooms = useChatStore(state => state.rooms);
  const activeRoom = useChatStore(state => state.activeRoom);
  const setActiveRoom = useChatStore(state => state.setActiveRoom);
  const fetchRoom = useChatStore(state => state.fetchRoom); // ✅ ดึงผ่าน hook

  useEffect(() => {
    fetchRoom(); // ✅ ถูกต้อง
  }, [fetchRoom]);

  return (
    <div style={{ fontFamily: 'Sarabun, sans-serif', height: '100%' }}>
      <div className={`row ${isFloating ? 'h-100' : 'vh-100'}`}>
        {/* Room list */}
        <div className="col-4 border-end p-0">
          <ChatRoomList
            rooms={rooms}
            activeRoomId={activeRoom?.id}
            onSelect={setActiveRoom}
          />
        </div>

        {/* Chat window */}
        <div className="col-8 p-0">
          {activeRoom ? (
            <ChatWindow room={activeRoom} />
          ) : (
            <div className="h-100 d-flex align-items-center justify-content-center text-muted">
              เลือกห้องแชท
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

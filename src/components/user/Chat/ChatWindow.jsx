import { useEffect, useRef } from 'react';
import useChatStore from '../../../store/chatStore';
import MessageInput from './MessageInput';
import useGlobalStore from '../../../store/global-store';

const ChatWindow = ({ roomId }) => {
  const user = useGlobalStore(state => state.user);


  // ✅ subscribe ทั้ง messages object
  const messagesMap = useChatStore(state => state.messages);
  const messages = messagesMap[roomId] || [];

  const bottomRef = useRef(null);
  const prevCount = useRef(0);

  // fetch ครั้งเดียวเมื่อเปลี่ยน room
  useEffect(() => {
    if (!roomId) return;
    useChatStore.getState().fetchMessages(roomId);
  }, [roomId]);

  // polling
  useEffect(() => {
    if (!roomId) return;

    const interval = setInterval(() => {
      useChatStore.getState().pollMessages(roomId);
    }, 5000);

    return () => clearInterval(interval);
  }, [roomId]);

  // auto scroll
  useEffect(() => {
    if (messages.length > prevCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevCount.current = messages.length;
  }, [messages]);

  return (
    <div className="d-flex flex-column h-100">
      <div className="border-bottom p-3 fw-bold">
        {user.hname_th} ({user.hcode9})
      </div>

      <div className="flex-grow-1 overflow-auto p-3 bg-light">
        {messages.map(msg => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div
              key={msg.id}
              className={`d-flex mb-2 ${isMe ? 'justify-content-end' : ''}`}
            >
              <div 
                className={`p-2 rounded-5 ${isMe ? 'bg-success text-white' : 'bg-white'}`} 
                style={{fontSize: '12px'}}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <MessageInput roomId={roomId} />
    </div>
  );
};

export default ChatWindow;

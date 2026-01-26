import { useEffect, useRef } from 'react';
import useChatStore from '../../../store/chatStore';
import MessageInput from './MessageInput';
import useGlobalStore from '../../../store/global-store';
import { isToday, formatTime, formatDate } from '../../../utills/ChatDate';

const ChatWindow = ({ room }) => {
  const user = useGlobalStore(state => state.user);

  const roomId = room?.id;

  // ✅ subscribe ทั้ง messages map
  const messagesMap = useChatStore(state => state.messages);
  const messages = messagesMap[roomId] || [];

  const bottomRef = useRef(null);
  const prevCount = useRef(0);

  // =============================
  // fetch messages เมื่อเปลี่ยนห้อง
  // =============================
  useEffect(() => {
    if (!roomId) return;
    useChatStore.getState().fetchMessages(roomId);
  }, [roomId]);

  // =============================
  // polling
  // =============================
  useEffect(() => {
    if (!roomId) return;

    const interval = setInterval(() => {
      useChatStore.getState().pollMessages(roomId);
    }, 5000);

    return () => clearInterval(interval);
  }, [roomId]);

  // =============================
  // auto scroll
  // =============================
  useEffect(() => {
    if (messages.length > prevCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevCount.current = messages.length;
  }, [messages]);

  // =============================
  // Header title
  // =============================
  const headerTitle =
    room.room_type === 'HOSPITAL_PROVINCE' && user?.user_type === 'Unit_service'
      ? "คกก.จังหวัด" + room.province
      : room.room_type === 'HOSPITAL_PROVINCE' && user?.user_type === 'Prov'
        ? room.hname_th
        : room.room_type === 'PROVINCE_REGION' && user?.user_type === 'Prov'
          ? "คกก." + room.zone_name
          : room.room_type === 'PROVINCE_REGION' && user?.user_type === 'Zone'
            ? "คกก.จังหวัด" + room.province
            : null

  return (
    <div className="d-flex flex-column h-100">

      {/* Header (สูงคงที่) */}
      <div className="border-bottom px-3 py-2 flex-shrink-0">
        {headerTitle}
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto p-3 bg-light">
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === user?.id;

          const currentDate = new Date(msg.createdAt);
          const prevMsg = messages[index - 1];
          const prevDate = prevMsg ? new Date(prevMsg.createdAt) : null;

          // 🔹 แสดงวันที่ เมื่อเป็นข้อความแรกของวัน
          const showDate =
            !prevDate ||
            currentDate.toDateString() !== prevDate.toDateString();

          return (
            <div key={msg.id}>
              {/* 📅 วันที่ */}
              {showDate && (
                <div className="text-center text-muted my-2" style={{ fontSize: '12px' }}>
                  {isToday(currentDate)
                    ? 'วันนี้'
                    : formatDate(currentDate)}
                </div>
              )}

              {/* 💬 ข้อความ */}
              <div className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`}>

                {/* 💬 Bubble */}
                <div
                  className={`p-2 rounded-5 ${isMe ? 'bg-success text-white' : 'bg-white'}`}
                  style={{ fontSize: '12px', maxWidth: '70%' }}
                >
                  {msg.content}
                </div>

                {/* ⏰ เวลา (อยู่นอก bubble) */}
                <div
                  className={`mt-1 px-2 text-muted ${isMe ? 'text-end' : 'text-start'}`}
                  style={{ fontSize: '10px' }}
                >
                  {formatTime(currentDate)}
                </div>

              </div>

            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput roomId={roomId} />
    </div>
  );
};

export default ChatWindow;

import { useState } from 'react';
import useChatStore from '../../../store/chatStore';
import { SendHorizonal } from 'lucide-react';

const MessageInput = ({ roomId }) => {
  const [content, setContent] = useState('');
  const sendMessage = useChatStore(state => state.sendMessage);

  const handleSend = async () => {
    if (!content.trim()) return;

    await sendMessage(roomId, content);
    setContent('');
  };

  return (
    <div className="border-top p-3 d-flex gap-2">
      <input
        type="text"
        className="form-control"
        placeholder="พิมพ์ข้อความ..."
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
      />
      <button className="btn btn-outline-success" onClick={handleSend}>
        <SendHorizonal />
      </button>
    </div>
  );
};

export default MessageInput;

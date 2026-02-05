import { useEffect, useState } from 'react'
import { getApproveChat, saveApproveChat } from '../../../api/Chat';
import useGlobalStore from '../../../store/global-store';
import ChatBubble from './ChatBubble';
import { SendHorizontal } from 'lucide-react';

const ChatPanel = ({ categoryId, questionId, subQuestionId, hospitalCode, role }) => {

    const token = useGlobalStore((state) => state.token);
    const [chats, setChats] = useState([])
    const [content, setContent] = useState('')

    
    useEffect(() => {
        if (!token) return;
        loadListApproveChat(token);
    }, [token]);


    const loadListApproveChat = async () => {
        try {
            const res = await getApproveChat(token, subQuestionId, hospitalCode);
            setChats(res.data);
        } catch (err) {
            console.log(err)
        }
    }

    const handleSend = async (e) => {
        e.preventDefault();

        if (!content.trim()) return;

        const chatValues = {
            categoryId,
            questionId,
            subQuestionId,
            hospitalCode,
            senderRole: role,
            message: content
        }

        // console.log('V: ', chatValues)


        try {
            await saveApproveChat(token, chatValues)

            setContent('');
            loadListApproveChat(token)
        } catch (err) {
            console.log(err)
        }
    }


    return (
        <div>
            <div className="d-flex flex-column" style={{ height: 180 }}>

                {/* Chat history */}
                <div className="flex-grow-1 overflow-auto border rounded p-2 mb-2">
                    {chats.map(chat => (
                        <ChatBubble
                            key={chat.id}
                            chat={chat}
                            isMe={chat.sender_role === role}
                        />
                    ))}
                </div>

                {/* Input */}
                <div className="d-flex gap-2">
                    <input
                        className="form-control form-control-sm"
                        placeholder="พิมพ์ข้อความ..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button className="btn btn-sm btn-outline-success" onClick={(e) => handleSend(e)}>
                        <SendHorizontal size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatPanel

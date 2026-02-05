import React from 'react'
import useGlobalStore from '../../../store/global-store'
import { CircleUser } from 'lucide-react';

const ChatBubble = ({ chat, isMe }) => {

    const user = useGlobalStore((state) => state.user);

    const hname_th = user?.hname_th;
    const province = user?.province;
    const zone = user?.zone;

    const formatChatTime = (date) => {
        const d = new Date(date)
        const today = new Date()

        const isToday =
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()

        return isToday
            ? d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            : d.toLocaleDateString('th-TH')
    }


    const roleStyle = {
        ZONE: 'bg-warning text-dark',
        PROVINCE: 'bg-primary text-white',
        HOSPITAL: 'bg-success text-white'
    }

    const roleLabel = {
        ZONE: `(คกก.เขตฯ ${zone})`,
        PROVINCE: `(คกก.จังหวัด${province})`,
        HOSPITAL: `(${hname_th})`
    }

    const roleTextColor = {
        ZONE: 'text-secondary',
        PROVINCE: 'text-primary',
        HOSPITAL: 'text-success'
    }


    return (
        <div className={`d-flex mb-2 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
            <div
                className="d-flex flex-column"
                style={{ maxWidth: '70%' }}
            >

                {!isMe && (
                    <div
                        className={`fw-semibold small opacity-75 ${roleTextColor[chat.sender_role]}`}
                        style={{ fontSize: "10px" }}
                    >
                        <CircleUser size={16} /> {roleLabel[chat.sender_role]}
                    </div>
                )}

                {/* bubble */}
                <div
                    className={`
                        chat-bubble
                        ${isMe ? 'from-me' : 'from-other'}
                        role-${chat.sender_role.toLowerCase()}
                    `}
                    style={{ whiteSpace: 'pre-line' }}
                >
                    <div className="small">{chat.message}</div>
                </div>

                {/* time */}
                <div
                    className="mt-1 text-muted"
                    style={{
                        fontSize: 11,
                        textAlign: isMe ? 'right' : 'left'
                    }}
                >
                    {formatChatTime(chat.created_at)}
                </div>

            </div>
        </div>


    )
}

export default ChatBubble

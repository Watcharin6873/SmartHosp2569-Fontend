import React from 'react'

const ChatBubble = ({ chat, isMe }) => {

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


    return (
        <div className={`d-flex mb-2 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
            <div
                className="d-flex flex-column"
                style={{ maxWidth: '70%' }}
            >
                {/* bubble */}
                <div
                    className={`p-1 rounded-3 ${isMe ? 'bg-success text-white' : 'bg-light'}`}
                >
                    <div className="small">{chat.message}</div>
                </div>

                {/* time */}
                <div
                    className={`mt-1 text-muted`}
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

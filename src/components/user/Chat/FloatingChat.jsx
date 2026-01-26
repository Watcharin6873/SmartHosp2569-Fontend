import { useState } from 'react';
import useChatStore from '../../../store/chatStore';
import ChatPage from './ChatPage';
import { MessageSquareMore } from 'lucide-react';

const FloatingChat = () => {

    const [open, setOpen] = useState(false);
    const unRead = useChatStore(state => state.unRead);

    const totalUnread = Object.values(unRead).reduce((a, b) => a + b, 0);

    return (
        <>
            {/* Floating Button */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1050
                }}
            >
                <button
                    className="btn btn-success rounded-circle position-relative"
                    style={{ width: 60, height: 60 }}
                    onClick={() => setOpen(!open)}
                >
                    <MessageSquareMore />
                    {totalUnread > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {totalUnread}
                        </span>
                    )}
                </button>
            </div>

            {/* Chat Window */}
            {open && (
                <div
                    className="card shadow"
                    style={{
                        position: 'fixed',
                        bottom: 90,
                        right: 10,
                        width: 'clamp(320px, 100vw, 390px)',
                        height: 'clamp(420px, 80vh, 600px)',
                        zIndex: 1050
                    }}
                >
                    {/* HEADER */}
                    <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                        <strong>Chat</strong>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    {/* BODY */}
                    <div className="flex-grow-1 overflow-hidden">
                        <ChatPage isFloating />
                    </div>
                </div>
            )}

        </>
    )
}

export default FloatingChat

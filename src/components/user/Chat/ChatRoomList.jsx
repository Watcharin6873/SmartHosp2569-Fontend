import useChatStore from '../../../store/chatStore';

const ChatRoomList = ({ rooms = [], activeRoomId, onSelect }) => {
    const unRead = useChatStore(state => state.unRead);

    if (!rooms.length) {
        return (
            <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                ยังไม่มีห้องแชท
            </div>
        );
    }

    return (
        <div className="list-group list-group-flush h-100 overflow-auto">
            {rooms.map(room => {
                const isActive = Number(activeRoomId) === Number(room.id);
                const unreadCount = unRead[room.id] || 0;

                return (
                    <button
                        key={room.id}
                        type="button"
                        onClick={() => onSelect(room.id)}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center
              ${isActive ? 'active bg-success' : ''}`}
                    >
                        <div className="text-start">
                            <div className="fw-semibold text-center">
                                ระบบประเมิน รพ.อัจฉริยะ 69
                            </div>
                            {room.room_type === 'HOSPITAL_PROVINCE' ? (
                                <div className="text-center">
                                    <small className="">ห้องแชท รพ. กับ สสจ.</small>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <small className="">ห้องแชท สสจ. กับ เขตฯ</small>
                                </div>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <span className="badge bg-danger rounded-pill">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default ChatRoomList;

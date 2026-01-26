import useChatStore from '../../../store/chatStore';
import useGlobalStore from '../../../store/global-store';

const ChatRoomList = ({ rooms = [], activeRoomId, onSelect }) => {
    const unRead = useChatStore(state => state.unRead);
    const user = useGlobalStore((state) => state.user);

    if (!rooms.length) {
        return (
            <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                ยังไม่มีห้องแชท
            </div>
        );
    }

    const getRoomLabel = (room) => {
        if (room.room_type === 'HOSPITAL_PROVINCE') {
            return room.hname_th; // ชื่อโรงพยาบาล
        }

        if (room.room_type === 'PROVINCE_REGION') {
            return room.zone_name; // ชื่อเขต
        }

        return 'ไม่ทราบชื่อห้อง';
    };

    return (
        <div className="list-group list-group-flush h-100 overflow-auto">
            {rooms.map(room => {
                const isActive = Number(activeRoomId) === Number(room.id);
                const unreadCount = unRead[room.id] || 0;
                const label = getRoomLabel(room)

                return (
                    <button
                        key={room.id}
                        type="button"
                        onClick={() => onSelect(room)}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center
              ${isActive ? 'active bg-success' : ''}`}
                    >
                        <div className="text-start">
                            {room.room_type === 'HOSPITAL_PROVINCE' && user?.user_type === 'Unit_service' && (
                                <div className="text-center">
                                    <small className="">คกก.จังหวัด{room.province}</small>
                                </div>
                            )}
                            {room.room_type === 'HOSPITAL_PROVINCE' && user?.user_type === 'Prov' ? (
                                <div className="text-center">
                                    <small className="">{room.hname_th}</small>
                                </div>
                            ) : room.room_type === 'PROVINCE_REGION' && user?.user_type === 'Prov' ?(
                                <div className="text-center">
                                    <small className="">คกก.{room.zone_name}</small>
                                </div>
                            ): null}
                            {room.room_type === 'PROVINCE_REGION' && user?.user_type === 'Zone' && (
                                <div className="text-center">
                                    <small className="">คกก.จังหวัด{room.province}</small>
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

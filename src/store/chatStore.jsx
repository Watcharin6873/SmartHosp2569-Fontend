import { create } from "zustand";
import { getMessages, getMyChatRoom, sendMessages } from "../api/Chat";
import useGlobalStore from "./global-store";

const useChatStore = create((set, get) => ({
    rooms: [],
    messages: {},        // { [roomId]: [] }
    activeRoom: null, // 👈 เก็บทั้ง object
    unRead: {},           // { [roomId]: number }

    // -----------------------------
    // Active room
    // -----------------------------
    setActiveRoom: (room) => {
        set(state => {
            if (state.activeRoom?.id === room.id) {
                return state;
            }

            return {
                activeRoom: room,
                unRead: {
                    ...state.unRead,
                    [room.id]: 0
                }
            };
        });
    },

    // -----------------------------
    // Rooms
    // -----------------------------
    fetchRoom: async () => {
        const token = useGlobalStore.getState().token;
        if (!token) return;

        const res = await getMyChatRoom(token);
        const newRooms = res.data || [];

        set(state => {
            // กัน update ถ้าจำนวนเท่าเดิม
            if (state.rooms.length === newRooms.length) {
                return state;
            }
            return { rooms: newRooms };
        });
    },

    // -----------------------------
    // Messages
    // -----------------------------
    fetchMessages: async (roomId) => {
        const token = useGlobalStore.getState().token;
        if (!token || !roomId) return;

        const res = await getMessages(token, roomId);

        set(state => ({
            messages: {
                ...state.messages,
                [roomId]: res.data
            }
        }));
    },

    // -----------------------------
    // Send message
    // -----------------------------
    sendMessage: async (roomId, content) => {
        const token = useGlobalStore.getState().token;
        const user = useGlobalStore.getState().user;
        if (!token || !roomId) return;

        const data = {
            room_id: roomId,
            content: content,
            sender_id: user.id,
            hcode9: user.hcode9
        }

        await sendMessages(token, data);

        // refresh หลังส่ง
        await get().fetchMessages(roomId);
    },

    // -----------------------------
    // Polling
    // -----------------------------
    pollMessages: async (roomId) => {
        const token = useGlobalStore.getState().token;
        if (!token || !roomId) return;

        const { messages, activeRoomId, unRead } = get();
        const res = await getMessages(token, roomId);

        const oldCount = messages[roomId]?.length || 0;
        const newCount = res.data.length;

        set(state => {
            const nextState = {
                messages: {
                    ...state.messages,
                    [roomId]: res.data
                }
            };

            // เพิ่ม unread เฉพาะห้องที่ไม่ได้เปิด
            if (newCount > oldCount && roomId !== activeRoomId) {
                nextState.unRead = {
                    ...state.unRead,
                    [roomId]: (unRead[roomId] || 0) + (newCount - oldCount)
                };
            }

            return nextState;
        });
    }
}));

export default useChatStore;

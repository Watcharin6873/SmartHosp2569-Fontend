import { useEffect, useRef } from "react";
import { Modal } from "bootstrap";

const LoadingModal = ({ show, text = "กำลังประมวลผล..." }) => {
    const modalRef = useRef(null);
    const bsModalRef = useRef(null);

    useEffect(() => {
        if (!modalRef.current) return;

        // สร้าง instance ครั้งเดียว
        if (!bsModalRef.current) {
            bsModalRef.current = new Modal(modalRef.current, {
                backdrop: "static", // คลิกข้างนอกไม่ปิด
                keyboard: false     // กด ESC ไม่ปิด
            });
        }

        if (show) bsModalRef.current.show();
        else bsModalRef.current.hide();
    }, [show]);


    return (
        <div className="modal fade" tabIndex="-1" ref={modalRef}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                    <div className="modal-body text-center py-5">

                        {/* 🔄 Spinner */}
                        <div className="d-flex justify-content-center">
                            <div
                                className="spinner-border"
                                role="status"
                                style={{ width: "3rem", height: "3rem" }}
                            >
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>

                        <div className="mt-3 fw-semibold">{text}</div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoadingModal

import { Modal } from 'bootstrap';
import React, { useEffect, useRef } from 'react'

const HospListModal = ({ listHosp }) => {

    const modalRef = useRef(null);
    const modalInstance = useRef(null);

    useEffect(() => {
        if (modalRef.current) {
            modalInstance.current = new Modal(modalRef.current);
        }
    }, []);

    useEffect(() => {
        // ถ้า listhosp มีมากกว่า 1 ให้เปิด modal
        if (listHosp && listHosp.length > 1) {
            modalInstance.current?.show();
        }
    });

    return (
        <>
            <div
                className="modal fade"
                id="hospModal"
                tabIndex="-1"
                aria-hidden="true"
                ref={modalRef}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">เลือกสถานพยาบาล</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {listHosp && listHosp.map((hosp, index) => (
                                <div key={index} className="border-bottom py-2">
                                   <h6>Hosp data</h6>
                                </div>
                            ))}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HospListModal

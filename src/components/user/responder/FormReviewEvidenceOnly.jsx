import { useEffect, useRef, useState } from 'react';
import useGlobalStore from '../../../store/global-store';
import { Modal } from 'bootstrap';

const FormReviewEvidenceOnly = ({ evidenceBySubId }) => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [modalReviewInstance, setModalReviewInstatnce] = useState(null);

    const modalReviewRaf = useRef(null);

    // Init modal
    useEffect(() => {
        if (modalReviewRaf.current) {
            setModalReviewInstatnce(new Modal(modalReviewRaf.current, {
                backdrop: 'static',
                keyboard: false
            }));
        }
    }, []);

    // เปิด modal เมื่อมี evidenceBySubId
    useEffect(() => {
        if (!modalReviewInstance) return;

        if (evidenceBySubId) {
            modalReviewInstance.show();
        }

    }, [evidenceBySubId, modalReviewInstance]);


    return (
        <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
            {/* Modal Show Evidence Files */}
            <div
                className='modal fade'
                id='modalShowEvidenceFiles'
                tabIndex='-1'
                aria-labelledby='modalShowEvidenceFilesLabel'
                aria-hidden='true'
                ref={modalReviewRaf}
            >
                <div className='modal-dialog modal-lg' style={{ marginTop: "70px" }}>
                    <div className='modal-content shadow-lg border-0'>
                        <div className='modal-header bg-success text-white'>
                            <h5 className='modal-title' id='modalShowEvidenceFilesLabel'>
                                📂 ดูหลักฐานที่แนบ
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className='modal-body'>
                            {evidenceBySubId && (
                                <>
                                    <div className='d-flex flex-wrap justify-content-between align-items-center mb-3'>
                                        <div>
                                            <strong>📄 ชื่อไฟล์:</strong> {evidenceBySubId?.ev_filename}
                                        </div>
                                    </div>

                                    <div className='mb-3'>
                                        {
                                            evidenceBySubId?.ev_filename && (
                                                <iframe
                                                    src={`${import.meta.env.VITE_APP_API}/evidence_subid/${evidenceBySubId?.ev_filename}`}
                                                    title="Preview PDF"
                                                    width="100%"
                                                    height="500px"
                                                />
                                            )
                                        }
                                    </div>
                                </>
                            )}
                            <div className='modal-footer'>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    ปิด
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FormReviewEvidenceOnly
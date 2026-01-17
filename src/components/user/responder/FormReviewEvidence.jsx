import { useEffect, useRef, useState } from 'react';
import useGlobalStore from '../../../store/global-store';
import { Modal } from 'bootstrap';
import { Trash2 } from 'lucide-react';
import { removeEvidenceSubIdById } from '../../../api/Uploadfile';
import Swal from 'sweetalert2';

const FormReviewEvidence = ({ evidenceBySubId, loadEvidenceSubId }) => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [isLoading, setIsLoading] = useState(false);
    const [modalReviewInstance, setModalReviewInstatnce] = useState(null);
    const [modalConfirmDelInstance, setModalConfirmDelInstance] = useState(null);
    const [evidenceId, setEvidenceId] = useState(null);

    const modalReviewRaf = useRef(null);
    const modalConfirmDelRef = useRef(null);

    // Init modal
    useEffect(() => {
        if (modalReviewRaf.current) {
            setModalReviewInstatnce(new Modal(modalReviewRaf.current, {
                backdrop: 'static',
                keyboard: false
            }));
        }
        if (modalConfirmDelRef.current) {
            setModalConfirmDelInstance(new Modal(modalConfirmDelRef.current, {
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


    // Remove evidence by id
    const handleRemoveEvidence = async (id) => {
        setEvidenceId(id)
        modalConfirmDelInstance.show()
    }

    // ConfirmRemoveSubmit 
    const handleConfirmRemoveSubmit = async () => {
        try {
            setIsLoading(true);
            const res = await removeEvidenceSubIdById(token, evidenceId)
            modalConfirmDelInstance.hide();
            modalReviewInstance.hide();

            Swal.fire({
                title: "📢 แจ้งผลการลบไฟล์หลักฐาน!",
                text: `${res.data.message}`,
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });

            loadEvidenceSubId(token);

        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

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
                                        <button
                                            type='button'
                                            className='btn btn-sm btn-outline-danger'
                                            onClick={() => handleRemoveEvidence(evidenceBySubId.id)}
                                        >
                                            <Trash2 size={16} /> ลบไฟล์
                                        </button>
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
            {/* Modal confirm remove */}
            <div
                className="modal fade"
                id="confirmModal"
                tabIndex="-1"
                aria-labelledby="confitmModalLabel"
                aria-hidden="true"
                ref={modalConfirmDelRef}
            >
                <div className="modal-dialog" style={{ marginTop: '100px' }}>
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header bg-success text-white">
                            <h5 className="modal-title" id="confitmModalLabel">
                                ⚠️ ยืนยันการลบหลักฐาน
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body d-flex justify-content-center">
                            คุณต้องการลบหลักฐานหรือไม่?
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
                            >
                                ยกเลิกการลบหลักฐาน
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-danger"
                                disabled={isLoading}
                                onClick={handleConfirmRemoveSubmit}
                            >
                                {isLoading ? 'กำลังลบหลักฐาน...' : 'ยืนยันการลบหลักฐาน'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FormReviewEvidence
import { useEffect, useRef, useState } from 'react';
import useGlobalStore from '../../../store/global-store';
import { Modal } from 'bootstrap';
import { uploadEvidenceBySubId } from '../../../api/Uploadfile';
import Swal from 'sweetalert2';

const FormUploadEvidence = ({ answersBySubId, loadEvidenceSubId }) => {
    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [isLoading, setIsLoading] = useState(false);
    const [modalUploadInstance, setModalUploadInstance] = useState(null);
    const [hcode9, setHcode9] = useState(null)

    useEffect(() => {
        if (user?.hcode9) {
            setHcode9(user.hcode9);
        }
    }, [user]);

    const answerData = answersBySubId?.oneAnswer;

    const user_id = user?.id;

    const modalUploadRef = useRef(null);

    // File upload sector
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [fileError, setFileError] = useState('');

    // init modal
    useEffect(() => {
        if (modalUploadRef.current) {
            setModalUploadInstance(new Modal(modalUploadRef.current), {
                backdrop: 'static',
                keyboard: false
            })
        }
    }, []);

    // เปิด modal เมื่อมี answersBySubId
    useEffect(() => {
        if (!modalUploadInstance) return;

        if (answerData) {
            modalUploadInstance.show();
        }
    }, [answerData, modalUploadInstance]);

    // === Handle events === //
    const handleFilterChange = (e) => {
        const selectedFile = e.target.files[0];
        setFileError('');

        if (!selectedFile) return;

        // ตรวจสอบ File type
        if (selectedFile.type !== 'application/pdf') {
            setFileError('❌ รองรับเฉพาะไฟล์ PDF เท่านั้น');
            e.target.value = "";
            return;
        }

        // ตรวจสอบ file size
        if (selectedFile.size > MAX_FILE_SIZE) {
            setFileError('❌ ขนาดไฟล์เกิน 15 MB กรุณาเลือกไฟล์ใหม่');
            e.target.value = "";
            return;
        }

        // สร้าง preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
        setFile(selectedFile);
    }

    // ลบไฟล์ ก่อน upload ใหม่
    const handleRemoveFile = () => {
        setFile(null);
        setFilePreview(null);
        setFileError('');
        document.getElementById('ev_filename').value = "";
    }

    // Upload eviden_sub_id file
    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        if (!user?.id || !user?.hcode9) {
            toast.error("ข้อมูลผู้ใช้ยังไม่พร้อม");
            return;
        }

        if (!file) {
            setFileError('❌ กรุณาเลือกไฟล์ก่อนอัปโหลด');
            return;
        }

        const formData = new FormData();
        formData.append('evaluate_id', answerData.evaluate_id);
        formData.append('sub_question_id', answerData.sub_question_id);
        formData.append('evaluate_answer_id', answerData.id);
        formData.append('hcode9', hcode9);
        formData.append('user_id', user_id);
        formData.append('ev_filename', file);

        // console.log("data: ", formData)

        try {
            setIsLoading(true)
            const res = await uploadEvidenceBySubId(token, formData);
            modalUploadInstance.hide();

            Swal.fire({
                title: "📢 แจ้งผลการแนบไฟล์หลักฐาน!",
                text: `${res.data.message}`,
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });

            handleRemoveFile()
            loadEvidenceSubId(token)

        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            {/* Modal Upload */}
            <div
                className='modal fade'
                id='formUploadModal'
                tabIndex='-1'
                aria-labelledby='formUploadModalLabel'
                aria-hidden='true'
                ref={modalUploadRef}
            >
                <div className='modal-dialog' style={{ marginTop: "70px" }}>
                    <div className='modal-content shadow-lg border-0'>
                        <div className='modal-header bg-success text-white'>
                            <h5 className='modal-title' id='formUploadModalLabel'>
                                📋 แนบไฟล์หลักฐาน
                            </h5>
                            <button
                                type='button'
                                className='btn-close btn-close-white'
                                data-bs-dismiss='modal'
                                aria-label='Close'
                            ></button>
                        </div>
                        <div className='modal-body'>
                            <form onSubmit={handleUploadSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">แนบไฟล์หลักฐาน</label>
                                    <input
                                        id='ev_filename'
                                        type='file'
                                        className='form-control'
                                        name='ev_filename'
                                        accept='application/pdf'
                                        onChange={handleFilterChange}
                                        disabled={!!file}
                                        required
                                    />
                                </div>
                                {
                                    file && (
                                        <div className='alert alert-info d-flex justify-content-between align-items-center'>
                                            <span>📄 {file.name}</span>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={handleRemoveFile}
                                            >
                                                ลบไฟล์
                                            </button>
                                        </div>
                                    )
                                }

                                {fileError && (
                                    <div className='alert alert-danger'>
                                        {fileError}
                                    </div>
                                )}

                                <div className='modal-footer'>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-dismiss="modal"
                                    >
                                        ปิด
                                    </button>
                                    <button
                                        type='submit'
                                        className="btn btn-outline-success"
                                        disabled={!file || isLoading}
                                    >
                                        {isLoading ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FormUploadEvidence

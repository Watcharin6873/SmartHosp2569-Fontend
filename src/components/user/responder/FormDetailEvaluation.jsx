import { Fragment, useEffect, useState } from 'react';
import useGlobalStore from '../../../store/global-store';
import { getListCategory } from '../../../api/Category';
import { getListQuestion } from '../../../api/Queation';
import { getListSubQuestion } from '../../../api/SubQuestion';
import { getListChoices } from '../../../api/Choices';
import { getEvaluationByCatId, getScoreHospitalForSubQuestion } from '../../../api/Evaluate';
import jsPDF from 'jspdf';
import html2canvas from "html2canvas";
import { getEvidenceFiles, getListEvidenceByHcode9 } from '../../../api/Uploadfile';
import { Download, FolderOpenIcon } from 'lucide-react';
import FormReviewEvidenceOnly from './FormReviewEvidenceOnly';
import ChatPanel from '../province/ChatPanel';
import { getProvApproveEvaluation } from '../../../api/Approve';
import { getExportExcelMulti, getExportExcelMulti_v2 } from '../../../api/Report';
import LoadingModal from '../../LoadingModal';

const FormDetailEvaluation = () => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [isLoading, setIsLoading] = useState(false);
    const [isExportLoading, setIsExportLoading] = useState(false);
    const [listCategories, setListCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState([]);
    const [listQuestions, setListQuestions] = useState([]);
    const [listSubQuestions, setListSubQuestions] = useState([]);
    const [listChoices, setListChoices] = useState([]);
    const [valueCatId, setValueCatId] = useState(null);
    const [evaluateData, setEvaluateData] = useState([]);
    const [answers, setAnswers] = useState({}); // key=sub_question_id
    const [fileEvidences, setFileEvidences] = useState(null);
    const [loadingEvidenceFile, setLoadingEvidenceFile] = useState(false);
    const [listEvidenceSubId, setListEvidenceSubId] = useState([]);
    const [evidenceBySubId, setEvidenceBySubId] = useState(null);
    const [scoreForSubQuestion, setScoreForSubQuestion] = useState([]);
    const [listProvApprove, setListProvApprove] = useState([]);


    const hcode9 = user?.hcode9;

    useEffect(() => {
        if (!token) return;
        loadListCategories(token);
        loadListQuestions(token);
        loadListSubQuestions(token);
        loadListChoices(token);
        loadEvidenceSubId(token);
    }, [token]);

    const loadListCategories = async () => {
        try {
            setIsLoading(true);
            const res = await getListCategory(token);
            setListCategories(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const loadListQuestions = async () => {
        try {            
            const res = await getListQuestion(token);
            setListQuestions(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    const loadListSubQuestions = async () => {
        try {
            const res = await getListSubQuestion(token);
            setListSubQuestions(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    const loadListChoices = async () => {
        try {
            const res = await getListChoices(token);
            setListChoices(res.data);
        } catch (err) {
            console.log(err)
        }
    }

    // Load evidence_sub_id 
    const loadEvidenceSubId = async () => {
        try {
            // Code
            const res = await getListEvidenceByHcode9(token, hcode9);
            setListEvidenceSubId(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    const catOption = listCategories.map((item, idx) => ({
        value: item.id,
        label: (idx + 1) + ") " + item.category_name_th
    }));

    const handleSelectedCategory = (e) => {
        const value = e.target.value;

        if (!value) {
            setValueCatId(null);
            return;
        }

        const categoryId = Number(value);

        setValueCatId(categoryId);
        loadEvaluateData(categoryId);
        loadEvidenceFile(categoryId);
        loadScoreForSubQuestion(token);
        loadListProvApprove(categoryId)
    }

    // Handle get scores for sub question
    const loadScoreForSubQuestion = async () => {
        try {
            const res = await getScoreHospitalForSubQuestion(token, hcode9)
            // console.log('R: ', res.data);
            setScoreForSubQuestion(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    const scoreByCatId = scoreForSubQuestion.filter(f => f.category_id === valueCatId);

    const loadListProvApprove = async (category_id) => {
        try {
            const res = await getProvApproveEvaluation(token, category_id, hcode9);
            // console.log('Data:', res.data);
            setListProvApprove(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    const loadEvaluateData = async (category_id) => {
        const res = await getEvaluationByCatId(token, category_id, hcode9);
        // console.log('Data:', res.data);

        // res.data ต้องเป็น array
        if (!Array.isArray(res.data)) {
            setEvaluateData([]);
            setAnswers({});
            return;
        }

        setEvaluateData(res.data);

        const map = {};

        res.data.forEach(item => {
            // แต่ละ item มี evaluateAnswers
            if (!Array.isArray(item.evaluateAnswers)) return;

            item.evaluateAnswers.forEach(a => {
                if (!a.subQuestions) return;

                const subId = Number(a.sub_question_id);
                const qType = a.subQuestions.question_type;

                if (qType === "checkbox") {
                    if (!Array.isArray(map[subId])) {
                        map[subId] = [];
                    }

                    map[subId].push({
                        id: a.id,
                        evaluate_id: a.evaluate_id,
                        sub_question_id: subId,
                        choice_id: Number(a.choice_id),
                        answer_id: Number(a.answer_id),
                        choice_value: Number(a.answer_value),
                        choice_required: Number(a.answer_required),
                        answer_text: a.answer_text || null
                    });
                } else {
                    // radio / text / textarea
                    map[subId] = {
                        id: a.id,
                        evaluate_id: a.evaluate_id,
                        sub_question_id: subId,
                        choice_id: Number(a.choice_id),
                        answer_id: Number(a.answer_id),
                        choice_value: Number(a.answer_value),
                        choice_required: Number(a.answer_required)
                    };
                }
            });
        });

        // console.log('Mapped answers:', map);
        setAnswers(map);
    };

    // console.log('Data:', evaluateData);

    const filterQuestion = listQuestions.filter(f => f.category_id === valueCatId);
    const filterSubQuestion = listSubQuestions.filter(f => f.category_id === valueCatId);
    const filterChoice = listChoices.filter(f => f.category_id === valueCatId);

    const loadEvidenceFile = async (categoryId) => {
        try {
            setFileEvidences(null);        // ✅ เคลียร์ก่อน
            setLoadingEvidenceFile(true);    // (ถ้ามี loading)

            const res = await getEvidenceFiles(token, hcode9, categoryId);

            if (res?.data) {
                setFileEvidences(res.data);
            } else {
                setFileEvidences(null);
            }
        } catch (err) {
            console.error(err);
            setFileEvidences(null);
        } finally {
            setLoadingEvidenceFile(false);
        }
    };

    const exportPDF = async () => {
        const element = document.getElementById("report-table"); // div หน้าเว็บทั้งหมด
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm

        // ขนาดรูปภาพใน mm
        const imgProps = {
            width: pdfWidth,
            height: (canvas.height * pdfWidth) / canvas.width,
        };

        let heightLeft = imgProps.height;
        let position = 0;

        // วนลูปแบ่งหลายหน้า
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgProps.height);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgProps.height;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgProps.height);
            heightLeft -= pdfHeight;
        }

        // กำหนดชื่อไฟล์
        const categoryName =
            listCategories.find(c => c.id === valueCatId)?.category_name_th || "ปีงบประมาณ พ.ศ. 2569";

        pdf.save(`แบบประเมิน${categoryName}.pdf`);
    };

    const showEvidenceFiles = () => {
        window.open(`https://bdh-service.moph.go.th/api/questionnaire/evidence_files/${fileEvidences?.file_ev}`, "_blank", "noreferer")
    }

    // Review evidence by subItemId
    const handleReviewEvidence = (subQuestId) => {
        const evidenceData = listEvidenceSubId.find(f => f.sub_question_id === subQuestId);
        setEvidenceBySubId(evidenceData)
    }


    const renderHighlightText = (text) => {
        const regex = /(คะแนนเต็ม\[\d+\])\s*(คะแนนจำเป็น\[\d+\])/;
        const match = text.match(regex);

        if (!match) return text;

        const before = text.split(match[0])[0];

        return (
            <>
                {before}
                <span className="text-primary fw-bold">{match[1]}</span>{" "}
                <span className="text-danger fw-bold">{match[2]}</span>
                {")"}
            </>
        );
    };

    const loadExportExcelMulti = async () => {
        try {
            setIsExportLoading(true);

            const listHcode9 = [hcode9];

            const res = await getExportExcelMulti_v2(token, listHcode9);

            const url = window.URL.createObjectURL(res.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = `รายละเอียดการประเมินของ_[${hcode9}].xlsx`;
            link.click();

        } catch (err) {
            console.log(err);
        } finally {
            setIsExportLoading(false);
        }
    }


    return (
        <>
            <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
                <div className='d-flex justify-content-center'>
                    <h3 className="p-3">รายละเอียดการประเมินโรงพยาบาลอัจฉริยะ ปีงบประมาณ พ.ศ. 2569</h3>
                </div>

                {/* Category selection */}
                <div className='d-flex justify-content-center mb-3 gap-3'>
                    <select
                        className='form-select w-25'
                        aria-label='Category select to search'
                        value={valueCatId ?? ""}
                        onChange={handleSelectedCategory}
                    >
                        <option value="">--- เลือกด้านที่ต้องการดูรายละเอียด ---</option>
                        {[...catOption]
                            .sort((a, b) => a.value - b.value)
                            .map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                    </select>
                    <button
                        className='btn btn-outline-primary btn-sm'
                        onClick={loadExportExcelMulti}
                    >
                        <Download size={16} /> Export Excel (รายละเอียดทั้งหมด)
                    </button>
                    {
                        fileEvidences !== null && (
                            <button
                                className='btn btn-outline-success btn-sm'
                                onClick={showEvidenceFiles}
                            >
                                <FolderOpenIcon className="me-2" size={16} /> ดูหลักฐานที่แนบ
                            </button>
                        )
                    }
                    {
                        listCategories.find(f => f.id === valueCatId)
                            ?
                            <button
                                className='btn btn-outline-danger btn-sm'
                                onClick={exportPDF}
                            >
                                <Download size={16} />  Export รายละเอียด
                            </button>
                            : null
                    }
                </div>

                {/* Table */}
                <div className='table-responsive'>
                    <table className='table table-bordered' id='report-table'>
                        <thead>
                            <tr className='table-success align-middle'>
                                <th rowSpan={2} className="text-center h5">
                                    แบบประเมินโรงพยาบาลอัจฉริยะ{" "}
                                    {
                                        listCategories.find(c => c.id === valueCatId)
                                            ?.category_name_th || "ปีงบประมาณ พ.ศ. 2569"
                                    }
                                </th>
                                <th rowSpan={2} className="text-center" style={{ width: "8%" }}>คะแนนที่ได้</th>
                                <th rowSpan={2} className="text-center" style={{ width: "8%" }}>คะแนนจำเป็น</th>
                                <th rowSpan={2} className="text-center" style={{ width: "20%" }}>ความคิดเห็น</th>
                                <th colSpan={2} className="text-center" style={{ width: "15%" }}>สถานะอนุมัติ</th>
                            </tr>
                            <tr className='table-success align-middle'>
                                <th className="text-center" style={{ width: "10%" }}>สสจ.</th>
                                <th className="text-center" style={{ width: "10%" }}>เขตฯ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filterQuestion.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className='text-center'>
                                            -- ไม่พบข้อมูล --
                                        </td>
                                    </tr>
                                )
                            }
                            {
                                filterQuestion.length > 0 && filterQuestion.map((item, idx) => (
                                    <Fragment key={idx}>
                                        {/* Parent row */}
                                        <tr className='table-secondary'>
                                            <td colSpan={6} className='fw-bold'>{item.question_name}</td>
                                        </tr>
                                        {/* Children row */}
                                        {
                                            filterSubQuestion.length > 0 && filterSubQuestion
                                                .filter(f => f.question_id === item.id)
                                                .map((subItem, subIdx) => (
                                                    <tr key={subIdx}>
                                                        <td
                                                            style={{ paddingLeft: '30px' }}
                                                        >
                                                            <div className='mb-2'>
                                                                <span className='fw-bold'>
                                                                    {subItem.sub_quest_name
                                                                        ?.split("\n")
                                                                        .map((line, index) => (
                                                                            <span key={index}>
                                                                                {index > 0 && <br />}
                                                                                <span
                                                                                    style={{
                                                                                        marginLeft: index === 0 ? 0 : 40,
                                                                                        display: "inline-block",
                                                                                        whiteSpace: "pre-line"
                                                                                    }}
                                                                                >
                                                                                    {renderHighlightText(line)}
                                                                                </span>
                                                                            </span>
                                                                        ))}
                                                                    {subItem.is_required === true && (
                                                                        <span className="text-danger fw-bold ms-2">
                                                                            (*จำเป็น)
                                                                        </span>
                                                                    )}

                                                                    {(() => {
                                                                        const curAnswer = answers[subItem.id];

                                                                        // มีคำตอบหรือไม่ (รองรับ radio / checkbox)
                                                                        const hasAnswer = Array.isArray(curAnswer)
                                                                            ? curAnswer.length > 0
                                                                            : curAnswer?.sub_question_id === subItem.id;

                                                                        // มีหลักฐานแล้วหรือยัง
                                                                        const hasEvidence = listEvidenceSubId?.some(ev => parseInt(ev.sub_question_id) === parseInt(subItem.id))


                                                                        if (!hasAnswer) return null;

                                                                        return hasEvidence && (
                                                                            <span
                                                                                className='btn btn-primary btn-sm px-1 py-0 ms-2'
                                                                                onClick={() => handleReviewEvidence(subItem.id)}
                                                                            >
                                                                                ดูหลักฐาน
                                                                            </span>
                                                                        );
                                                                    })()}

                                                                </span>
                                                            </div>
                                                            {
                                                                filterChoice.length > 0 && filterChoice
                                                                    .filter(c => c.sub_question_id === subItem.id)
                                                                    .map((choice, choiceIDX) => (
                                                                        <div
                                                                            key={choiceIDX}
                                                                            className='flex flex-lg-column gap-1'
                                                                        >
                                                                            {/* Radio */}
                                                                            {
                                                                                subItem.question_type === 'radio' && choice.answers.map((answer, answerIdx) => {
                                                                                    const isNegative = answer.choice_text.trim().startsWith("ไม่มี");
                                                                                    const selected = answers?.[subItem.id];

                                                                                    const isChecked = selected && parseInt(selected?.answer_id) === parseInt(answer.id);

                                                                                    return (
                                                                                        <div
                                                                                            key={answer.id ?? answerIdx}
                                                                                            className="form-check"
                                                                                            style={{
                                                                                                marginLeft: 40
                                                                                            }}
                                                                                        >
                                                                                            <input
                                                                                                className="form-check-input"
                                                                                                type="radio"
                                                                                                name={`subquestion_${subItem.id}`}
                                                                                                value={isChecked}
                                                                                                checked={isChecked}
                                                                                                readOnly
                                                                                            />
                                                                                            <label
                                                                                                className={`form-check-label fw-semibold ${isNegative ? "text-danger" : "text-success"
                                                                                                    }`}
                                                                                                htmlFor={`choice_${choice.id}_answer_${answerIdx}`}
                                                                                            >
                                                                                                {answer.choice_text}
                                                                                            </label>
                                                                                        </div>
                                                                                    )
                                                                                })
                                                                            }
                                                                            {/* Checkbox */}
                                                                            {
                                                                                subItem.question_type === 'checkbox' && choice.answers.map((answer, answerIdx) => {
                                                                                    const isNegative = answer.choice_text.trim().startsWith("ไม่มี");
                                                                                    const isOtherText = answer.choice_text?.includes("โปรดระบุ");
                                                                                    const currentAnswer = answers[subItem.id] || [];

                                                                                    const isChecked = Array.isArray(currentAnswer) && currentAnswer.some(a => a.answer_id === answer.id);

                                                                                    const selectedItem = currentAnswer.find(a => a.answer_id === answer.id);

                                                                                    return (
                                                                                        <div
                                                                                            key={answer.id ?? answerIdx}
                                                                                            className="form-check"
                                                                                            style={{ marginLeft: 40 }}
                                                                                        >
                                                                                            <input
                                                                                                className="form-check-input"
                                                                                                type="checkbox"
                                                                                                value={isChecked}
                                                                                                checked={isChecked}
                                                                                                readOnly
                                                                                            />

                                                                                            <label
                                                                                                className={`form-check-label fw-semibold ${isNegative ? "text-danger" : "text-success"
                                                                                                    }`}
                                                                                                htmlFor={`choice_${choice.id}_answer_${answerIdx}`}
                                                                                            >
                                                                                                {answer.choice_text}
                                                                                            </label>
                                                                                            {/* ✅ Textbox (เฉพาะ อื่นๆ) */}
                                                                                            {isChecked && isOtherText && (
                                                                                                <input
                                                                                                    type="text"
                                                                                                    className="form-control mt-2"
                                                                                                    placeholder="โปรดระบุ"
                                                                                                    value={selectedItem?.answer_text || ""}
                                                                                                    readOnly
                                                                                                />
                                                                                            )}
                                                                                        </div>
                                                                                    )
                                                                                })
                                                                            }
                                                                        </div>
                                                                    ))
                                                            }
                                                        </td>
                                                        <td className='text-center'>
                                                            {
                                                                scoreByCatId && scoreByCatId
                                                                    .filter(f =>
                                                                        f.question_id === subItem.question_id &&
                                                                        f.sub_question_id === subItem.id
                                                                    )
                                                                    .map((score, sIdx) => (
                                                                        <p
                                                                            key={sIdx}
                                                                            className='fw-bold text-primary'
                                                                        >
                                                                            {score.answer_value}
                                                                        </p>
                                                                    ))
                                                            }
                                                        </td>
                                                        <td className='text-center'>
                                                            {
                                                                scoreByCatId && scoreByCatId
                                                                    .filter(f =>
                                                                        f.question_id === subItem.question_id &&
                                                                        f.sub_question_id === subItem.id
                                                                    )
                                                                    .map((score, sIdx) => (
                                                                        <p
                                                                            key={sIdx}
                                                                            className='fw-bold text-secondary'
                                                                        >
                                                                            {score.answer_required}
                                                                        </p>
                                                                    ))
                                                            }
                                                        </td>
                                                        <td>
                                                            <ChatPanel
                                                                key={`${valueCatId}-${subItem.id}-${user?.hcode9}`}
                                                                categoryId={valueCatId}
                                                                questionId={subItem.question_id}
                                                                subQuestionId={subItem.id}
                                                                hospitalCode={user?.hcode9}
                                                                role="HOSPITAL" // หรือ "PROVINCE"
                                                            />
                                                        </td>
                                                        <td className='text-center'>
                                                            {listProvApprove && (listProvApprove
                                                                .filter(f =>
                                                                    f.category_id === valueCatId &&
                                                                    f.question_id === subItem.question_id &&
                                                                    f.sub_question_id === subItem.id &&
                                                                    f.hospital_code === hcode9
                                                                )
                                                                .map((proof, idx) =>
                                                                    <div key={idx} className="d-flex justify-content-center">
                                                                        {
                                                                            proof.prov_status === "PASS"
                                                                                ? (
                                                                                    <label
                                                                                        className="form-check-label text-success fw-semibold"
                                                                                    >
                                                                                        อนุมัติแล้ว "ผ่าน"
                                                                                    </label>
                                                                                )
                                                                                : proof.prov_status === "FAIL"
                                                                                    ? (
                                                                                        <label
                                                                                            className="form-check-label text-danger fw-semibold"
                                                                                        >
                                                                                            อนุมัติแล้ว "ไม่ผ่าน"
                                                                                        </label>
                                                                                    )
                                                                                    : (
                                                                                        <label
                                                                                            className="form-check-label text-secondary fw-semibold"
                                                                                        >
                                                                                            ยังไม่อนุมัติ
                                                                                        </label>
                                                                                    )
                                                                        }
                                                                    </div>
                                                                ))
                                                            }
                                                        </td>
                                                        <td className='text-center'>
                                                            {listProvApprove && (listProvApprove
                                                                .filter(f =>
                                                                    f.category_id === valueCatId &&
                                                                    f.question_id === subItem.question_id &&
                                                                    f.sub_question_id === subItem.id &&
                                                                    f.hospital_code === hcode9
                                                                )
                                                                .map((proof2, idx) =>
                                                                    <div key={idx} className="d-flex justify-content-center">
                                                                        {
                                                                            proof2.zone_status === "PASS"
                                                                                ? (
                                                                                    <label
                                                                                        className="form-check-label text-success fw-semibold"
                                                                                    >
                                                                                        อนุมัติแล้ว "ผ่าน"
                                                                                    </label>
                                                                                )
                                                                                : proof2.zone_status === "FAIL"
                                                                                    ? (
                                                                                        <label
                                                                                            className="form-check-label text-danger fw-semibold"
                                                                                        >
                                                                                            อนุมัติแล้ว "ไม่ผ่าน"
                                                                                        </label>
                                                                                    )
                                                                                    : (
                                                                                        <label
                                                                                            className="form-check-label text-secondary fw-semibold"
                                                                                        >
                                                                                            ยังไม่อนุมัติ
                                                                                        </label>
                                                                                    )
                                                                        }
                                                                    </div>
                                                                ))
                                                            }
                                                        </td>
                                                    </tr>
                                                ))
                                        }
                                    </Fragment>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

                {/* Modal review evidence file by sub_question_id */}
                <FormReviewEvidenceOnly evidenceBySubId={evidenceBySubId} />

                <LoadingModal show={isLoading || isExportLoading} />

            </div>
        </>
    )
}

export default FormDetailEvaluation
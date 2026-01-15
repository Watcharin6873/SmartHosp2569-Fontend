import { Fragment, useEffect, useState } from 'react';
import useGlobalStore from '../../../store/global-store';
import { getListCategory } from '../../../api/Category';
import { getListQuestion } from '../../../api/Queation';
import { getListSubQuestion } from '../../../api/SubQuestion';
import { getListChoices } from '../../../api/Choices';
import { getEvaluationByCatId } from '../../../api/Evaluate';
import jsPDF from 'jspdf';
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import THSarabunNew from '../../../utills/fonts/THSarabunNew';
import { getEvidenceFiles } from '../../../api/Uploadfile';
import { Download, FolderOpenIcon } from 'lucide-react';

const FormDetailEvaluation = () => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [isLoading, setIsLoading] = useState(false);
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


    const hcode9 = user?.hcode9;

    useEffect(() => {
        loadListCategories(token);
        loadListQuestions(token);
        loadListSubQuestions(token);
        loadListChoices(token);
    }, []);

    const loadListCategories = async () => {
        try {
            const res = await getListCategory(token);
            setListCategories(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    const loadListQuestions = async () => {
        try {
            setIsLoading(true);
            const res = await getListQuestion(token);
            setListQuestions(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
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
                setFileEvidences([]);
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

    const showEvidenceFiles = () =>{
        window.open(`https://bdh-service.moph.go.th/api/questionnaire/evidence_files/${fileEvidences?.file_ev}`, "_blank", "noreferer")
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
                            <tr className='table-success'>
                                <th className="text-center h5">
                                    แบบประเมินโรงพยาบาลอัจฉริยะ{" "}
                                    {
                                        listCategories.find(c => c.id === valueCatId)
                                            ?.category_name_th || "ปีงบประมาณ พ.ศ. 2569"
                                    }
                                </th>

                            </tr>
                        </thead>
                        <tbody>
                            {
                                filterQuestion.length === 0 && (
                                    <tr>
                                        <td className='text-center'>
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
                                            <td className='fw-bold'>{item.question_name}</td>
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
                                                                            <div
                                                                                key={index}
                                                                                style={{
                                                                                    marginLeft: index === 0 ? 0 : 40,
                                                                                    whiteSpace: "pre-line"
                                                                                }}
                                                                            >
                                                                                {line}
                                                                            </div>
                                                                        ))}
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
                                                    </tr>
                                                ))
                                        }
                                    </Fragment>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    )
}

export default FormDetailEvaluation
import { Fragment, useEffect, useState } from 'react'
import useGlobalStore from '../../../store/global-store'
import { getListQuestionByCatId } from '../../../api/Queation';
import { getListSubQuestion } from '../../../api/SubQuestion';
import { getListChoices } from '../../../api/Choices';

const FormEvaluateInfra = () => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [isLoading, setIsLoading] = useState(false);
    const [listQuestion, setListQuestion] = useState([]);
    const [listSubQuestion, setListSubQuestion] = useState([]);
    const [listChoices, setListChoices] = useState([]);

    useEffect(() => {
        loadListQuestion(token);
        loadListSubQuestion(token);
        loadListChoices(token);
    }, []);

    // หมวดโครงสร้างพื้นฐาน
    const category_id = 2;
    const loadListQuestion = async () => {
        try {
            setIsLoading(true);
            const res = await getListQuestionByCatId(token, category_id);
            setListQuestion(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    // Load SubQuestions
    const loadListSubQuestion = async () => {
        try {
            const res = await getListSubQuestion(token);
            setListSubQuestion(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    // Load Choices
    const loadListChoices = async () => {
        try {
            const res = await getListChoices(token);
            setListChoices(res.data);
        } catch (err) {
            console.log(err);
        }
    }


    return (
        <>
            <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
                {/* <div className='d-flex justify-content-center' style={{ marginTop: '20px' }}>
                    <h3>แบบประเมินโครงสร้างพื้นฐาน (Infrastructure)</h3>
                </div> */}

                {/* แบบสอบถาม */}
                <div className='table-responsive mt-3'>
                    <table className="table table-bordered">
                        <thead>
                            {/* tr แรก : หัวข้อหลัก */}
                            <tr className="table-primary">
                                <th
                                    className="text-center"
                                    colSpan={3}

                                >
                                    <h3 className="p-2">แบบประเมินด้านโครงสร้างพื้นฐาน (Infrastructure)</h3>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                listQuestion.length > 0 && listQuestion.map((item, idx) => (
                                    <Fragment key={idx}>
                                        {/* Parent row */}
                                        <tr className="table-secondary">
                                            <td colSpan={3} className="fw-bold">
                                                {item.question_name}
                                            </td>
                                        </tr>
                                        {/* Children rows */}
                                        {
                                            listSubQuestion.length > 0 && listSubQuestion
                                                .filter(f => f.question_id === item.id)
                                                .map((item2, idx2) => (
                                                    <tr key={idx2}>
                                                        <td
                                                            colSpan={3}
                                                            style={{ paddingLeft: "30px" }}
                                                            className="fw-bold"
                                                        >
                                                            <span>{item2.sub_quest_name}</span><br />
                                                            {
                                                                listChoices.length > 0 && listChoices
                                                                    .filter(f => f.sub_question_id === item2.id)
                                                                    .map((item3, idx3) => (
                                                                        <div key={idx3} className="d-flex flex-lg-column gap-1">
                                                                            {item3.answers.map((answer, answerIdx) => {
                                                                                const isNegative = answer.choice_text.trim().startsWith("ไม่มี");

                                                                                return (
                                                                                    <div
                                                                                        key={answer.id ?? answerIdx}
                                                                                        className="form-check"
                                                                                    >
                                                                                        <input
                                                                                            className="form-check-input"
                                                                                            type="radio"
                                                                                            name={`subquestion_${item2.id}`}
                                                                                            id={`choice_${item3.id}_answer_${answerIdx}`}
                                                                                            value={answer.id}
                                                                                        />
                                                                                        <label
                                                                                            className={`form-check-label fw-semibold ${isNegative ? "text-danger" : "text-success"
                                                                                                }`}
                                                                                            htmlFor={`choice_${item3.id}_answer_${answerIdx}`}
                                                                                        >
                                                                                            {answer.choice_text}
                                                                                        </label>
                                                                                    </div>
                                                                                );
                                                                            })}
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

export default FormEvaluateInfra
import { useEffect, useState, useMemo } from "react";
import { FaRegFrown, FaRegMeh, FaRegSmile, FaRegGrin, FaRegLaughBeam } from "react-icons/fa";
import '../scss/styles.scss'
import MophLogo from "../assets/logo-MOPH.png";
import option_1 from "../assets/options1.png";
import option_2 from "../assets/options2.png";
import option_3 from "../assets/options3.png";
import option_4 from "../assets/options4.png";
import option_5 from "../assets/options5.png";
import hosp from "../assets/hosp.png";
import pcu from "../assets/pcu.png";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router";
import useGlobalStore from "../store/global-store";
import { getListQuestion } from "../api/Queation";
import { getListScoreSurvey, saveSurveyComment, saveSurveyForm } from "../api/Survey";

const Survey2 = () => {

    const navigate = useNavigate();
    const myParams = useLocation().search;
    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [isLoading, setIsLoading] = useState(false);
    const [listQuestion, setListQuestion] = useState([]);
    const [listScoreSurvey, setListScoreSurvey] = useState([]);

    const alert_id = new URLSearchParams(myParams).get('id');
    const hcode_p = new URLSearchParams(myParams).get('hcode');

    useEffect(() => {
        loadListQuestion(token);
        loadListScoreSurvey(token);
    }, []);

    // Load list Question
    const loadListQuestion = async () => {
        try {
            setIsLoading(true);
            const res = await getListQuestion();
            setListQuestion(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    // Load list Score survey
    const loadListScoreSurvey = async () => {
        try {
            setIsLoading(true);
            const res = await getListScoreSurvey();
            // console.log('Data: ', res.data);
            setListScoreSurvey(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const icons = {
        1: option_1,
        2: option_2,
        3: option_3,
        4: option_4,
        5: option_5,
    };

    const colors = {
        1: "#D83820",
        2: "#F58201",
        3: "#F8CD05",
        4: "#B1CC01",
        5: "#5EBC04",
    };


    const question2 = useMemo(() => {
        if (!listQuestion.length || !listScoreSurvey.length) return [];

        return listScoreSurvey.map((itm) => ({
            topic_id: itm.topic_id,
            category_id: itm.category_id,
            question_id: itm.question_id,
            text: listQuestion.find((f) => f.id === itm.question_id)?.question_name || "-",
            options: itm.answers.map((ans) => {
                if (ans.score_name === "textbox") {
                    return {
                        type: "text",
                        label: "อื่น ๆ (ระบุ)",
                        value: "other",
                        score_surveyId: ans.score_surveyId,
                    };
                }
                return {
                    type: "choice",
                    icon: <img src={icons[ans.score_value]} width={50} />,
                    label: <p style={{ color: colors[ans.score_value] }}>
                        {ans.score_name}
                    </p>,
                    value: ans.score_value,
                    score_surveyId: ans.score_surveyId,
                };
            }),
        }));
    }, [listQuestion, listScoreSurvey]);


    // console.log('Question: ', question2)

    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        if (question2.length > 0 && answers.length === 0) {
            setAnswers(Array(question2.length).fill(null));
        }
    }, [question2, answers.length]);

    const handleSelect = (value) => {
        const newAnswers = [...answers];
        newAnswers[current] = value;
        setAnswers(newAnswers);
    };
    const handleTextChange = (e) => {
        const newAnswers = [...answers];
        newAnswers[current] = e.target.value;
        setAnswers(newAnswers);
    };

    const handleNext = (e) => {
        if (current < question2.length - 1) setCurrent(current + 1);
    };

    const handlePrev = (e) => {
        if (current > 0) setCurrent(current - 1);
    };

    // ปุ่ม Next / Submit
    const isNextDisabled = () => {
        const q = question2[current];

        if (!q || !q.options) return true;   // safety

        const hasChoice = q.options.some(o => o.type === "choice");
        const hasText = q.options.some(o => o.type === "text");

        // ✅ ถ้ามี choice ต้องเลือกก่อน
        if (hasChoice) {
            return answers[current] === null || answers[current] === "";
        }

        // ✅ ถ้ามีแต่ textbox → ไม่บังคับ
        if (hasText) return false;

        return false;
    };


    const handleSubmit = async () => {
        try {
            const surveyFormData = [];
            const surveyCommentData = [];

            question2.forEach((q, index) => {
                const ans = answers[index];

                q.options.forEach((opt) => {
                    // ถ้า type === choice และ value ตรงกับ ans
                    if (opt.type === "choice" && opt.value === ans) {
                        surveyFormData.push({
                            topic_id: q.topic_id,
                            category_id: q.category_id,
                            question_id: q.question_id,
                            alert_id: alert_id,
                            hcode: hcode_p,
                            score_value: ans,
                        });
                    }

                    // ถ้า type === text และ ans เป็น string
                    if (opt.type === "text" && typeof ans === "string" && ans.trim() !== "") {
                        surveyCommentData.push({
                            topic_id: q.topic_id,
                            category_id: q.category_id,
                            question_id: q.question_id,
                            alert_id: alert_id,
                            hcode: hcode_p,
                            comment_string: ans,
                        });
                    }
                });
            });

            // ✅ ส่ง API แบบ batch
            if (surveyFormData.length > 0) {
                console.log("survey-form: ", surveyFormData);
                await saveSurveyForm(surveyFormData);
            }
            if (surveyCommentData.length > 0) {
                console.log("survey-comment:", surveyCommentData);
                await saveSurveyComment(surveyCommentData);
            }

            Swal.fire({
                title: "🎉 ขอบคุณสำหรับการตอบแบบประเมิน!",
                text: "เราจะนำความคิดเห็นของคุณไปพัฒนาบริการให้ดียิ่งขึ้น 💙",
                icon: "success",
                showConfirmButton: false,  // ไม่แสดงปุ่ม
                timer: 2000, // ปิดเองหลัง 2 วินาที
            }).then(() => {
                navigate("/smarthosp2569/survey2/thankyou");  // ✅ redirect
            });
        } catch (err) {
            console.error(err);
            Swal.fire({
                title: "❌ เกิดข้อผิดพลาด",
                text: "ไม่สามารถส่งแบบประเมินได้ กรุณาลองใหม่อีกครั้ง",
                icon: "error",
                showConfirmButton: false,  // ไม่แสดงปุ่ม
                timer: 2000, // ปิดเองหลัง 2 วินาที
            });
        }
    };

    return (
        <div style={{ fontFamily: "Prompt, sans-serif" }}>
            <div className="d-flex justify-content-center">
                <img src={MophLogo} alt="lg" width={100} />
            </div>
            <div className="carousel">
                {question2.map((q, index) => (
                    <div
                        key={index}
                        className={`slide ${index === current ? "active" : ""}`}
                    >
                        <div className="text-center">
                            {/* <h2>
                                ข้อ {index + 1} / {question2.length}
                            </h2> */}
                            <h3 className="question-text">{index + 1}.{q.text}</h3>
                        </div>

                        {q.options && q.options.some(o => o.type === "text") ? (
                            <>
                                <div className="d-flex justify-content-center">
                                    <textarea
                                        className="textarea"
                                        placeholder="กรอกข้อเสนอแนะของคุณ..."
                                        value={answers[index] || ""}
                                        onChange={handleTextChange}
                                    />
                                </div>
                            </>

                        ) : (
                            <div className="options">
                                {q.options.map(({ icon, label, value }) => (
                                    <div
                                        key={value}
                                        onClick={() => handleSelect(value)}
                                        className={`option ${answers[index] === value ? "selected" : ""
                                            }`}
                                        title={label}
                                    >
                                        {icon}
                                        <span className="label" style={{ fontSize: '16px' }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="buttons">
                {current > 0 && (
                    <button
                        className="btn btn-secondary"
                        onClick={handlePrev}
                        disabled={current === 0}
                        style={{ width: "150px" }}
                    >
                        <ChevronLeft /> ก่อนหน้า
                    </button>
                )}

                {current < question2.length - 1 ? (
                    <button
                        className="btn btn-secondary"
                        onClick={handleNext}
                        // disabled={answers[current] === null}
                        disabled={isNextDisabled()}
                        style={{ width: "150px" }}
                    >
                        ถัดไป <ChevronRight />
                    </button>
                ) : (
                    <button
                        className="btn btn-success"
                        onClick={handleSubmit}
                        // disabled={answers[current] === null}
                        disabled={isNextDisabled()}
                        style={{ width: "150px" }}
                    >
                        ✅ ส่ง
                    </button>
                )}
            </div>
        </div>
    );
}


export default Survey2

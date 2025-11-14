import React from 'react';
import '../scss/thankyou.scss'
import SurveyThanks from '../assets/SurveyThanks.png'


const Thankyou = () => {
    return (
        <>
            <div
                className="thankyou-container"
                style={{ fontFamily: "Prompt, sans-serif" }}
            >
                <div className="thankyou-card">
                    <h2>🎉 ขอบคุณสำหรับการตอบแบบประเมิน!</h2>
                    <p>
                        ความคิดเห็นของคุณมีความหมายต่อเรา
                        เราจะนำไปปรับปรุงบริการให้ดียิ่งขึ้น 💙
                    </p>

                    <img
                        src={SurveyThanks}
                        alt="thankyou"
                        className="thankyou-img"
                    />

                    {/* <Link to="/" className="btn-back">
                        ⬅️ กลับหน้าแรก
                    </Link> */}
                </div>
            </div>
        </>
    )
}

export default Thankyou

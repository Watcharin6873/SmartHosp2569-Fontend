import { Dot } from 'lucide-react'
import React from 'react'

const Survey = () => {
    return (
        <>
            <div className='text-center' style={{ fontFamily: "Prompt, sans-serif", marginTop: "30px" }}>
                <h4><u>แบบสอบถาม"ประเมินความพึงพอใจการรับบริการที่สถานบริการสาธารณสุข"</u></h4>
            </div>
            <div className='alert alert-success' style={{ fontFamily: "Prompt, sans-serif", fontSize: "16px" }} role='alert'>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;แบบสอบถามฉบับนี้จัดทำขึ้นเพื่อประเมินระดับความพึงพอใจของผู้มารับบริการต่อการให้บริการในสถานบริการสาธารณสุข
                    เพื่อให้หน่วยบริการสามารถนำข้อมูลที่ได้ไปใช้ในการพัฒนาคุณภาพบริการให้มีประสิทธิภาพ สะดวก รวดเร็ว
                    และตอบสนองต่อความต้องการของประชาชนมากยิ่งขึ้น</p>
            </div>
            <div style={{ fontFamily: "Prompt, sans-serif" }}>
                <p><u>คำชี้แจง:</u></p>
                <p style={{ fontSize: "16px" }}>
                    1. แบบสอบถามแบ่งออกเป็น 3 ส่วน ได้แก่ <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;o	ส่วนที่ 1 ข้อมูลทั่วไปของผู้ตอบแบบสอบถาม<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;o	ส่วนที่ 2 ความพึงพอใจต่อการรับบริการที่สถานบริการสาธารณสุข<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;o	ส่วนที่ 3 ข้อเสนอแนะเพิ่มเติม<br />
                    2. โปรดเลือกคำตอบที่ตรงกับความคิดเห็นของท่านมากที่สุด หรือกรอกข้อความตามความเหมาะสม<br />
                    3. ข้อมูลที่ได้รับจะถูกเก็บเป็นความลับ ใช้เพื่อการวิเคราะห์เชิงสถิติและปรับปรุงการให้บริการเท่านั้น<br />
                    4.	การตอบแบบสอบถามนี้จะไม่มีผลต่อสิทธิในการรับบริการของท่านแต่อย่างใด<br />
                </p>
                <p>
                    ขอขอบพระคุณทุกท่านที่สละเวลาในการตอบแบบสอบถาม และร่วมเป็นส่วนหนึ่งในการพัฒนาคุณภาพบริการของสถานบริการสาธารณสุข
                </p>
                <form>
                    <div className='card p-2 mb-2'>
                        <p className='fw-bold'>
                            ส่วนที่ 1: ข้อมูลทั่วไปของผู้ตอบแบบสอบถาม
                        </p>
                        <div style={{ fontSize: "16px" }}>
                            1.ท่านมารับบริการที่หน่วยบริการประเภทใด
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="type_service" id="type_service1" />
                                <label className="form-check-label" for="type_service1">
                                    โรงพยาบาล
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="type_service" id="type_service2" />
                                <label className="form-check-label" for="type_service2">
                                    รพ.สต.
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className='card p-2 mb-2'>
                        <p className='fw-bold'>
                            ส่วนที่ 2: ความพึงพอใจต่อการรับบริการที่สถานบริการสาธารณสุข
                        </p>
                        <div style={{ fontSize: "16px" }}>
                            2.	ท่านรู้สึกว่าการใช้บริการครั้งนี้มีความสะดวกมากน้อยเพียงใด
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question2" id="question2no1" />
                                <label className="form-check-label" for="question2no1">
                                    มากที่สุด
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question2" id="question2no2" />
                                <label className="form-check-label" for="question2no2">
                                    มาก
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question2" id="question2no3" />
                                <label className="form-check-label" for="question2no3">
                                    ปานกลาง
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question2" id="question2no4" />
                                <label className="form-check-label" for="question2no2">
                                    น้อย
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question2" id="question2no5" />
                                <label className="form-check-label" for="question2no5">
                                    น้อยที่สุด
                                </label>
                            </div>
                        </div>
                        <div style={{ fontSize: "16px" }}>
                            3. ท่านได้รับความรวดเร็วในขั้นตอนการให้บริการของหน่วยบริการมากน้อยเพียงใด
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question3" id="question2no1" />
                                <label className="form-check-label" for="question2no1">
                                    มากที่สุด
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question3" id="question2no2" />
                                <label className="form-check-label" for="question2no2">
                                    มาก
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question3" id="question2no3" />
                                <label className="form-check-label" for="question2no3">
                                    ปานกลาง
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question3" id="question2no4" />
                                <label className="form-check-label" for="question2no2">
                                    น้อย
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question3" id="question2no5" />
                                <label className="form-check-label" for="question2no5">
                                    น้อยที่สุด
                                </label>
                            </div>
                        </div>
                        <div style={{ fontSize: "16px" }}>
                            4. เจ้าหน้าที่ให้บริการด้วยความสุภาพและเอาใจใส่มากน้อยเพียงใด
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question4" id="question2no1" />
                                <label className="form-check-label" for="question2no1">
                                    มากที่สุด
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question4" id="question2no2" />
                                <label className="form-check-label" for="question2no2">
                                    มาก
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question4" id="question2no3" />
                                <label className="form-check-label" for="question2no3">
                                    ปานกลาง
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question4" id="question2no4" />
                                <label className="form-check-label" for="question2no2">
                                    น้อย
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question4" id="question2no5" />
                                <label className="form-check-label" for="question2no5">
                                    น้อยที่สุด
                                </label>
                            </div>
                        </div>
                        <div style={{ fontSize: "16px" }}>
                            5. ท่านได้รับข้อมูลหรือคำแนะนำทางสุขภาพที่เข้าใจง่ายและเป็นประโยชน์มากน้อยเพียงใด
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question5" id="question2no1" />
                                <label className="form-check-label" for="question2no1">
                                    มากที่สุด
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question5" id="question2no2" />
                                <label className="form-check-label" for="question2no2">
                                    มาก
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question5" id="question2no3" />
                                <label className="form-check-label" for="question2no3">
                                    ปานกลาง
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question5" id="question2no4" />
                                <label className="form-check-label" for="question2no2">
                                    น้อย
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question5" id="question2no5" />
                                <label className="form-check-label" for="question2no5">
                                    น้อยที่สุด
                                </label>
                            </div>
                        </div>
                        <div style={{ fontSize: "16px" }}>
                            6. โดยภาพรวมท่านพึงพอใจต่อการรับบริการในครั้งนี้มากน้อยเพียงใด
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question6" id="question2no1" />
                                <label className="form-check-label" for="question2no1">
                                    มากที่สุด
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question6" id="question2no2" />
                                <label className="form-check-label" for="question2no2">
                                    มาก
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question6" id="question2no3" />
                                <label className="form-check-label" for="question2no3">
                                    ปานกลาง
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question6" id="question2no4" />
                                <label className="form-check-label" for="question2no2">
                                    น้อย
                                </label>
                            </div>
                            <div className="form-check" style={{ marginLeft: "15px" }}>
                                <input className="form-check-input" type="radio" name="question6" id="question2no5" />
                                <label className="form-check-label" for="question2no5">
                                    น้อยที่สุด
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className='card p-2 mb-2'>
                        <p className='fw-bold'>
                            ส่วนที่ 3: ข้อเสนอแนะเพิ่มเติม
                        </p>
                        <div style={{ fontSize: "16px" }}>
                            7. ข้อเสนอแนะหรือความคิดเห็นอื่น ๆ เพื่อการพัฒนาบริการ (ตอบเพิ่มเติมได้ตามสมัครใจ)
                            <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
                        </div>
                    </div>
                    <div className='d-grid mb-3'>
                        <button type="button" className="btn btn-success">ส่งแบบสอบถาม</button>
                    </div>
                </form>
            </div>
        </>

    )
}

export default Survey

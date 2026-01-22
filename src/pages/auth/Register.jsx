import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Modal } from "bootstrap"; // ใช้ JS API ของ Bootstrap modal
import { saveRegister } from '../../api/User';
import { toast } from 'react-toastify';
import LogoSmartHosp from '../../assets/SmartHospital-Logo.png';
import Provider_id from '../../assets/Provider-id.png';

const Register = ({callbackData}) => {

  const navigate = useNavigate();
  const [providerProfile, setProviderProfile] = useState(null);
  const [listHosp, setListHosp] = useState([]);
  const [selectedHosp, setSelectedHosp] = useState(null);
  const [hospData, setHospData] = useState(null); // ✅ เก็บข้อมูลโรงพยาบาลที่เลือกไว้
  const [providerProfileData, setProviderProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zone, setZone] = useState("Unit_service");
  const [userType, setUserType] = useState("");

  const modalRef = useRef(null);
  const modalFormRef = useRef(null);
  const modalInstanceRef = useRef(null);
  const modalFormInstance = useRef(null);

  const scope = [
    "cid",
    "title_th",
    "title_eng",
    "name_th",
    "name_eng",
    "mobile_number",
    "email",
    "organization",
    "ial",
    "idp_permission",
    "offline_access"].join(" ");

  const redirect_url = import.meta.env.VITE_REDIRECT_URL; //import.meta.env.VITE_REGIS_URL_PUBLIC;
  const p_client_id = import.meta.env.VITE_CLIENT_ID;
  // console.log("redirect =", import.meta.env.VITE_REDIRECT_URL);

  
  const urlRequest = () => {
    window.location.href = `https://provider.id.th/v1/oauth2/authorize?client_id=${p_client_id}&response_type=code&redirect_uri=${redirect_url}&scope=${encodeURIComponent(scope)}&state=register`
  }

  useEffect(() => {
    if (callbackData) {
      const profile = callbackData.profile;
      setProviderProfile(profile);
      const orgList = callbackData.profile.organization || [];
      setListHosp(orgList);

      // ถ้ามีมากกว่า 1 ให้เปิด modal
      if (orgList.length > 1) {
        // สร้าง instance ของ Modal จาก ref
        if (modalRef.current) {
          modalInstanceRef.current = new Modal(modalRef.current);
          modalInstanceRef.current.show();
        }
      }
      // ถ้ามีแค่ 1 โรงพยาบาล — เลือกให้อัตโนมัติ
      if (orgList.length === 1) {
        const hosp = orgList[0];
        setSelectedHosp(String(hosp.hcode));
        setHospData(hosp);
        localStorage.setItem("hospData", JSON.stringify(hosp)); // ✅ เก็บไว้ใน localStorage
        openFormModal(hosp, profile);
      }
    }
  }, []);

  // 🧩 ฟังก์ชันเปิด modal ฟอร์ม
  const openFormModal = (hosp, profile) => {
    setHospData(hosp);
    setZone("");       // reset zone
    setUserType("Unit_service"); // reset userType
    setProviderProfile(profile);

    // เปิด modal ฟอร์ม
    modalFormInstance.current = new Modal(modalFormRef.current);
    modalFormInstance.current.show();
  }

  const handleConfirm = () => {
    if (!selectedHosp) return;

    const selected = listHosp.find((h) => String(h.hcode) === String(selectedHosp));
    setHospData(selected); // ✅ เก็บใน state

    if (modalInstanceRef.current) {
      modalInstanceRef.current.hide();
    }

    // เปิด Modal ฟอร์มหลังปิด ListHospModal
    setTimeout(() => openFormModal(selected, providerProfile), 400);
  };

  const zoneOptions = [
    { id: "1", name: "เขตสุขภาพที่ 1" },
    { id: "2", name: "เขตสุขภาพที่ 2" },
    { id: "3", name: "เขตสุขภาพที่ 3" },
    { id: "4", name: "เขตสุขภาพที่ 4" },
    { id: "5", name: "เขตสุขภาพที่ 5" },
    { id: "6", name: "เขตสุขภาพที่ 6" },
    { id: "7", name: "เขตสุขภาพที่ 7" },
    { id: "8", name: "เขตสุขภาพที่ 8" },
    { id: "9", name: "เขตสุขภาพที่ 9" },
    { id: "10", name: "เขตสุขภาพที่ 10" },
    { id: "11", name: "เขตสุขภาพที่ 11" },
    { id: "12", name: "เขตสุขภาพที่ 12" },
  ];

  const userTypeOption = [
    { id: "Unit_service", name: "ผู้ประเมินหน่วยบริการ" },
    { id: "Prov", name: "ผู้อนุมัติระดับจังหวัด" },
    { id: "Zone", name: "ผู้อนุมัติระดับเขตฯ" }
  ]

  // 💾 บันทึกข้อมูลไปยัง API
  const handleSaveData = async () => {
    const dataProfile = {
      email: providerProfile.email,
      title_th: providerProfile.title_th,
      name_th: providerProfile.name_th,
      position_id: hospData?.position_id,
      position: hospData?.position,
      hcode: hospData?.hcode,
      hcode9: hospData?.hcode9,
      hname_th: hospData?.hname_th,
      district: hospData?.address?.district,
      province: hospData?.address?.province,
      zone: zone,
      user_type: userType
    };
    if (!dataProfile) return;

    try {
      setLoading(true);
      const res = await saveRegister(dataProfile); // Axios call

      if (modalFormInstance.current) {
        modalFormInstance.current.hide();
      }

      toast.success(res.data.message); // ใช้ message จาก server
      navigate('/smarthosp2569/page-auth')
    } catch (err) {
      toast.error(err?.response?.data.message || err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div style={{ fontFamily: "Sarabun, sans-serif" }}>
        {/* Modal ListHosp */}
        <div
          className="modal fade"
          id="listHospModal"
          tabIndex="-1"
          aria-labelledby="listHospModalLabel"
          aria-hidden="true"
          ref={modalRef}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title" id="listHospModalLabel">
                  🏥 เลือกหน่วยบริการ
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {listHosp.length > 0 ? (
                  <div className="btn-group-vertical w-100" role="group" aria-label="Hosp list">
                    {listHosp.map((h, idx) => {
                      const hospId = String(h.hcode);
                      const hospName = h.hname_th || h.name || `โรงพยาบาล ${idx + 1}`;
                      return (
                        <React.Fragment key={idx}>
                          <input
                            type="radio"
                            className="btn-check"
                            name="hospOptions"
                            id={`hosp-${idx}`}
                            value={hospId}
                            checked={selectedHosp === hospId}
                            onChange={(e) => setSelectedHosp(e.target.value)}  // ✅ ใช้ค่าจาก event โดยตรง
                          />
                          <label
                            className="btn btn-outline-primary text-start py-2 px-3 mb-2 rounded-3"
                            htmlFor={`hosp-${idx}`}
                            style={{ fontWeight: selectedHosp === hospId ? "600" : "normal" }}
                          >
                            {hospName}
                          </label>
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted">ไม่มีข้อมูลหน่วยบริการ</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  disabled={!selectedHosp}
                  onClick={handleConfirm}
                >
                  ยืนยันการเลือก
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* End Modal ListHosp */}

        {/* Modal 2: ฟอร์มบันทึกข้อมูล */}
        <div
          className="modal fade"
          id="formModal"
          tabIndex="-1"
          aria-labelledby="formModalLabel"
          aria-hidden="true"
          ref={modalFormRef}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">📋 ฟอร์มบันทึกข้อมูล</h5>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>

              <div className="modal-body">
                {hospData && providerProfile && (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">คำนำหน้าชื่อ</label>
                      <input
                        className="form-control"
                        value={`${providerProfile.title_th}`}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">ชื่อ - สกุล</label>
                      <input
                        className="form-control"
                        value={`${providerProfile.name_th}`}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">รหัสตำแหน่ง</label>
                      <input className="form-control" value={hospData.position_id || ""} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">ตำแหน่ง</label>
                      <input className="form-control" value={hospData.position || ""} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">อีเมล</label>
                      <input className="form-control" value={providerProfile.email} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">รหัสหน่วยบริการ 5 หลัก</label>
                      <input className="form-control" value={hospData.hcode} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">รหัสหน่วยบริการ 9 หลัก</label>
                      <input className="form-control" value={hospData.hcode9} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">ชื่อหน่วยบริการ</label>
                      <input className="form-control" value={hospData.hname_th} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">อำเภอ</label>
                      <input className="form-control" value={hospData.address.district || ""} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">จังหวัด</label>
                      <input className="form-control" value={hospData.address.province || ""} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">เขตสุขภาพ</label>
                      <select
                        className="form-select"
                        value={zone}
                        onChange={(e) => setZone(e.target.value)}
                      >
                        <option value="">-- เลือกเขตสุขภาพ --</option>
                        {zoneOptions.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">ประเภทผู้ใช้งาน</label>
                      <select
                        className="form-select"
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                      >
                        <option value="">-- เลือกประเภทผู้ใช้งาน --</option>
                        {userTypeOption.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" data-bs-dismiss="modal">
                  ปิด
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleSaveData}
                  disabled={!zone || !userType || loading}
                >
                  {loading ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* End  Modal 2: ฟอร์มบันทึกข้อมูล */}
      </div>
    </>
  )
}

export default Register

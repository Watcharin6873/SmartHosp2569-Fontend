import React, { useEffect, useRef, useState } from 'react';
import { Modal } from "bootstrap"; // ใช้ JS API ของ Bootstrap modal
import { useLocation, useNavigate } from 'react-router';
import LogoSmartHosp from '../../assets/SmartHospital-Logo.png';
import Provider_id from '../../assets/Provider-id.png';
import axios from 'axios';
import { getListUserForCheck } from '../../api/User';
import useGlobalStore from '../../store/global-store';
import { toast } from 'react-toastify';
import Swal from "sweetalert2";

const Login = ({ callbackData }) => {

  const navigate = useNavigate();
  const actionLogin = useGlobalStore((state) => state.actionLogin);
  const user = useGlobalStore((state) => state.user);
  const [providerProfile, setProviderProfile] = useState({});
  const [listHosp, setListHosp] = useState([]);
  const [selectedHosp, setSelectedHosp] = useState(null);
  const [hospData, setHospData] = useState(null); // ✅ เก็บข้อมูลโรงพยาบาลที่เลือกไว้
  const [loading, setLoading] = useState(false);
  const [listAccount, setListAccount] = useState([]);
  const [selectAccount, setSelectAccount] = useState("");


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

  const redirect_url = import.meta.env.VITE_REDIRECT_URL; //import.meta.env.VITE_LOG_URL_PUBLIC;
  const p_client_id = import.meta.env.VITE_CLIENT_ID;
  // console.log("redirect =", import.meta.env.VITE_REDIRECT_URL);

  // const location = useLocation();
  // const callbackData = location.state;
  // console.log('Data:', callbackData)

  const urlRequest = () => {
    window.location.href = `https://provider.id.th/v1/oauth2/authorize?client_id=${p_client_id}&response_type=code&redirect_uri=${redirect_url}&scope=${encodeURIComponent(scope)}&state=login`
  }


  useEffect(() => {
    if (!callbackData?.profile) return;

    const profile = callbackData.profile;
    // console.log("profile:", profile);

    setProviderProfile(profile);
    localStorage.setItem("providerProfile", JSON.stringify(profile));

    const orgList = profile.organization || [];
    setListHosp(orgList);
    // console.log("orgList:", orgList);

    // ✅ มากกว่า 1 = เปิด modal ให้เลือก
    if (orgList.length > 1) {
      if (modalRef.current) {
        modalInstanceRef.current = new Modal(modalRef.current);
        modalInstanceRef.current.show();
      }
    }

    // ✅ เท่ากับ 1 = ข้าม modal → ไปเช็ค user เลย
    if (orgList.length === 1) {
      processHospSelection(orgList[0], profile);
    }
  }, [callbackData]);


  const processHospSelection = async (hosp, profile) => {
    setSelectedHosp(String(hosp.hcode));
    setHospData(hosp);
    localStorage.setItem("hospData", JSON.stringify(hosp));

    const dataProfile = {
      email: profile.email,
      title_th: profile.title_th,
      name_th: profile.name_th,
      position_id: hosp?.position_id,
      position: hosp?.position,
      hcode: hosp?.hcode,
      hcode9: hosp?.hcode9,
      hname_th: hosp?.hname_th
    };

    // console.log("DataProfile:", dataProfile);

    try {
      const res = await getListUserForCheck(dataProfile);
      setListAccount(res.data);
      // console.log("listAccount:", res.data);

      // เปิดฟอร์ม modal หลังเช็ค user เสร็จ
      openFormModal(hosp, profile);
    } catch (err) {
      console.log(err);
    }
  };



  // 🧩 ฟังก์ชันเปิด modal ฟอร์ม
  const openFormModal = (hosp, profile) => {
    setHospData(hosp);
    setProviderProfile(profile);

    // เปิด modal ฟอร์ม
    modalFormInstance.current = new Modal(modalFormRef.current);
    modalFormInstance.current.show();
  }

  const handleConfirm = () => {
    if (!selectedHosp) return;

    const selected = listHosp.find(
      (h) => String(h.hcode) === String(selectedHosp)
    );

    if (modalInstanceRef.current) {
      modalInstanceRef.current.hide();
    }

    processHospSelection(selected, providerProfile);
  };


  const returnUserType = (user_type) => {
    switch (user_type) {
      case 'Unit_service':
        return 'ผู้ประเมินหน่วยบริการ'
      case 'Prov':
        return 'คกก.ระดับจังหวัด'
      case 'Zone':
        return 'คกก.ระดับเขตฯ'
      case 'Centre':
        return 'Admin ส่วนกลาง'
      default:
        return '-'
    }
  }

  const statusUser = (enabled) => {
    switch (enabled) {
      case true:
        return '✅ อนุมัติแล้ว!'
      case false:
        return '⛔ ยังไม่อนุมัติ'
      default:
        return 'unknow'
    }
  }

  const handleLogin = () => {
    if (!selectAccount) return;

    const selectAcc = listAccount.find((a) => String(a.user_type) === String(selectAccount));
    // console.log('Selected Account:', selectAcc);

    const result = actionLogin(selectAcc)
    if (result && user) {
      const role = user?.role
      const usertype = user?.user_type

      if (role !== null) {
        if (modalFormInstance.current) {
          modalFormInstance.current.hide();
        }
        // toast.success(`🤝ยินดีต้อนรับคุณ${user.name_th}`)

        if (role === 'admin' && usertype === 'Centre') {
          setTimeout(() => navigate('/smarthosp2569/admin'), 2000)
        } else if (role === 'user' && usertype === 'Unit_service') {
          setTimeout(() => navigate('/smarthosp2569/user/responder'), 2000)
        } else if (role === 'user' && usertype === 'Prov') {
          setTimeout(() => navigate('/smarthosp2569/user/prov-approve'), 2000)
        } else if (role === 'user' && usertype === 'Zone') {
          setTimeout(() => navigate('/smarthosp2569/user/zone-approve'), 2000)
        }

        Swal.fire({
          title: "📢 ล็อกอินเข้าใช้งานระบบสำเร็จ!",
          text: `🤝ยินดีต้อนรับคุณ${user?.name_th}`,
          icon: "success",
          showConfirmButton: false,
          timer: 2000
        });
      }
    }
  }


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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">📋 กรุณาเลือกประเภทผู้ใช้งานเพื่อล็อกอิน</h5>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>

              <div className="modal-body">
                {listAccount.length > 0 ? (
                  <div className="btn-group-vertical w-100" role="group" aria-label="user type">
                    {
                      listAccount.map((a, idx) => {
                        const uType = a.user_type
                        const uTypeText = returnUserType(a.user_type)
                        const uStatus = statusUser(a.enabled)
                        return (
                          <React.Fragment key={idx}>
                            <input
                              type="radio"
                              className="btn-check"
                              name="accountOptions"
                              id={`acc-${idx}`}
                              value={uType}
                              disabled={a.enabled === false}
                              checked={selectAccount === uType}
                              onChange={(e) => setSelectAccount(e.target.value)}  // ✅ ใช้ค่าจาก event โดยตรง
                            />
                            <label
                              className="btn btn-outline-primary d-flex justify-content-between align-items-center text-start py-2 px-3 mb-2 rounded-3"
                              htmlFor={`acc-${idx}`}
                              style={{ fontWeight: selectAccount === uType ? "600" : "normal" }}
                            >
                              <span>{uTypeText}</span>
                              <span className={a.enabled === true ? 'text-success' : 'text-danger'}>({uStatus})</span>
                            </label>
                          </React.Fragment>
                        );
                      })
                    }
                  </div>
                ) : (
                  <p className="text-muted">ไม่มีข้อมูล Account</p>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" data-bs-dismiss="modal">
                  ปิด
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleLogin}
                  disabled={!selectAccount}
                >
                  {loading ? "กำลังล็อกอิน..." : "🔑 ล็อกอิน"}
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

export default Login

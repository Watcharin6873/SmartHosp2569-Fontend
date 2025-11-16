import React, { useEffect, useRef, useState } from 'react';
import '../../index.css';
import useGlobalStore from '../../store/global-store';
import { useNavigate } from 'react-router';
import { Modal } from 'bootstrap';
import { changeStatusTopic, createTopic, deleteTopic, getListTopic, getTopicById, updateTopic } from '../../api/Topic';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const CreateTopic = () => {

  const navigate = useNavigate();
  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [listTopic, setListTopic] = useState([]);
  const [formData, setFormData] = useState({
    topic_name: "",
    user_id: user?.id
  });

  const [topicData, setTopicData] = useState({
    id: "",
    topic_name: "",
    user_id: user?.id
  })


  // Modal form create
  const modalFormRef = useRef(null);
  const modalFormInstance = useRef(null);
  // Modal form update
  const modalFormUpdateRef = useRef(null);
  const modalFormUpdateInstance = useRef(null);


  useEffect(() => {
    findListTopic(token)
  }, []);

  const findListTopic = async () => {
    try {
      setIsLoading(true);
      const res = await getListTopic(token);
      setListTopic(res.data);
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false);
    }
  }

  const openFormTopic = () => {
    // สร้าง instance ของ Modal จาก ref
    if (modalFormRef.current) {
      modalFormInstance.current = new Modal(modalFormRef.current);
      modalFormInstance.current.show();
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleChangeUpdate = (e) => {
    setTopicData({ ...topicData, [e.target.name]: e.target.value });
  }

  const isFormValid = formData.topic_name.trim() !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const res = await createTopic(token, formData);

      if (modalFormInstance.current) {
        modalFormInstance.current.hide();
      }

      findListTopic(token)

      Swal.fire({
        title: "📢 แจ้งผลการบันทึกข้อมูล!",
        text: `${res.data.message}`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleChangeStatus = async (e, id) => {
    const newStatus = e.target.checked
    const status = newStatus === true ? true : false;
    const values = {
      id: id,
      status: status,
      user_id: user.id
    }

    try {
      const res = await changeStatusTopic(token, values);

      findListTopic(token)
      Swal.fire({
        title: "📢 แจ้งผลการเปลี่ยนสถานะ!",
        text: `${res.data.message}`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000
      });
    } catch (err) {
      console.log(err.response.data)
    }

  }

  const openModalUpdate = async (id) => {
    // สร้าง instance ของ Modal จาก ref
    if (modalFormUpdateRef.current) {
      modalFormUpdateInstance.current = new Modal(modalFormUpdateRef.current);
      modalFormUpdateInstance.current.show()
    }

    try {
      const res = await getTopicById(token, id);
      setTopicData(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  // Update topic
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await updateTopic(token, topicData);

      if (modalFormUpdateInstance.current) {
        modalFormUpdateInstance.current.hide();
      }

      findListTopic(token);
      Swal.fire({
        title: "📢 แจ้งผลการแก้ไขข้อมูล!",
        text: `${res.data.message}`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  // Delete topic
  const handleDeleteTopic = async (id) => {
    // console.log('Data: ', id)

    try {
      setIsLoading(false);
      const res = await deleteTopic(token, id);

      if (modalFormUpdateInstance.current) {
        modalFormUpdateInstance.current.hide();
      }

      findListTopic(token);
      Swal.fire({
        title: "📢 แจ้งผลการลบข้อมูล!",
        text: `${res.data.message}`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000
      });

    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <>
      <div style={{ fontFamily: "Sarabun, sans-serif" }}>
        <div className='d-flex justify-content-center mt-2'>
          <h3>🗂️ เพิ่มหัวข้อแบบประเมิน</h3>
        </div>
        <div className='d-flex justify-content-end'>
          <button
            className='btn btn-sm btn-success rounded-5'
            onClick={openFormTopic}
          >
            ✚ เพิ่มหัวข้อแบบประเมิน
          </button>
        </div>

        <div className="table-responsive mt-3">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th className='text-center'>ลำดับ</th>
                <th className='text-center'>ชื่อแบบประเมิน</th>
                <th className='text-center'>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {
                listTopic.length > 0 ? (
                  listTopic.map((t, idx) => (
                    <tr key={idx}>
                      <td className='text-center'>{idx + 1}</td>
                      <td>
                        <div
                          className='hover-clickable fs-6'
                          onClick={() => openModalUpdate(t.id)}
                        >
                          {t.topic_name}
                        </div>
                      </td>
                      <td className='text-center'>
                        <div className='form-check form-switch d-flex justify-content-center'>
                          <input
                            className='form-check-input switch-lg'
                            type='checkbox'
                            role="switch"
                            id='flexSwitchCheckbox'
                            checked={t.status === true}
                            onChange={(e) => handleChangeStatus(e, t.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className='text-center'>
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )
              }

            </tbody>
          </table>
        </div>

        {/* Modal form create */}
        <div
          className='modal fade'
          id='formCreateModal'
          tabIndex='-1'
          aria-labelledby='formCreateModalLabel'
          aria-hidden='true'
          ref={modalFormRef}
        >
          <div className='modal-dialog'>
            <div className='modal-content shadow-lg border-0'>
              <div className='modal-header bg-success text-white'>
                <h5 className='modal-title' id='formCreateModalLabel'>
                  📋 ฟอร์มบันทึกชื่อแบบประเมิน
                </h5>
                <button
                  type='button'
                  className='btn-close btn-close-white'
                  data-bs-dismiss='modal'
                  aria-label='Close'
                ></button>
              </div>
              <div className='modal-body'>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">ชื่อแบบประเมิน</label>
                    <input
                      type="text"
                      name="topic_name"
                      className="form-control"
                      value={formData.topic_name}
                      onChange={handleChange}
                      placeholder="ชื่อแบบประเมิน"
                      required
                    />
                  </div>
                  <div className='modal-footer'>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      ปิด
                    </button>
                    <button
                      type='submit'
                      className="btn btn-success"
                      disabled={!isFormValid}
                    >
                      {isLoading ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* End modal form create */}

        {/* Modal form update */}
        <div
          className='modal fade'
          id='formUpdateModal'
          tabIndex='-1'
          aria-labelledby='formUpdateModalLabel'
          aria-hidden='true'
          ref={modalFormUpdateRef}
        >
          <div className='modal-dialog'>
            <div className='modal-content shadow-lg border-0'>
              <div className='modal-header bg-success text-white'>
                <h5 className='modal-title' id='formUpdateModalLabel'>
                  📋 ฟอร์มแก้ไขชื่อแบบประเมิน
                </h5>
                <button
                  type='button'
                  className='btn-close btn-close-white'
                  data-bs-dismiss='modal'
                  aria-label='Close'
                ></button>
              </div>
              <div className='modal-body'>
                <form onSubmit={handleUpdateSubmit}>
                  <div className="mb-3">
                    <label className="form-label">ชื่อแบบประเมิน</label>
                    <input
                      type="text"
                      name="topic_name"
                      className="form-control"
                      value={topicData?.topic_name || ""}
                      onChange={handleChangeUpdate}
                      placeholder="ชื่อแบบประเมิน"
                      required
                    />
                  </div>
                  <div className='modal-footer d-flex justify-content-between'>
                    <div>
                      <button
                        className='btn btn-sm btn-danger'
                        type='button'
                        onClick={() => handleDeleteTopic(topicData?.id)}
                      >
                        ลบ
                      </button>
                    </div>
                    <div className='d-flex gap-2'>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        data-bs-dismiss="modal"
                      >
                        ปิด
                      </button>
                      <button
                        type='submit'
                        className="btn btn-sm btn-success"
                      >
                        {isLoading ? "กำลังแก้ไข..." : "📝 แก้ไขข้อมูล"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* End modal form update */}



      </div>

    </>
  )
}

export default CreateTopic

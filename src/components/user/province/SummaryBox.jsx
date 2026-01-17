import React from 'react'

const SummaryBox = ({ levelCount, title }) => {
  return (
    <>
      <div className="fw-bold mb-2 text-center">{title}</div>

      <div className="d-flex justify-content-between">
        <span className="fw-bold text-primary">💎 ระดับเพชร</span>
        <span className="fw-bold text-primary">
          {levelCount?.ระดับเพชร || 0}
        </span>
      </div>

      <div className="d-flex justify-content-between">
        <span className="fw-bold text-warning">🟡 ระดับทอง</span>
        <span className="fw-bold text-warning">
          {levelCount?.ระดับทอง || 0}
        </span>
      </div>

      <div className="d-flex justify-content-between">
        <span className="fw-bold text-secondary">⚪ ระดับเงิน</span>
        <span className="fw-bold text-secondary">
          {levelCount?.ระดับเงิน || 0}
        </span>
      </div>

      <div className="d-flex justify-content-between">
        <span className="fw-bold text-danger">🔴 ไม่ผ่าน</span>
        <span className="fw-bold text-danger">
          {levelCount?.ไม่ผ่าน || 0}
        </span>
      </div>
    </>
  )
}

export default SummaryBox

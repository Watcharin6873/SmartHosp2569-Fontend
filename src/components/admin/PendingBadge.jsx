import React from 'react'

const PendingBadge = ({count}) => {
    if (!count || count === 0) return null;
  return (
    <span className='badge bg-danger ms-2'>
        {count}
    </span>
  )
}

export default PendingBadge

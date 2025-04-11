import React from 'react';
import { MoreVertical } from 'lucide-react';

const ThreeDotMenu = ({ onCompleteView }) => {
  return (
    <div className="dropdown dropdown-end">
      <button className="btn btn-ghost btn-sm p-1">
        <MoreVertical className="w-5 h-5" />
      </button>
      <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li>
          <button onClick={onCompleteView}>View Details</button>
        </li>
      </ul>
    </div>
  );
};

export default ThreeDotMenu;
import { Users } from 'lucide-react';
import React from 'react'

const NoStudentsFound = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <Users size={64} className="text-gray-500 mb-4" />
    <h2 className="text-2xl font-semibold text-gray-300 mb-2">No Students Found</h2>
    <p className="text-gray-400 max-w-md">
      There are no students currently registered in the system. Please add students to see them listed here.
    </p>
  </div>
);


export default NoStudentsFound
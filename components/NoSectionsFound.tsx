import { FolderX } from 'lucide-react';
import React from 'react'

const NoSectionsFound = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <FolderX size={64} className="text-gray-500 mb-4" />
    <h2 className="text-2xl font-semibold text-gray-300 mb-2">No Classes Found</h2>
    <p className="text-gray-400 max-w-md">
      No class sections have been created yet. Sections will appear here once students are organized into classes.
    </p>
  </div>
);

export default NoSectionsFound
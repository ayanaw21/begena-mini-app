import { FolderX } from 'lucide-react';
import React from 'react'

import { EmptyState } from './ui/empty-state';

const NoSectionsFound = () => (
  <EmptyState
    icon={<FolderX size={20} />}
    title="No sections yet"
    description="No class sections have been created. Sections appear here once students are organized into classes."
  />
);

export default NoSectionsFound
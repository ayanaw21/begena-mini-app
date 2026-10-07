import { Users } from 'lucide-react';
import React from 'react'

import { EmptyState } from './ui/empty-state';

const NoStudentsFound = () => (
  <EmptyState
    icon={<Users size={20} />}
    title="No students yet"
    description="There are no students registered in the system. Once students are added they will be listed here."
  />
);


export default NoStudentsFound
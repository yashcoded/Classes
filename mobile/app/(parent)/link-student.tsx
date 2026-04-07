import React from 'react';
// Relative import avoids Metro occasionally mis-resolving `@/` from nested `app/(group)/` routes
import LinkStudentScreen from '../../src/features/parent/LinkStudentScreen';

export default function LinkStudentPage(): React.ReactElement {
  return <LinkStudentScreen />;
}

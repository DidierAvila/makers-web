'use client';

import { UserProfile } from '@/modules/shared/components/profile';
import { Container } from '@mui/material';

export default function ProfilePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <UserProfile />
    </Container>
  );
}

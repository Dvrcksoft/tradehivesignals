import { Box, Container, Text } from '@mantine/core';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import PinForm from '../../components/forms/PinForm';
import Page from '../../components/others/Page';
import AuthGuard from '../../guards/AuthGuard';
import Layout from '../../layouts';

import { useFirestoreStoreAdmin } from '../../models_store/firestore_store_admin';

export default function PinEditPage() {
  const router = useRouter();
  const id = router.query.id as string;

  return (
    <AuthGuard>
      <Layout variant='admin'>
        <Page title='Contact'>
          <Container size='xl' className=''>
            <Box className='flex flex-col w-full mx-auto mt-2 mb-10'>
              <Text className='text-2xl font-semibold leading-10 cursor-pointer'>Update Pin Message</Text>
            </Box>
            <PinForm id={id} />
          </Container>
        </Page>
      </Layout>
    </AuthGuard>
  );
}

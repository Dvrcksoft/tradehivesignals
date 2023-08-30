import { Box, Button, Container, Text } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import AnalForm from '../../components/forms/AnalForm';
import Iconify from '../../components/others/Iconify';
import Page from '../../components/others/Page';
import AuthGuard from '../../guards/AuthGuard';
import Layout from '../../layouts';
import { useFirestoreStoreAdmin } from '../../models_store/firestore_store_admin';

export default function DashboardPage() {
  const router = useRouter();
  const id = router.query.id as string;

  const { setIsHandleAnalSubmitCalled, isHandleAnalSubmitCalled } = useFirestoreStoreAdmin((state) => state);

  return (
    <AuthGuard>
      <Layout variant='admin'>
        <Page title='Home'>
          <Container size={'xl'} className='mt-3'>
            <div className='flex justify-between'>
              <Box className='flex items-center'>
                <Link href={'/anals'}>
                  <Text className='text-2xl font-semibold leading-10 cursor-pointer'>Analytic</Text>
                </Link>
                <Iconify icon={'dashicons:arrow-right-alt2'} className='mx-2' />
                <Text>edit</Text>
              </Box>

              <div>
                <Button loading={isHandleAnalSubmitCalled} className='btn-app' onClick={() => setIsHandleAnalSubmitCalled(true)}>
                  Submit
                </Button>
              </div>
            </div>

            <div className='mt-10' />

            <AnalForm id={id} />
          </Container>
        </Page>
      </Layout>
    </AuthGuard>
  );
}

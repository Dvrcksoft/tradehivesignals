import { Box, Button, Container, Text } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import LessnForm from '../../components/forms/LessnForm';
import Iconify from '../../components/others/Iconify';
import Page from '../../components/others/Page';
import AuthGuard from '../../guards/AuthGuard';
import Layout from '../../layouts';
import { useFirestoreStoreAdmin } from '../../models_store/firestore_store_admin';

export default function DashboardPage() {
  const router = useRouter();
  const id = router.query.id as string;

  const { setIsHandleLessnSubmitCalled, isHandleLessnSubmitCalled } = useFirestoreStoreAdmin((state) => state);

  return (
    <AuthGuard>
      <Layout variant='admin'>
        <Page title='Home'>
          <Container size={'xl'} className='mt-3'>
            <div className='flex justify-between'>
              <Box className='flex items-center'>
                <Link href={'/lessns'}>
                  <Text className='text-2xl font-semibold leading-10 cursor-pointer'>Lessons</Text>
                </Link>
                <Iconify icon={'dashicons:arrow-right-alt2'} className='mx-2' />
                <Text>edit</Text>
              </Box>

              <div>
                <Button loading={isHandleLessnSubmitCalled} className='btn-app' onClick={() => setIsHandleLessnSubmitCalled(true)}>
                  Submit
                </Button>
              </div>
            </div>

            <div className='mt-10' />

            <LessnForm id={id} />
          </Container>
        </Page>
      </Layout>
    </AuthGuard>
  );
}

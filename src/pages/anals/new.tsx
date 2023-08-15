import { Button, Container, Text } from '@mantine/core';
import { ReactElement } from 'react';
import Page from '../../components/others/Page';

import AnalForm from '../../components/forms/AnalForm';
import AuthGuard from '../../guards/AuthGuard';
import Layout from '../../layouts';
import { useFirestoreStoreAdmin } from '../../models_store/firestore_store_admin';

export default function DashboardPage() {
  const { setIsHandleAnalSubmitCalled, isHandleAnalSubmitCalled } = useFirestoreStoreAdmin((state) => state);

  return (
    <AuthGuard>
      <Layout variant='admin'>
        <Page title='New Analytic'>
          <Container size={'xl'} className='mt-3'>
            <div className='flex justify-between'>
              <Text className='text-2xl font-semibold leading-10 cursor-pointer'>Analytics</Text>
              <div>
                <Button loading={isHandleAnalSubmitCalled} className='btn-app' onClick={() => setIsHandleAnalSubmitCalled(true)}>
                  Submit
                </Button>
              </div>
            </div>
            <div className='mt-10' />

            <AnalForm />
          </Container>
        </Page>
      </Layout>
    </AuthGuard>
  );
}

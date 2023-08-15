import { Button, Container, Text } from '@mantine/core';
import { ReactElement } from 'react';
import Page from '../../components/others/Page';

import StrategForm from '../../components/forms/StrategForm';
import AuthGuard from '../../guards/AuthGuard';
import Layout from '../../layouts';
import { useFirestoreStoreAdmin } from '../../models_store/firestore_store_admin';

export default function DashboardPage() {
  const { setIsHandleStrategSubmitCalled, isHandleStrategSubmitCalled } = useFirestoreStoreAdmin((state) => state);

  return (
    <AuthGuard>
      <Layout variant='admin'>
        <Page title='New Strategy'>
          <Container size={'xl'} className='mt-3'>
            <div className='flex justify-between'>
              <Text className='text-2xl font-semibold leading-10 cursor-pointer'>Strategy</Text>
              <div>
                <Button loading={isHandleStrategSubmitCalled} className='btn-app' onClick={() => setIsHandleStrategSubmitCalled(true)}>
                  Submit
                </Button>
              </div>
            </div>
            <div className='mt-10' />

            <StrategForm />
          </Container>
        </Page>
      </Layout>
    </AuthGuard>
  );
}

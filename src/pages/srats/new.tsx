import { Button, Container, Text } from '@mantine/core';
import { ReactElement } from 'react';
import Page from '../../components/others/Page';

import SratForm from '../../components/forms/SratForm';
import AuthGuard from '../../guards/AuthGuard';
import Layout from '../../layouts';
import { useFirestoreStoreAdmin } from '../../models_store/firestore_store_admin';

export default function DashboardPage() {
  const { setIsHandleSratSubmitCalled, isHandleSratSubmitCalled } = useFirestoreStoreAdmin((state) => state);

  return (
    <AuthGuard>
      <Layout variant='admin'>
        <Page title='New Strategy'>
          <Container size={'xl'} className='mt-3'>
            <div className='flex justify-between'>
              <Text className='text-2xl font-semibold leading-10 cursor-pointer'>Strategy</Text>
              <div>
                <Button loading={isHandleSratSubmitCalled} className='btn-app' onClick={() => setIsHandleSratSubmitCalled(true)}>
                  Submit
                </Button>
              </div>
            </div>
            <div className='mt-10' />

            <SratForm />
          </Container>
        </Page>
      </Layout>
    </AuthGuard>
  );
}

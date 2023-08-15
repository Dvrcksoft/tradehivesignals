import { Box, Button, Container, Text } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import Iconify from '../../components/others/Iconify';
import Page from '../../components/others/Page';
import { BaseTable } from '../../components/tables/BaseTable';
import AuthGuard from '../../guards/AuthGuard';
import Layout from '../../layouts';
import { AnalModel } from '../../models/model.anal';
import { apiDeleteAnal } from '../../models_services/firestore_anal_service';
import { useFirestoreStoreAdmin } from '../../models_store/firestore_store_admin';
import { fDate, fDateTime } from '../../utils/format_time';

const columnHelper = createColumnHelper<AnalModel>();

const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
    cell: (info) => <Box className=''>{info.getValue()}</Box>,
    size: 1000
  }),

  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => info.getValue(),
    size: 140
  }),
  columnHelper.accessor('timestampCreated', {
    header: 'Created',
    cell: (info) => fDate(info.getValue()),
    size: 140
  }),
  columnHelper.accessor('timestampUpdated', {
    header: 'Updated',
    cell: (info) => fDate(info.getValue()),
    size: 140
  }),
  columnHelper.accessor('id', {
    header: 'Action',
    cell: (info) => (
      <Box className='flex items-center justify-center '>
        <TableActions anal={info.row.original} />
      </Box>
    ),
    size: 0
  })
];

export default function AnalPage() {
  const { anals } = useFirestoreStoreAdmin((state) => state);
  const router = useRouter();

  return (
    <AuthGuard>
      <Layout variant='admin'>
        <Page title='Analytic'>
          <Container className='max-w-[1600px] mt-3'>
            <div className='flex justify-between'>
              <Text className='text-2xl font-semibold leading-10 cursor-pointer'>Analytics</Text>

              <Link href={'/anals/new'}>
                <Button className='btn-app'>New Analytic</Button>
              </Link>
            </div>

            <div className='mt-14' />

            <BaseTable data={anals} columns={columns} />
          </Container>
        </Page>
      </Layout>
    </AuthGuard>
  );
}

function TableActions({ anal }: { anal: AnalModel }) {
  const router = useRouter();
  const modals = useModals();

  const handleSubLifetime = async (modalId: string, anal: AnalModel) => {
    modals.closeModal(modalId);
    try {
      await apiDeleteAnal(anal.id);
      showNotification({ title: 'Success', message: 'analytic deleted', autoClose: 6000 });
    } catch (error) {
      showNotification({ color: 'red', title: 'Error', message: 'Error deleting analytic', autoClose: 6000 });
    }
  };

  const deleteanal = () => {
    const modalId = modals.openModal({
      title: 'Are you sure you want to proceed?',
      centered: true,
      children: (
        <>
          <Text size='sm'>Yes, delete this analytic.</Text>
          <Box className='flex justify-end mt-6'>
            <Button className='mx-2 mr-4 w-min btn-secondary' fullWidth onClick={() => modals.closeModal(modalId)} mt='md'>
              No don't do it
            </Button>

            <Button className=' w-min btn-delete mx' fullWidth onClick={() => handleSubLifetime(modalId, anal)} mt='md'>
              Delete
            </Button>
          </Box>
        </>
      )
    });
  };

  return (
    <>
      <Link href={`/anals/${anal.id}`}>
        <Iconify className='bg-slate-100 dark:bg-slate-700 rounded-full p-2 w-[30px] h-[30px]' icon={'akar-icons:edit'} />
      </Link>

      <Box className='flex' onClick={deleteanal}>
        <Iconify
          className='bg-red-200 rounded-full p-2 w-[30px] h-[30px] ml-2 text-red-500 cursor-pointer'
          icon={'fluent:delete-12-filled'}
          width={20}
          height={20}
        />
      </Box>
    </>
  );
}

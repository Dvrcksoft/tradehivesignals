import { Box, Button, Grid, Text, Textarea, TextInput } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useForm, yupResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Send } from 'tabler-icons-react';
import * as Yup from 'yup';
import { PinModel } from '../../models/model.pin';

import { getFirebaseStorageDownloadUrl } from '../../models_services/firebase_image_service';
import { apiCreatePin, apiGetPin, apiUpdatePin } from '../../models_services/firestore_annoucements_service';
import { FormError } from './_FormError';
import FormSkelenton from './_FormSkelenton';

interface IProps {
  id?: string;
  pin?: PinModel | null;
}

export default function AnnoucementForm({ id }: { id?: string }) {
  const [isInitLoading, setIsInitLoading] = useState(id != null ? true : false);
  const [pin, setPin] = useState<PinModel | null>(null);

  async function getInitData() {
    if (id) setPin(await apiGetPin(id));
    setIsInitLoading(false);
  }

  useEffect(() => {
    getInitData();
  }, []);

  if (isInitLoading) return <FormSkelenton />;
  if (!pin && id) return <FormError />;

  return <Form id={id} pin={pin} />;
}

function Form({ id, pin }: IProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<CustomFile | null>(null);

  const handleDropFiles = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setFile(Object.assign(file, { preview: URL.createObjectURL(file) }));
    }
  };

  const schema = Yup.object({
    title: Yup.string().required('Required'),
    body: Yup.string().required('Required'),
    link: Yup.string().url('Invalid URL'),
    image: Yup.string()
  });

  const form = useForm({
    validate: yupResolver(schema),
    initialValues: {
      title: pin?.title ?? '',
      body: pin?.body ?? '',
      link: pin?.link ?? '',
      image: pin?.image ?? ''
    }
  });

  const handleSubmit = async () => {
    if (form.validate().hasErrors) return;

    try {
      setIsLoading(true);
      const s = new PinModel();
      s.title = form.values.title;
      s.body = form.values.body;
      s.link = form.values.link;
      s.timestampCreated = pin?.timestampCreated ?? new Date();
      s.image = pin?.image ?? '';
      if (file) s.image = await getFirebaseStorageDownloadUrl({ file: file! });

      if (!pin) await apiCreatePin(s);
      if (pin && id) await apiUpdatePin(id, s);

      setIsLoading(false);

      router.push('/pins');

      showNotification({ title: 'Success', message: 'Pin was created', autoClose: 6000 });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      showNotification({ color: 'red', title: 'Error', message: 'There was an error creating the Pin', autoClose: 6000 });
    }
  };

  const DropzoneRemoveImage = () => {
    const removeFile = () => {
      form.setFieldValue('image', '');
      setFile(null);
    };
    if (file || form.values.image) {
      return (
        <Button className='absolute z-40 btn right-2 top-2' onClick={removeFile}>
          Remove
        </Button>
      );
    }
    return null;
  };

  const DropzoneChildren = () => {
    if (form.values.image != '') {
      return (
        <Box className='relative flex justify-center'>
          <img className='h-[300px]' src={form.values.image} alt='Preview' />
        </Box>
      );
    }
    if (file)
      return (
        <Box className='relative flex justify-center'>
          <img className='h-[300px]' src={file.preview} alt='Preview' />
        </Box>
      );
    return (
      <Box className='min-h-[300px] pointer-events-none flex justify-center items-center text-center'>
        <div>
          <Text size='xl' inline>
            Drag images here or click to select files
          </Text>
          <Text size='sm' color='dimmed' inline mt={7}>
            Attach as many files as you like, each file should not exceed 5mb
          </Text>
        </div>
      </Box>
    );
  };

  return (
    <Box className=''>
      <Grid align={'start'}>
        <Grid.Col md={12} xs={12}>
          <TextInput className='mt-4' placeholder='Title' label='Title' {...form.getInputProps('title')} />
          <Textarea minRows={3} className='mt-4' placeholder='Body' label='Body' {...form.getInputProps('body')} />
          <TextInput className='mt-4' placeholder='Link' label='Link' {...form.getInputProps('link')} />
          <Box className='relative'>
            <DropzoneRemoveImage />
            <Dropzone
              className='z-0 p-2 mt-8'
              multiple={false}
              disabled={file != null || form.values.image != ''}
              onDrop={handleDropFiles}
              onReject={(files) => console.log('rejected files', files)}
              maxSize={3 * 1024 ** 2}
              accept={IMAGE_MIME_TYPE}>
              <DropzoneChildren />
            </Dropzone>
          </Box>
        </Grid.Col>

        <Grid.Col md={12} xs={12}>
          <Box>
            <Button
              loading={isLoading}
              onClick={handleSubmit}
              leftIcon={<Send size={14} />}
              variant='filled'
              className='w-full mt-10 text-black transition border-0 bg-app-yellow hover:bg-opacity-90'>
              Submit
            </Button>
          </Box>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

export interface CustomFile extends File {
  path?: string;
  preview?: string;
}
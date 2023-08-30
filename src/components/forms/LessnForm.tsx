import { Box, Button, Container, NativeSelect, Text, Textarea, TextInput } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useForm, yupResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import * as Yup from 'yup';
import { LessnModel } from '../../models/model.lessn';

import { getFirebaseStorageDownloadUrl } from '../../models_services/firebase_image_service';
import { apiCreateLessn, apiGetLessn, apiUpdateLessn } from '../../models_services/firestore_lessn_service';
import { useFirestoreStoreAdmin } from '../../models_store/firestore_store_admin';

import { RichTextEditor } from '../rte/RichTextEditor';
import { FormError } from './_FormError';
import FormSkelenton from './_FormSkelenton';

interface IProps {
  id?: string;
  lessn: LessnModel | null;
}

export default function LessnForm({ id }: { id?: string }) {
  const [isInitLoading, setIsInitLoading] = useState(id != null ? true : false);
  const [lessn, setTag] = useState<LessnModel | null>(null);

  async function getInitData() {
    if (id) setTag(await apiGetLessn(id));
    setIsInitLoading(false);
  }

  useEffect(() => {
    getInitData();
  }, []);

  if (isInitLoading) return <FormSkelenton />;
  if (!lessn && id) return <FormError />;

  return <Form id={id} lessn={lessn} />;
}

function Form({ id, lessn }: IProps) {
  const schema = Yup.object({
    title: Yup.string().required('Required'),
    body: Yup.string(),
    status: Yup.string().required('Required'),
    slug: Yup.string().required('Required'),
    image: Yup.string(),
    lessnDate: Yup.date().required('Required'),
    isFree: Yup.string().required('Required')
  });

  const form = useForm({
    validate: yupResolver(schema),

    initialValues: {
      title: lessn?.title || '',
      body: lessn?.body || '',
      status: lessn?.status || 'Draft',
      slug: lessn?.slug || '',
      image: lessn?.image || '',
      lessnDate: lessn?.lessnDate || new Date(),
      isFree: lessn?.isFree == false ? 'No' : 'Yes'
    }
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<CustomFile | null>(null);
  const [value, setValue] = useState('');
  const { isHandleLessnSubmitCalled } = useFirestoreStoreAdmin((state) => state);
  const { setIsHandleLessnSubmitCalled } = useFirestoreStoreAdmin((state) => state);

  function generateSlugUrlSafe() {
    // const slug = form.values.title.toLowerCase().replace(/ /g, '-');

    const slug = form.values.title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    form.setValues({ ...form.values, slug: slug.replace(/-+$/, '') });
  }

  useEffect(() => {
    if (isHandleLessnSubmitCalled) {
      handleSubmit();
    }
  }, [isHandleLessnSubmitCalled]);

  const handleSubmit = async () => {
    console.log(form.values);
    console.log(form.errors);
    if (form.validate().hasErrors) {
      setIsHandleLessnSubmitCalled(false);
      return;
    }

    try {
      setIsLoading(true);
      const x = new LessnModel();
      x.title = form.values.title;
      x.slug = form.values.slug.replace(/-+$/, '');
      x.body = form.values.body;
      x.status = form.values.status;
      x.lessnDate = form.values.lessnDate;
      x.image = form.values.image;
      x.status = form.values.status;
      x.isFree = form.values.isFree == 'Yes' ? true : false;

      if (file) {
        x.image = await getFirebaseStorageDownloadUrl({ file: file! });
        form.values.image = x.image;
      }

      if (!lessn) await apiCreateLessn(x);
      if (lessn && id) await apiUpdateLessn(id, x);

      setFile(null);
      setIsHandleLessnSubmitCalled(false);

      if (!id) form.reset();
      if (!id) router.push('/lessns');

      showNotification({ color: 'blue', title: 'Success', message: 'Lesson created', autoClose: 6000 });
    } catch (error: any) {
      setIsHandleLessnSubmitCalled(false);
      showNotification({
        color: 'red',
        title: 'Error',
        message: error.message,
        autoClose: 6000
      });
    }
  };

  const handleDropFiles = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setFile(Object.assign(file, { preview: URL.createObjectURL(file) }));
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
          <Text inline>Drag image here or click to select files</Text>
          <Text size='sm' color='dimmed' inline mt={7}>
            Attach a single image
          </Text>
        </div>
      </Box>
    );
  };

  return (
    <Container className='max-w-[1600px]' p={0}>
      <Box className='relative '>
        <DropzoneRemoveImage />
        <Dropzone
          className='z-0 p-2 mt-8'
          multiple={false}
          disabled={file != null || form.values.image != ''}
          onDrop={handleDropFiles}
          onReject={(files) => console.log('rejected files', files)}
          maxSize={5 * 1024 * 1024}
          accept={IMAGE_MIME_TYPE}
        >
          <DropzoneChildren />
        </Dropzone>
      </Box>

      <div className='mt-4 '>
        <div className='grid grid-cols-1 md:grid-cols-3 md:gap-x-4 '>
          <NativeSelect className='' placeholder='Free?' label='Free?' data={['Yes', 'No']} {...form.getInputProps('isFree')} />

          <NativeSelect
            className=''
            placeholder='Status'
            label='Strategy status'
            data={['Draft', 'Published', 'Archived']}
            {...form.getInputProps('status')}
          />

          <DatePicker className='col-span-1' label='Publish date' maxDate={new Date()} {...form.getInputProps('lessnDate')} />
        </div>

        <div className='flex items-center'>
          <TextInput className='w-full' placeholder='Slug' label='Slug' radius={0} {...form.getInputProps('slug')} />
          <Button onClick={generateSlugUrlSafe} className='btn-app mt-2 ml-10 h-[38px]'>
            Generate slug
          </Button>
        </div>

        <Textarea placeholder='Title' label='Title' radius={0} rows={2} {...form.getInputProps('title')} />
        <RichTextEditor value={form.values.body} onChange={(v: any) => form.setValues({ ...form.values, body: v })} className='' id='rte' />

        <div className='pb-20' />
      </div>
    </Container>
  );
}

export interface CustomFile extends File {
  path?: string;
  preview?: string;
}

import { AddProjectProps, AddPortoflioState, createPortoflioData } from '@/types';
import Image from 'next/image';
import { ChangeEvent, FormEvent, memo, useEffect, useState } from 'react';

const AddProject = ({ onSubmit, editData, cancelEdit }: AddProjectProps) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<AddPortoflioState>({
    title: '',
    description: '',
    link: '',
  });

  const editMode = !!editData;

  useEffect(() => {
    if (editData && editMode === true) {
      const { title, description, link } = editData;
      setFormData({ title, description, link });
      setPreviewUrls(editData.images.map((image) => `/images/${image}`));
    }
  }, [editData]);

  const onFilesUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;

    if (!fileInput.files) {
      alert('No files were chosen');
      return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
      alert('Files list is empty');
      return;
    }

    const validFiles: File[] = [];

    for (let i = 0; i < fileInput.files.length; i++) {
      const file = fileInput.files[i];

      if (!file.type.startsWith('image')) {
        alert(`File with idx: ${i} is invalid`);
        continue;
      }

      validFiles.push(file);
      setFiles((files) => [...files, file]);
    }

    if (!validFiles.length) {
      alert('No valid files were chosen');
      return;
    }

    setPreviewUrls((previewUrls) => [...previewUrls, ...validFiles.map((file) => URL.createObjectURL(file))]);
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const urlRegex = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    );

    if (process.env.NODE_ENV !== 'test' && !urlRegex.test(formData.link)) {
      alert('Invalid url');
      return;
    }
    if (process.env.NODE_ENV !== 'test' && files.length === 0 && !editMode) {
      alert('No files were chosen');
      return;
    }

    let data: createPortoflioData = {
      ...formData,
      files: files,
    };

    if (editMode) {
      data = {
        ...data,
        oldFiles: previewUrls.length ? previewUrls : [],
      };
    }

    console.log(files);
    console.log(previewUrls);
    onSubmit(data, editMode);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((formData) => ({ ...formData, [name]: value }));
  };

  return (
    <section className="p-6 text-black bg-slate-200 rounded-md">
      {editMode}
      <form data-testid="add-form" className="container flex flex-col mx-auto space-y-4 ng-untouched ng-pristine ng-valid" onSubmit={handleUpload}>
        <fieldset>
          <div className="grid grid-cols-6 gap-4 col-span-full lg:col-span-4">
            <div className="col-span-full sm:col-span-3 text-left space-y-2">
              <label aria-labelledby="Title" htmlFor="Title" className="text-lg">
                Title
                <input data-testid="title-input" required onChange={handleChange} value={formData.title} name="title" type="text" placeholder="Title" className="input-class" />
              </label>
            </div>
            <div className="col-span-full sm:col-span-3 text-left space-y-2">
              <label htmlFor="Link" className="text-lg">
                Link
                <input data-testid="link-input" required onChange={handleChange} value={formData.link} type="text" name="link" placeholder="https://" className="input-class" />
              </label>
            </div>
            <div className="col-span-full text-left space-y-2">
              <label htmlFor="Description" className="text-lg">
                Description
                <textarea data-testid="description-input" required onChange={handleChange} value={formData.description} name="description" className="input-class" />
              </label>
            </div>
            <div className="col-span-full">
              <div className="flex flex-col justify-center items-center">
                <label className="flex flex-col items-center justify-center h-full py-1 transition-colors duration-150 cursor-pointer hover:opacity-90">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <strong className="text-sm font-medium">Select images</strong>
                  <input className="block w-0 h-0" name="file" type="file" onChange={onFilesUploadChange} multiple />
                </label>
                {previewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewUrls.map((previewUrl, idx) => (
                      <div key={idx} className="relative h-24 w-24">
                        <Image loading="lazy" height={96} width={96} src={previewUrl} alt="preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          className="absolute top-0 right-0 py-1 px-2 bg-slate-500 rounded-md text-white"
                          onClick={() => {
                            setPreviewUrls((previewUrls) => previewUrls.filter((_, i) => i !== idx));
                            setFiles((files) => files.filter((_, i) => i !== idx));
                          }}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </fieldset>
        <div className="space-x-2">
          <button data-testid="submit-btn" type="submit" className="m-auto text-lg bg-green-500 btn">
            {editMode ? 'update' : 'add'}
          </button>
          {editMode && (
            <button onClick={() => cancelEdit && cancelEdit(editData.id)} type="button" className="m-auto text-lg bg-slate-600 btn">
              cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
};

export default memo(AddProject);

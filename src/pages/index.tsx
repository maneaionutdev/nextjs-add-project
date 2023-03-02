import Zoom from 'react-medium-image-zoom';
import Carousel from 'better-react-carousel';
import { Roboto_Mono } from 'next/font/google';
import { useEffect, useState, useMemo, ChangeEvent } from 'react';
import Link from 'next/link';
import type { AxiosError } from 'axios';

import { api } from '@/utils';
import type { AxiosResponseData, createPortoflioData, Error, PortofolioInterface } from '@/types';
import AddProject from '@/components/AddProject';

const feacher = (url: string) => api.get(url).then((res) => res.data);
const font = Roboto_Mono({ subsets: ['latin'] });

const Home = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [publishedProjects, setProjects] = useState<PortofolioInterface[]>([]);
  const [allProjects, setAllProjects] = useState<PortofolioInterface[]>([]);

  useEffect(() => {
    async function getProjects() {
      const res = await api.get('/getProjects', { params: { getAll: false } });
      setProjects(res.data.data.map((d: PortofolioInterface) => ({ ...d, edit: false })));
    }
    getProjects();
  }, []);

  const projects = useMemo(() => {
    if (showAllProjects) {
      return allProjects;
    }
    return publishedProjects;
  }, [showAllProjects, publishedProjects, allProjects]);

  const addProject = async (data: createPortoflioData, editMode: boolean) => {
    const formData = new FormData();
    for (const file of data.files) {
      formData.append('file', file);
    }
    for (const key in data) {
      if (key === 'files' || key === 'oldFiles') continue;
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }
    formData.append('oldFiles', JSON.stringify(data.oldFiles));

    if (editMode) {
      try {
        const id = publishedProjects.find((p) => p?.edit === true)?.id;
        const res = await api.patch<AxiosResponseData>('/editProject', formData, { params: { id } });
        const newPorotoflis = publishedProjects.map((portofolio) => {
          if (portofolio.id === res.data.data.id) {
            return {
              ...res.data.data,
              edit: false,
            };
          }
          return portofolio;
        });
        setProjects(newPorotoflis);
      } catch (error: unknown) {
        const err = error as AxiosError<Error>;
        alert(err.response?.data.message);
      }
    } else {
      try {
        const { data } = await api.post<AxiosResponseData>('/addProject', formData);
        setProjects((publishedProjects) => [...publishedProjects, { ...data.data, edit: false }]);
        setShowAdd(false);
      } catch (error: unknown) {
        const err = error as AxiosError<Error>;
        alert(err.response?.data.message);
      }
    }
  };

  function editProject(id: number) {
    const newData = publishedProjects.map((portofolio) => {
      if (portofolio.id === id) {
        return {
          ...portofolio,
          edit: true,
        };
      }
      return portofolio;
    });
    setProjects(newData);
  }

  async function deleteProject(id: number) {
    try {
      const res = await api.delete<AxiosResponseData>('/deleteProject', { params: { id } });
      const newData = publishedProjects.filter((portofolio) => portofolio.id !== res.data.data.id);
      setProjects(newData);
    } catch (error) {
      console.log(error);
      alert(error);
    }
  }

  function cancelEdit(id: number) {
    const newData = publishedProjects.map((portofolio) => {
      if (portofolio.id === id) {
        return {
          ...portofolio,
          edit: false,
        };
      }
      return portofolio;
    });
    setProjects(newData);
  }

  async function handleShowAllProjects() {
    try {
      const res = await api.get('/getProjects', { params: { getAll: !showAllProjects } });
      setAllProjects([]);
      setAllProjects(res.data.data.map((d: PortofolioInterface) => ({ ...d, edit: false })));
      setShowAllProjects((showAllProjects) => !showAllProjects);
    } catch (error) {
      alert(error);
    }
  }

  async function handlePublish(e: ChangeEvent<HTMLInputElement>, id: number) {
    try {
      const res = await api.patch<AxiosResponseData>('/publishProject', { id });
      const newAllProjects = allProjects.map((project) => {
        if (project.id === res.data.data.id) {
          return {
            ...res.data.data,
            edit: false,
          };
        }
        return project;
      });
      setAllProjects(newAllProjects);

      if (res.data.data.isPublished) {
        setProjects((oldProjects) => [...oldProjects, { ...res.data.data, edit: false }]);
      } else {
        setProjects((oldProjects) => oldProjects.filter((project) => project.id !== res.data.data.id));
      }
    } catch (error) {
      alert(error);
    }
  }

  return (
    <main className={font.className}>
      <h1 className="text-center pt-20 text-3xl">Projects </h1>
      <div className="flex justify-center items-center space-x-2 mt-10">
        <button className={`btn ${showAdd ? 'bg-slate-600' : 'bg-green-500'} ${showAllProjects && 'hidden'}`} onClick={() => setShowAdd((showAdd) => !showAdd)}>
          {!showAdd ? 'Add Project' : 'Hide'}
        </button>
        <button className="btn bg-blue-400" onClick={handleShowAllProjects}>
          {showAllProjects ? 'Published Projects' : 'All Projects'}
        </button>
      </div>
      <div className="max-w-7xl m-auto my-20 p-8 md:p-5 lg:p-10">
        <div className="grid grid-cols-3 gap-4 text-center">
          {showAdd && (
            <div className="col-span-full">
              <AddProject onSubmit={addProject} />
            </div>
          )}
          {projects.length ? (
            projects.map((item) => (
              <div key={item.id} className="col-span-full h-full w-full lg:col-span-1">
                {item.edit ? (
                  <AddProject cancelEdit={cancelEdit} editData={item} onSubmit={addProject} />
                ) : (
                  <>
                    <div className="relative pt-4 h-full w-full shadow-sm bg-slate-100 pb-4 rounded-md flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center px-4 space-x-2">
                          <h1 className="text-center text-3xl truncate">{item.title}</h1>
                          {showAllProjects === false ? (
                            <>
                              <div className="flex items-center space-x-2">
                                <button className="bg-blue-400 py-1 px-1.5 rounded-md text-white hover:opacity-95" onClick={() => editProject(item.id)}>
                                  edit
                                </button>
                                <button className="bg-red-400 py-1 px-2.5 rounded-md text-white hover:opacity-95" onClick={() => deleteProject(item.id)}>
                                  x
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center mb-4">
                                <input
                                  id="checkbox-1"
                                  aria-describedby="checkbox-1"
                                  type="checkbox"
                                  className="bg-gray-50 border-gray-300 focus:ring-3 focus:ring-blue-300 h-4 w-4 rounded"
                                  checked={item.isPublished}
                                  onChange={(e) => handlePublish(e, item.id)}
                                />
                              </div>
                            </>
                          )}
                        </div>
                        <p className="px-6 mt-10 mb-8 break-words text-left">{item.description}</p>
                        <Carousel cols={1} rows={1} mobileBreakpoint={0}>
                          {item.images.map((image, index) => (
                            <Carousel.Item key={index} className="h-full w-full">
                              <Zoom>
                                <img loading="lazy" src={`/images/${image}`} alt={item.title} className="w-full h-full max-h-52 object-contain rounded-lg" />
                              </Zoom>
                            </Carousel.Item>
                          ))}
                        </Carousel>
                      </div>

                      <div>
                        <Link href={item.link} className="text-blue-500 mt-4" target="_blank">
                          Visit
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-3xl col-span-full">No Projects</div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;

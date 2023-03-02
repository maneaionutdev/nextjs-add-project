import { Dispatch, SetStateAction } from 'react';

export interface Error {
  message: string;
}

export interface AddProjectProps {
  onSubmit: (data: createPortoflioData, update: boolean) => Promise<void>;
  editData?: PortofolioInterface;
  cancelEdit?: (id: number) => void;
}

export interface AddPortoflioState {
  title: string;
  description: string;
  link: string;
}

export interface createPortoflioData extends AddPortoflioState {
  files: File[];
  oldFiles?: string[];
  [key: string]: any;
}

export interface PortofolioInterface extends AddPortoflioState {
  id: number;
  images: string[];
  edit: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AxiosResponseData {
  data: PortofolioInterface;
}

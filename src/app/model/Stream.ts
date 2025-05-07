import { User } from './User';

export type Stream = {
  id?: number;
  owner: User;
  code: string;
  title: string;
  description: string;
};

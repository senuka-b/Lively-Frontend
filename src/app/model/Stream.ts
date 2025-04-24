import { User } from './User';

export type Stream = {
  id?: number;
  owner: User;
  code: string;
  title: String;
  description: string;
};

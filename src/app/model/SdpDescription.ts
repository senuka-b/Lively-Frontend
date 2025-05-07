import { CandidateDescriptionType } from './util/CandidateDescriptionType';

export type SdpDescription = {
  id?: number;
  type: string;
  sdp: string;
};

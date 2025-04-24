import { CandidateDescriptionType } from "./util/CandidateDescriptionType";

export type IceCandidate = {
    id?: number;
    candidateData: string,
    type: string,
}
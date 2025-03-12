export interface AgentUser {
  id: string;
  name: string;
  lastname:string;
  email: string;
  phonenumber: string;
  country: string;
  city: string;
  createdAt: string;
  isDisabled: boolean;
  agentId: string;
  agentEmail?: string;
  deletedAt?: string;
}

export interface RawAgentUserData {
  [key: string]: {
    name: string;
    lastname:string;
    email: string;
    phonenumber: string;
    country: string;
  city: string;
    createdAt: string;
    isDisabled: boolean;
    agentId: string;
    agentEmail?: string;
    deletedAt?: string;
  };
}


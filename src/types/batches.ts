export interface Period {
  id: string;
  label: string;
  isActive: boolean;
  registrationOpen: boolean;
  _count: {
    memberships: number;
    resources: number;
  };
}

export interface Resource {
  id: string;
  periodId: string;
  title: string;
  description: string;
  url: string | null;
  position: number;
  region: {
    id: string;
    name: string;
    shortName: string | null;
  } | null;
}

export interface ResourcePayload {
  title: string;
  description: string;
  url: string | null;
  regionId: string | null;
}

export interface ApiDataResponse<T> {
  msg: string;
  data: T;
}

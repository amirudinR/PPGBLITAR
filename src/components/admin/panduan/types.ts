export interface RoleNode {
  role: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  features: string[];
  children?: RoleNode[];
}

export interface SetupStep {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  detail: string;
  actor: string;
}

export interface FlowStep {
  actor: string;
  action: string;
  icon: React.ElementType;
  color: string;
}

export interface OperationalFlow {
  id: string;
  label: string;
  icon: React.ElementType;
  steps: FlowStep[];
}

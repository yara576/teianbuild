export interface ProposalInput {
  projectTitle: string
  clientName: string
  projectDescription: string
  techStack: string[]
  duration: string
  budget: string
  yourName: string
  yourRole: string
  hourlyRate: number
}

export interface EstimateItem {
  item: string
  quantity: number
  unit: string
  unitPrice: number
  amount: number
}

export interface ProposalOutput {
  summary: string
  scope: string
  deliverables: string[]
  timeline: { phase: string; duration: string; tasks: string[] }[]
  estimateItems: EstimateItem[]
  totalAmount: number
  notes: string
}

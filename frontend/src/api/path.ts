import request from './request'
import { asArray } from './normalize'

export interface PathStep {
  step: number
  knowledge_point: string
  resource_type: string
  resource_id: string | null
  estimated_time: number
  prerequisite: string | null
  status: string
  record_id: string | null
  weight: string
}

export interface LearningPathInfo {
  id: string
  user_id: string
  job_id: string
  assessment_id: string | null
  steps: PathStep[]
  current_step: number
  status: string
  created_at: string
  updated_at: string
}

/** 查询用户的学习路径 */
export async function getLearningPaths(userId: string, assessmentId?: string): Promise<LearningPathInfo[]> {
  const response: unknown = await request.get(`/path/${userId}`, { params: assessmentId ? { assessment_id: assessmentId } : undefined })
  return asArray<LearningPathInfo>(response).map(path => ({
    ...path,
    steps: asArray<PathStep>(path?.steps),
  }))
}

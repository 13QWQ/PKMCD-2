import request from './request'
import { asArray, asStringArray } from './normalize'

export interface JobInfo {
  id: string
  job_title: string
  description: string
  required_skills: string[]
}

/** 职业列表 */
export async function getJobList(): Promise<JobInfo[]> {
  const response: unknown = await request.get('/jobs/list')
  return asArray<Record<string, unknown>>(response)
    .filter(item => typeof item.id === 'string' && typeof item.job_title === 'string')
    .map(item => ({
      id: item.id as string,
      job_title: item.job_title as string,
      description: typeof item.description === 'string' ? item.description : '',
      required_skills: asStringArray(item.required_skills),
    }))
}

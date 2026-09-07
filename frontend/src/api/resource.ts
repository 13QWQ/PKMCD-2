import request from './request'
import { asArray } from './normalize'

export interface ResourceInfo {
  id: string
  assessment_id: string | null
  knowledge_point: string
  content_type: string
  title: string
  body: string
  difficulty: number | null
  source_chunk_id: string | null
  // Raw knowledge chunks stay server-side in production responses. Demo
  // fixtures may include this field for the local preview.
  source_text?: string | null
  review_status: string | null
  review_reason: string | null
  display_status: string
  generation_method: string | null
  created_at: string
}

export interface ResourceBookmarkInfo {
  resource_id: string
  created_at: string
}

/** 获取资源列表（支持按知识点和类型过滤） */
export async function getResourceList(params?: {
  knowledge_point?: string
  type?: string
  assessment_id?: string
}): Promise<ResourceInfo[]> {
  const response: unknown = await request.get('/resource/list', { params })
  return asArray<ResourceInfo>(response)
}

/** 获取资源详情 */
export function getResource(id: string): Promise<ResourceInfo> {
  return request.get(`/resource/${id}`) as any
}

export async function getResourceBookmarks(): Promise<ResourceBookmarkInfo[]> {
  const response: unknown = await request.get('/resource/bookmarks')
  return asArray<ResourceBookmarkInfo>(response)
}

export function bookmarkResource(id: string): Promise<ResourceBookmarkInfo> {
  return request.post(`/resource/${id}/bookmark`) as any
}

export function unbookmarkResource(id: string): Promise<{ message: string }> {
  return request.delete(`/resource/${id}/bookmark`) as any
}

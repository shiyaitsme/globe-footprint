export interface VisitComment {
  id: string;
  text: string;
  photos: string[];
  /** 这条回顾评论本身是什么时候写的，不是被回顾的那次到访的日期 */
  createdAt: number;
}

export interface Visit {
  id: string;
  /** 到访日期 YYYY-MM-DD，用户可编辑，用于 timeline 按年/日分组 */
  date: string;
  notes: string;
  photos: string[];
  createdAt: number;
  comments: VisitComment[];
}

export interface Place {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  visits: Visit[];
}

/** @deprecated 旧数据结构，仅 usePlaces.ts 的迁移逻辑还在用 */
export interface Footprint {
  id: string;
  name: string;
  country: string;
  notes: string;
  lat: number;
  lng: number;
  photos: string[];
  createdAt: number;
}

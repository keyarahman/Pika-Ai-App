import { API_BASE_URL } from '@/constants/api';

type RawWinterTemplate = {
  template_id: number;
  display_name?: string;
  display_prompt?: string;
  app_thumbnail_url?: string;
  app_thumbnail_video_url?: string;
  app_thumbnail_gif_url?: string;
  web_thumbnail_url?: string;
  web_thumbnail_video_url?: string;
  web_thumbnail_gif_url?: string;
};

type RawWinterResponse = {
  ErrCode?: number;
  ErrMsg?: string;
  Resp?: {
    data?: RawWinterTemplate[];
    total?: number;
  };
};

export type WinterTemplate = RawWinterTemplate;

const WINTER_PRIMARY_CATEGORY = 3;
const WINTER_SECONDARY_CATEGORY = 159;

export async function fetchWinterVibeTemplates(
  page: number = 1,
  pageSize: number = 20
): Promise<{ templates: WinterTemplate[]; total: number; hasMore: boolean }> {
  const offset = (page - 1) * pageSize;

  const params = new URLSearchParams({
    primary_category: String(WINTER_PRIMARY_CATEGORY),
    platform: 'web',
    secondary_category: String(WINTER_SECONDARY_CATEGORY),
    limit: String(pageSize),
    offset: String(offset),
    current: String(page),
    pageSize: String(pageSize),
  });

  const response = await fetch(
    `${API_BASE_URL}/creative_platform/content/template/list?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Failed to fetch Winter Vibe templates');
  }

  const json = (await response.json().catch(() => ({}))) as RawWinterResponse;

  if (json.ErrCode !== 0) {
    throw new Error(json.ErrMsg || 'Failed to fetch Winter Vibe templates');
  }

  const data = json.Resp?.data ?? [];
  const total = json.Resp?.total ?? data.length;
  const hasMore = page * pageSize < total;

  return {
    templates: data,
    total,
    hasMore,
  };
}



import { API_BASE_URL, API_KEY, VIDEO_POLL_INTERVAL } from '@/constants/api';

export type VideoGenerationParams = {
  img_id: number;
  prompt: string;
  template_id?: number;
  duration?: number;
  model?: string;
  motion_mode?: string;
  quality?: string;
  seed?: number;
};

export type VideoGenerationResult = {
  video_id: number;
  task_id?: string;
  video_url?: string;
};

const generateTraceId = () => {
  const nativeCrypto = typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : undefined;
  if (nativeCrypto && typeof nativeCrypto.randomUUID === 'function') {
    return nativeCrypto.randomUUID();
  }
  return `trace-${Math.random().toString(36).slice(2)}-${Date.now()}`;
};

/**
 * Generate video from image
 * @param params - Video generation parameters
 * @returns VideoGenerationResult with video_id
 * @throws Error if generation fails
 */
export const generateVideoFromImage = async (
  params: VideoGenerationParams
): Promise<VideoGenerationResult> => {
  if (!API_KEY) {
    throw new Error('Missing API key. Please configure your API key.');
  }

  const traceId = generateTraceId();
  const payload = {
    duration: params.duration ?? 5,
    img_id: params.img_id,
    model: params.model ?? 'v4.5',
    motion_mode: params.motion_mode ?? 'normal',
    negative_prompt: '',
    prompt: params.prompt,
    quality: params.quality ?? '540p',
    // template_id: params.template_id,
    seed: params.seed ?? 0,
    sound_effect_switch: true,
  };
console.log('payload', [payload]);
  const response = await fetch(`${API_BASE_URL}/openapi/v2/video/img/generate`, {
    method: 'POST',
    headers: {
      'API-KEY': API_KEY,
      'Ai-trace-id': traceId,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Video generation failed';
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson?.ErrMsg) {
        errorMessage = errorJson.ErrMsg;
      } else if (errorJson?.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      if (errorText && errorText.length < 200) {
        errorMessage = errorText;
      }
    }
    throw new Error(errorMessage);
  }

  const json = await response.json().catch(() => null);
  const errCode = json?.ErrCode ?? null;
  if (errCode !== 0) {
    const errMsg = json?.ErrMsg ?? 'Video generation failed';
    throw new Error(errMsg);
  }

  const resp = json?.Resp ?? {};
  console.log('resp', resp);
  const taskId = typeof resp?.task_id === 'string' ? resp.task_id : undefined;
  const videoUrl = typeof resp?.video_url === 'string' ? resp.video_url : undefined;
  const videoId =
    typeof resp?.video_id === 'number' ? resp.video_id : undefined;

  

  return {
    video_id: videoId,
    task_id: taskId,
    video_url: videoUrl,
  };
};

export type VideoResult = {
  id?: number;
  url?: string;
  video_url?: string;
  cover_url?: string;
  status?: number | string;
  create_time?: string;
  modify_time?: string;
  prompt?: string;
  negative_prompt?: string;
  outputHeight?: number;
  outputWidth?: number;
  size?: number;
};

/**
 * Poll video result until it's ready
 * @param videoId - Video ID to poll
 * @param onUpdate - Callback when status updates
 * @param onComplete - Callback when video is ready
 * @returns Function to stop polling
 */
export const pollVideoResult = (
  videoId: number,
  onUpdate: (result: VideoResult) => void,
  onComplete: (result: VideoResult) => void
): (() => void) => {
  let pollingInterval: ReturnType<typeof setInterval> | null = null;
  let isStopped = false;

  const poll = async () => {
    if (isStopped) return;

    try {
      const response = await fetch(`${API_BASE_URL}/openapi/v2/video/result/${videoId}`, {
        headers: {
          'API-KEY': API_KEY,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch video status');
      }

      const json = await response.json().catch(() => null);
      const errCode = json?.ErrCode ?? null;
      if (errCode !== 0) {
        const errMsg = json?.ErrMsg ?? 'Video status retrieval failed';
        throw new Error(errMsg);
      }

      const resp: VideoResult = json?.Resp ?? {};
      const status = resp?.status;

      onUpdate(resp);

      if ( resp?.url) {
        // Video is ready
        isStopped = true;
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
        onComplete(resp);
      } else if (status === 3 || status === 'failed' || status === 4) {
        // Video generation failed
        isStopped = true;
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
        throw new Error(json?.ErrMsg || 'Video generation failed.');
      }
    } catch (error) {
      if (!isStopped) {
        console.error('Video polling error', error);
        // Continue polling on error (might be temporary)
      }
    }
  };

  // Start polling
  poll(); // Poll immediately
  pollingInterval = setInterval(poll, VIDEO_POLL_INTERVAL);

  // Return stop function
  return () => {
    isStopped = true;
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
};


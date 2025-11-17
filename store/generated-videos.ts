import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

type StoredVideo = GeneratedVideo;

const STORAGE_KEY = 'generated-videos';

export type GeneratedVideo = {
  id: number;
  url?: string;
  prompt?: string;
  create_time?: string;
  modify_time?: string;
  outputHeight?: number;
  outputWidth?: number;
  size?: number;
  templateId?: number;
  thumbnail?: string;
  status?: 'processing' | 'ready' | 'failed';
};

let videos: GeneratedVideo[] = [];
const listeners = new Set<() => void>();
let hasHydrated = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return videos;
}

async function persistVideos() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  } catch (error) {
    console.warn('Failed to persist generated videos', error);
  }
}

function setVideos(next: GeneratedVideo[]) {
  videos = next;
  emit();
  void persistVideos();
}

function addVideo(video: GeneratedVideo) {
  const next = [video, ...videos.filter((item) => item.id !== video.id)];
  setVideos(next);
}

function removeVideo(id: number) {
  const next = videos.filter((item) => item.id !== id);
  setVideos(next);
}

function clearVideos() {
  setVideos([]);
}

function getVideoById(id: number) {
  return videos.find((video) => video.id === id);
}

function updateVideoStatus(id: number, status: 'processing' | 'ready' | 'failed', url?: string) {
  const video = videos.find((v) => v.id === id);
  if (video) {
    video.status = status;
    if (url) {
      video.url = url;
    }
    setVideos([...videos]);
  }
}

async function hydrateVideos() {
  if (hasHydrated) return;
  hasHydrated = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: StoredVideo[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        videos = parsed;
        emit();
      }
    }
  } catch (error) {
    console.warn('Failed to load generated videos', error);
  }
}

export function useGeneratedVideos() {
  useEffect(() => {
    void hydrateVideos();
  }, []);

  const currentVideos = useSyncExternalStore(subscribe, getSnapshot);

  return {
    videos: currentVideos,
    addVideo,
    removeVideo,
    clearVideos,
    getVideoById,
    updateVideoStatus,
  };
}

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type FeaturedItem = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  prompt?: string;
  templateId?: number;
  videUrl?: string;
};

export type CollectionItem = {
  id: string;
  title: string;
  badge?: 'New' | 'Hot';
  image: string;
  prompt?: string;
  templateId?: number;
  videUrl?: string;
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const HERO_HEIGHT = windowHeight * 0.40;
const CARD_WIDTH = windowWidth;
const CARD_SPACING = 16;

export const PRO_PLANS = [
  {
    id: 'weekly',
    label: 'Weekly',
    price: '$9.99/wk',
    // helper: 'Then $19.99/wk',
  },
  // {
  //   id: 'monthly',
  //   label: 'Monthly',
  //   price: '$14.99/mo',
  //   helper: 'Best Value',
  // },
  {
    id: 'yearly',
    label: 'Yearly',
    price: '$0.77/wk',
    helper: 'Just $39.99/yr',
    badge: 'BEST VALUE',
  },
] as const;

export const VIRAL_ITEMS: CollectionItem[] = [
  {
    id: 'figurine-me-up',
    title: 'Figurine Me Up!',
    prompt: 'Figurine Me Up!',
    templateId: 359328847686976,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fapp_3dtoy_250911.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapp_3dtoy_250911.mp4',
  },
  {
    id: '3d-figurine-factory',
    title: '3D Figurine Factory',
    prompt: '3D Figurine Factory',
    templateId: 359004842664384,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2F3dtoy_250909.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2F3dtoy_250909.mp4',
  },
  // Commented out for App Store review - kiss related content
  // {
  //   id: 'kiss-kiss-1',
  //   title: 'Kiss Kiss',
  //   prompt: 'Kiss Kiss',
  //   badge: 'Hot',
  //   templateId: 315446315336768,
  //   image:
  //     'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_kisskiss_0610.gif?x-oss-process=style/cover-webp',
  //   videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_kisskiss_0610.mp4',
  // },
  // {
  //   id: 'kiss-me-to-heaven',
  //   title: 'Kiss Me to Heaven',
  //   prompt: 'Kiss Me to Heaven',
  //   badge: 'New',
  //   templateId: 359166562889024,
  //   image:
  //     'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_wetkiss_250910.gif?x-oss-process=style/cover-webp',
  //   videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_wetkiss_250910.mp4',
  // },
  {
    id: 'ghostface-terror',
    title: 'Ghostface Terror',
    prompt: 'Ghostface Terror',
    badge: 'Hot',
    templateId: 362704938833536,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_scream_250930.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_scream_250930.mp4',
  },
  {
    id: 'silly-bird-shimmy',
    title: 'The Silly Bird Shimmy',
    prompt: 'The Silly Bird Shimmy',
    templateId: 367302749516608,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_birdman_251029.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_birdman_251029.mp4',
  },
  {
    id: 'hi-five-emoji-twin',
    title: 'Hi-Five Emoji Twin',
    prompt: 'Hi-Five Emoji Twin',
    templateId: 351907687030400,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-emoji-251107.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-emoji-251107.mp4',
  },
  {
    id: 'earth-zoom-challenge',
    title: 'Earth Zoom Challenge',
    prompt: 'Earth Zoom Challenge',
    templateId: 349110259052160,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_earthzoom_250716.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_earthzoom_250716.mp4',
  },
  {
    id: 'old-photo-revival',
    title: 'Old Photo Revival',
    prompt: 'Old Photo Revival',
    templateId: 346384996936128,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_oldd.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_oldd.mp4',
  },
  {
    id: 'the-rose-and-freedom',
    title: 'The Rose and Freedom',
    prompt: 'The Rose and Freedom',
    templateId: 368723165573888,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_theroseandfreedom_251103.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_theroseandfreedom_251103.mp4',
  },
  {
    id: 'ai-museum-portrait',
    title: 'AI Museum Portrait',
    prompt: 'AI Museum Portrait',
    templateId: 368689273684736,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_aimuseum_251103.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_aimuseum_251103.mp4',
  },
  {
    id: 'the-exclusive-first-class',
    title: 'The Exclusive First Class',
    prompt: 'The Exclusive First Class',
    templateId: 367845183423296,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_theexclusivefirstclass_251029.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_theexclusivefirstclass_251029.mp4',
  },
  {
    id: 'welcome-to-meowverse',
    title: 'Welcome to Meowverse',
    prompt: 'Welcome to Meowverse',
    templateId: 367843207881536,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2FWeb_welcometomeowverse_251029.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2FWeb_welcometomeowverse_251029.mp4',
  },
  {
    id: 'i-quit',
    title: 'I Quit',
    prompt: 'I Quit',
    templateId: 366773399804864,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_iquit_251023.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_iquit_251023.mp4',
  },
  {
    id: 'why-dont-you-call-me-godfather',
    title: "Why Don't You Call Me Godfather",
    prompt: "Why Don't You Call Me Godfather",
    templateId: 367301708446528,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_whydidn%E2%80%99tyoucallmegodfather_252026.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_whydidn%E2%80%99tyoucallmegodfather_252026.mp4',
  },
  {
    id: 'test-your-workplace-persona',
    title: 'Test Your Workplace Persona',
    prompt: 'Test Your Workplace Persona',
    templateId: 367472828659200,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_testyourworkplacepersona_251027.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_testyourworkplacepersona_251027.mp4',
  },
  // Commented out for App Store review - hug related content
  // {
  //   id: 'hug-lord-ganesha',
  //   title: 'Hug Lord Ganesha',
  //   prompt: 'Hug Lord Ganesha',
  //   templateId: 339164540606208,
  //   image:
  //     'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_india_250905.gif?x-oss-process=style/cover-webp',
  //   videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_india_250905.mp4',
  // },
  {
    id: 'alien-kidnap',
    title: 'Alien Kidnap',
    prompt: 'Alien Kidnap',
    templateId: 350321367924416,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_alien_251110.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_alien_251110.mp4',
  },
];

// Commented out for App Store review - AI Romance collection
export const AI_ROMANCE_ITEMS: CollectionItem[] = [] as CollectionItem[]; // Empty array for App Store review
/* Original AI_ROMANCE_ITEMS - commented out for App Store review
export const AI_ROMANCE_ITEMS: CollectionItem[] = [
  {
    id: 'hug-together',
    title: 'Hug Together',
    prompt: 'Hug Together',
    templateId: 340712049100608,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2F340712049100608_251107.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2F340712049100608_251107.mp4',
  },
  {
    id: 'forever-us',
    title: 'Forever Us',
    prompt: 'Forever Us',
    templateId: 326733946317888,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fwedding_250321.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fwedding_250321.mp4',
  },
  {
    id: 'kiss-me-ai',
    title: 'Kiss Me, AI!',
    prompt: 'Kiss Me, AI!',
    templateId: 321958627120000,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_ailover_250212.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_ailover_250212.mp4',
  },
  {
    id: 'kiss-kiss-romance',
    title: 'Kiss Kiss',
    prompt: 'Kiss Kiss',
    templateId: 315446315336768,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_kisskiss_0610.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_kisskiss_0610.mp4',
  },
  {
    id: 'hug-your-love',
    title: 'Hug Your Love',
    prompt: 'Hug Your Love',
    templateId: 303624424723200,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_hugyourlove2_250512.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_hugyourlove2_250512.mp4',
  },
  {
    id: 'my-boyfriends',
    title: 'My Boyfriendsssss',
    prompt: 'My Boyfriendsssss',
    templateId: 349232463042176,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_yourboys_250716.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_yourboys.mp4',
  },
  {
    id: 'my-girlfriends',
    title: 'My Girlfriendssss',
    prompt: 'My Girlfriendssss',
    templateId: 349232644550272,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_yourgirls_250716.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_yourgirlss.mp4',
  },
  {
    id: 'boom-drop',
    title: 'BOOM DROP',
    prompt: 'BOOM DROP',
    templateId: 339133943656192,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_explode_250520.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_explode.mp4',
  },
  {
    id: 'old-photo-revival-romance',
    title: 'Old Photo Revival',
    prompt: 'Old Photo Revival',
    templateId: 346384996936128,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_oldd.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_oldd.mp4',
  },
  {
    id: '2025-oscar-winner',
    title: '2025 Oscar Winner',
    prompt: '2025 Oscar Winner',
    templateId: 321956810449792,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-winner-251109.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-winner-251109.mp4',
  },
  {
    id: 'ruin-your-vow',
    title: 'Ruin Your Vow',
    prompt: 'Ruin Your Vow',
    templateId: 351687353790080,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_bride_250801.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_bride_250801.mp4',
  },
  {
    id: 'kiss-me-to-heaven-romance',
    title: 'Kiss Me to Heaven',
    prompt: 'Kiss Me to Heaven',
    templateId: 359166562889024,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_wetkiss_250910.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_wetkiss_250910.mp4',
  },
  {
    id: 'mwah-mwah',
    title: 'Mwah Mwah',
    prompt: 'Mwah Mwah',
    templateId: 352802159378368,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_kiss2_250805.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_kiss2_250805.mp4',
  },
  {
    id: 'cry-me-a-river',
    title: 'Cry Me a River',
    prompt: 'Cry Me a River',
    templateId: 337052664588608,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_tears_250508.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_tears_250508.mp4',
  },
]; */

export const AI_STYLE_ITEMS: CollectionItem[] = [
  {
    id: 'pixel-world',
    title: 'Pixel World',
    prompt: 'Pixel World',
    templateId: 337036093477184,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fapp_pixel.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapp_pixel.mp4',
  },
  {
    id: 'born-to-barbie',
    title: 'Born to Barbie',
    prompt: 'Born to Barbie',
    templateId: 335261821526784,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-babii-251109.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-babii-251109.mp4',
  },
  {
    id: 'anime-magic',
    title: 'Anime Magic',
    prompt: 'Anime Magic',
    templateId: 330688573362560,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-anime-251107.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-anime-251107.mp4',
  },
  {
    id: 'clay-fool',
    title: 'Clay Fool',
    prompt: 'Clay Fool',
    templateId: 334237192507776,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_clay_250423.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_clay_250423.mp4',
  },
  {
    id: 'mint-in-box',
    title: 'Mint in Box',
    prompt: 'Mint in Box',
    templateId: 333134794738752,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_toyfigure_250421.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_toyfigure_250421.mp4',
  },
  {
    id: 'retro-anime-pop',
    title: 'Retro Anime Pop',
    prompt: 'Retro Anime Pop',
    templateId: 332758365690624,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_anime_250415.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_anime_250415.mp4',
  },
  {
    id: 'anime-story',
    title: 'Anime Story',
    prompt: 'Anime Story',
    templateId: 330523675191680,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_ghibli_250402.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_ghibli_250402.mp4',
  },
  {
    id: 'sakura-flood',
    title: 'Sakura Flood',
    prompt: 'Sakura Flood',
    templateId: 325367418993728,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_sakura_250305.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_sakura_250305.mp4',
  },
];

export const AI_DANCING_ITEMS: CollectionItem[] = [
  {
    id: 'the-silly-bird-shimmy-dancing',
    title: 'The Silly Bird Shimmy',
    prompt: 'The Silly Bird Shimmy',
    templateId: 367302749516608,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_birdman_251029.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_birdman_251029.mp4',
  },
  {
    id: 'askim-cok-pardon',
    title: 'Aşkım Çok Pardon',
    prompt: 'Aşkım Çok Pardon',
    templateId: 367828176752256,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_turkey_251029.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_turkey_251029.mp4',
  },
  {
    id: 'muertos-cha-cha',
    title: 'Muertos Cha-Cha',
    prompt: 'Muertos Cha-Cha',
    templateId: 367503422735872,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_deaddance_251027.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_deaddance_251027.mp4',
  },
  {
    id: 'shake-shake-disco',
    title: 'Shake Shake Disco',
    prompt: 'Shake Shake Disco',
    templateId: 343058524240960,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-shake-251109.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-shake-251109.mp4',
  },
  {
    id: 'drunk-pole-dance',
    title: 'Drunk Pole Dance',
    prompt: 'Drunk Pole Dance',
    templateId: 351899261628032,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_poledance_250731.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_poledance_250731.mp4',
  },
  {
    id: 'pubg-winner-hit',
    title: 'PUBG Winner Hit',
    prompt: 'PUBG Winner Hit',
    templateId: 337792714792704,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_winnerdance_250513.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_winnerdance_250513.mp4',
  },
  {
    id: 'vroom-vroom-step',
    title: 'Vroom Vroom Step',
    prompt: 'Vroom Vroom Step',
    templateId: 334053280928832,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_vroomdance.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_vroomdance.mp4',
  },
  {
    id: 'shake-it-to-the-max',
    title: 'Shake It to the Max',
    prompt: 'Shake It to the Max',
    templateId: 343058758753344,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_shakeitmax_250626.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_shakeitmax_250626.mp4',
  },
  {
    id: 'li-xi-cheng-merch',
    title: 'Li Xi Cheng Merch',
    prompt: 'Li Xi Cheng Merch',
    templateId: 343058574996544,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_lixicheng_250626.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_lixicheng_250626.mp4',
  },
  {
    id: 'strikeout-dance',
    title: 'Strikeout Dance',
    prompt: 'Strikeout Dance',
    templateId: 343058619202624,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_3wave_250626.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_3wave_250626.mp4',
  },
  {
    id: 'passo-bem-solto',
    title: 'PASSO BEM SOLTO',
    prompt: 'PASSO BEM SOLTO',
    templateId: 343058408062016,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_passodance_250626.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_passodance_250626.mp4',
  },
  {
    id: 'skeleton-dance',
    title: 'Skeleton Dance',
    prompt: 'Skeleton Dance',
    templateId: 337572593925696,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_skeleton_250513.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_skeleton_250513.mp4',
  },
  {
    id: 'rat-dance-killer',
    title: 'Rat Dance Killer',
    prompt: 'Rat Dance Killer',
    templateId: 343058469676096,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_ratdance_250626.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_ratdance_250626.mp4',
  },
  {
    id: 'jiggle-jiggle',
    title: 'Jiggle Jiggle',
    prompt: 'Jiggle Jiggle',
    templateId: 333178074897472,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_jiggle_250422.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_jiggle_250422.mp4',
  },
  {
    id: 'emergency-beat',
    title: 'Emergency Beat',
    prompt: 'Emergency Beat',
    templateId: 331864971269184,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_emergency_250409.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_emergency_250409.mp4',
  },
  {
    id: 'subject-3-fever',
    title: 'Subject 3 Fever',
    prompt: 'Subject 3 Fever',
    templateId: 327828816843648,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_subject3_250318.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_subject3_250318.mp4',
  },
  {
    id: 'lets-ymca',
    title: "Let's YMCA!",
    prompt: "Let's YMCA!",
    templateId: 324641581197696,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_ymca_250423.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_ymca_250423.mp4',
  },
  {
    id: 'hands-up-hands-up',
    title: 'Hands Up! Hands Up!',
    prompt: 'Hands Up! Hands Up!',
    templateId: 343058324329536,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_handsup_250626.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_handsup_250626.mp4',
  },
  {
    id: 'gabu-dance',
    title: 'Gabu Dance',
    prompt: 'Gabu Dance',
    templateId: 343058274917440,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_gabudance_0625.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_gabudance_0625.mp4',
  },
  {
    id: 'neymar-dj-dance',
    title: 'Neymar DJ Dance',
    prompt: 'Neymar DJ Dance',
    templateId: 343058215445568,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_neymardance_0624.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_neymardance_0624.mp4',
  },
];

export const AI_CHARACTER_ITEMS: CollectionItem[] = [
  {
    id: 'dragon-evoker',
    title: 'Dragon Evoker',
    prompt: 'Dragon Evoker',
    templateId: 362350589198976,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_dragon_250928.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_dragon_250928.mp4',
  },
  {
    id: 'figurine-me-up-character',
    title: 'Figurine Me Up!',
    prompt: 'Figurine Me Up!',
    templateId: 359328847686976,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fapp_3dtoy_250911.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapp_3dtoy_250911.mp4',
  },
  {
    id: '3d-figurine-factory-character',
    title: '3D Figurine Factory',
    prompt: '3D Figurine Factory',
    templateId: 359004842664384,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2F3dtoy_250909.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2F3dtoy_250909.mp4',
  },
  {
    id: 'god-wing-gacha',
    title: 'God Wing Gacha',
    prompt: 'God Wing Gacha',
    templateId: 366592384473920,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_3gods_251022.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_3gods_251022.mp4',
  },
  {
    id: 'honey-bee-magic',
    title: 'Honey Bee Magic',
    prompt: 'Honey Bee Magic',
    templateId: 339694359740224,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-bee-251109.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-bee-251109.mp4',
  },
  {
    id: 'pole-split-vixen',
    title: 'Pole Split Vixen',
    prompt: 'Pole Split Vixen',
    templateId: 366799217822656,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_newpole_251023.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_newpole_251023.mp4',
  },
  {
    id: 'octopus-invasion',
    title: 'Octopus Invasion',
    prompt: 'Octopus Invasion',
    templateId: 357904025203072,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_anemone_250903.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_anemone_250903.mp4',
  },
  {
    id: 'lionfish-venomous',
    title: 'Lionfish Venomous',
    prompt: 'Lionfish Venomous',
    templateId: 357905373827456,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_lionfish_250903.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_lionfish_250903.mp4',
  },
  {
    id: 'ninja-shadow-clone',
    title: 'Ninja Shadow Clone',
    prompt: 'Ninja Shadow Clone',
    templateId: 354371350649280,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_clone_250814.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_clone_250814.mp4',
  },
  {
    id: 'shark-shadows',
    title: 'Shark Shadows',
    prompt: 'Shark Shadows',
    templateId: 357903645598080,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_shark_250903.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_shark_250903.mp4',
  },
  {
    id: 'vampire-royalty',
    title: 'Vampire Royalty',
    prompt: 'Vampire Royalty',
    templateId: 359516293494080,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_vampire_250911.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_vampire_250911.mp4',
  },
  {
    id: 'winged-wardrobe',
    title: 'Winged Wardrobe',
    prompt: 'Winged Wardrobe',
    templateId: 345014411085376,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_winged_0623.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_winged_0623.mp4',
  },
  {
    id: 'haunting-doll',
    title: 'Haunting Doll',
    prompt: 'Haunting Doll',
    templateId: 360749956342336,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_tim_250917.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_tim_250917.mp4',
  },
  {
    id: 'zombie-mode',
    title: 'Zombie Mode',
    prompt: 'Zombie Mode',
    templateId: 302325299651648,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_zombiemode.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_zombiemode.mp4',
  },
  {
    id: 'anything-robot',
    title: 'Anything, Robot',
    prompt: 'Anything, Robot',
    templateId: 313358700761536,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_robot_250207.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_robot_250207.mp4',
  },
  {
    id: 'pomba-gira-slay',
    title: 'Pomba Gira Slay',
    prompt: 'Pomba Gira Slay',
    templateId: 321958080134016,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_pombagira_250213.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_pombagira_250213.mp4',
  },
  {
    id: 'jellycat-everything',
    title: 'Jellycat Everything',
    prompt: 'Jellycat Everything',
    templateId: 324640938615168,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_jellytoy.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_jellytoy.mp4',
  },
  {
    id: 'sakura-flood-character',
    title: 'Sakura Flood',
    prompt: 'Sakura Flood',
    templateId: 325367418993728,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_sakura_250305.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_sakura_250305.mp4',
  },
  {
    id: 'kill-bill',
    title: 'KILL BILL',
    prompt: 'KILL BILL',
    templateId: 333181805861952,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_killbill_250424.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_killbill_250424.mp4',
  },
  {
    id: 'werewolf-rage',
    title: 'Werewolf Rage',
    prompt: 'Werewolf Rage',
    templateId: 335610959448832,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_werewolf_250430.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_werewolf_250430.mp4',
  },
];

export const FASHION_ITEMS: CollectionItem[] = [
  {
    id: 'coral-dreamscape',
    title: 'Coral Dreamscape',
    prompt: 'Coral Dreamscape',
    templateId: 357903949828480,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_coral_250903.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_coral_250903.mp4',
  },
  {
    id: 'change-my-outfit',
    title: 'Change My Outfit',
    prompt: 'Change My Outfit',
    templateId: 340952173729600,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_changemyoutfit_250604.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_changemyoutfit_250604.mp4',
  },
  {
    id: 'winged-wardrobe-fashion',
    title: 'Winged Wardrobe',
    prompt: 'Winged Wardrobe',
    templateId: 345014411085376,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_winged_0623.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_winged_0623.mp4',
  },
  {
    id: 'us-yearbook-flash',
    title: 'US Yearbook Flash',
    prompt: 'US Yearbook Flash',
    templateId: 347130211954560,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_usid_250706.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_usid_250706.mp4',
  },
  {
    id: 'petals-of-goodbye',
    title: 'Petals of Goodbye',
    prompt: 'Petals of Goodbye',
    templateId: 352956065691584,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_petal.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_petal.mp4',
  },
  {
    id: 'beam-me-up',
    title: 'Beam Me Up',
    prompt: 'Beam Me Up',
    templateId: 350827688007296,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_blue_250725.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_blue_250725.mp4',
  },
  {
    id: 'fish-dreamcore',
    title: 'Fish Dreamcore',
    prompt: 'Fish Dreamcore',
    templateId: 341651541059392,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_fish_250603.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_fish_250603.mp4',
  },
  {
    id: 'suit-swagger',
    title: 'Suit Swagger',
    prompt: 'Suit Swagger',
    templateId: 328545151283968,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_suit.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_suit.mp4',
  },
  {
    id: 'liquid-metal',
    title: 'Liquid Metal',
    prompt: 'Liquid Metal',
    templateId: 342180291926592,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_metal_250606.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_metal_250606.mp4',
  },
  {
    id: 'fairy-wings',
    title: 'Fairy Wings',
    prompt: 'Fairy Wings',
    templateId: 341983360051008,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_sprite_250605.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_sprite_250605.mp4',
  },
  {
    id: 'somber-embrace',
    title: 'Somber Embrace',
    prompt: 'Somber Embrace',
    templateId: 342538347747072,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_blackwings_0609.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_blackwings_0609.mp4',
  },
  {
    id: 'cleopatra-reborn',
    title: 'Cleopatra Reborn',
    prompt: 'Cleopatra Reborn',
    templateId: 343241420215360,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_cleopatra_250613.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_cleopatra_250613.mp4',
  },
  {
    id: 'fin-tastic-mermaid-fashion',
    title: 'Fin-tastic Mermaid',
    prompt: 'Fin-tastic Mermaid',
    templateId: 340541567573824,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_mermaid_250528.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_mermaid_250528.mp4',
  },
  {
    id: 'thunder-god',
    title: 'Thunder God',
    prompt: 'Thunder God',
    templateId: 340383170699072,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_thunder_250527.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_thunder_250527.mp4',
  },
  {
    id: 'trippy-lilies',
    title: 'Trippy Lilies',
    prompt: 'Trippy Lilies',
    templateId: 339398587639552,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_lilies.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_lilies.mp4',
  },
  {
    id: 'sharking-summer',
    title: 'Sharking Summer',
    prompt: 'Sharking Summer',
    templateId: 342535507046144,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_skark_250608.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_skark_250608.mp4',
  },
  {
    id: 'carnival-queen',
    title: 'Carnival Queen',
    prompt: 'Carnival Queen',
    templateId: 325728504863808,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_carnival_250308.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_carnival_250308.mp4',
  },
  {
    id: 'vogue-walk',
    title: 'Vogue Walk',
    prompt: 'Vogue Walk',
    templateId: 322852853601344,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_model_250312.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_model_250312.mp4',
  },
  {
    id: 'bikini-up',
    title: 'Bikini Up!',
    prompt: 'Bikini Up!',
    templateId: 313555098280384,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_bikini_250218.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_bikini_250218.mp4',
  },
  {
    id: 'holy-wings',
    title: 'Holy Wings',
    prompt: 'Holy Wings',
    templateId: 313649622731200,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_anglewings_250208.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_anglewings_250208.mp4',
  },
  {
    id: 'smoking-vibe',
    title: 'Smoking Vibe',
    prompt: 'Smoking Vibe',
    templateId: 316645675647872,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fwebsmoke250113.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fwebsmoke250113.mp4',
  },
  {
    id: 'sharksnap',
    title: 'Sharksnap!',
    prompt: 'Sharksnap!',
    templateId: 344131642438080,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_shark_250617.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_shark_250617.mp4',
  },
  {
    id: 'red-or-white',
    title: 'Red or White?',
    prompt: 'Red or White?',
    templateId: 345536984247872,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_haircolor.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_haircolor.mp4',
  },
];

export const FESTIVAL_ITEMS: CollectionItem[] = [
  {
    id: 'summoning-succubus',
    title: 'Summoning Succubus',
    prompt: 'Summoning Succubus',
    templateId: 365522752365312,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_summoningsuccubus_251017.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_summoningsuccubus_251017.mp4',
  },
  {
    id: 'skeletal-bae',
    title: 'Skeletal Bae',
    prompt: 'Skeletal Bae',
    templateId: 365519260162816,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_deadlover_251017.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_deadlover_251017.mp4',
  },
  {
    id: 'ghostface-terror-festival',
    title: 'Ghostface Terror',
    prompt: 'Ghostface Terror',
    templateId: 362704938833536,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_scream_250930.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_scream_250930.mp4',
  },
  {
    id: 'muertos-cha-cha-festival',
    title: 'Muertos Cha-Cha',
    prompt: 'Muertos Cha-Cha',
    templateId: 367503422735872,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_deaddance_251027.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_deaddance_251027.mp4',
  },
  {
    id: 'halloween-voodoo-doll',
    title: 'Halloween Voodoo Doll',
    prompt: 'Halloween Voodoo Doll',
    templateId: 365519364076288,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-doll-251107.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-doll-251107.mp4',
  },
  {
    id: 'escape-from-nightmare',
    title: 'Escape from Nightmare',
    prompt: 'Escape from Nightmare',
    templateId: 365170951985920,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_escapefromnightmarexiugai_251016.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_escapefromnightmarexiugai_251016.mp4',
  },
  {
    id: 'vampire-royalty-festival',
    title: 'Vampire Royalty',
    prompt: 'Vampire Royalty',
    templateId: 359516293494080,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_vampire_250911.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_vampire_250911.mp4',
  },
  {
    id: 'birthday-surprise',
    title: 'Birthday Surprise',
    prompt: 'Birthday Surprise',
    templateId: 352981446212096,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_birthday.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_birthday.mp4',
  },
  {
    id: 'baby-arrived',
    title: 'Baby Arrived',
    prompt: 'Baby Arrived',
    templateId: 342874383633472,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_getbaby_250611.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_getbaby_250611.mp4',
  },
  {
    id: 'zombie-hand',
    title: 'Zombie Hand',
    prompt: 'Zombie Hand',
    templateId: 302325299672128,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_zombiehand.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_zombiehand.mp4',
  },
  {
    id: 'wizard-hat',
    title: 'Wizard Hat',
    prompt: 'Wizard Hat',
    templateId: 302325299661888,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_wizardhat.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_wizardhat.mp4',
  },
  {
    id: 'zombie-mode-festival',
    title: 'Zombie Mode',
    prompt: 'Zombie Mode',
    templateId: 302325299651648,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_zombiemode.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_zombiemode.mp4',
  },
  {
    id: 'snake-snuggle',
    title: 'Snake Snuggle',
    prompt: 'Snake Snuggle',
    templateId: 313359048325568,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_chinesesnake_250127.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_chinesesnake_250127.mp4',
  },
  {
    id: 'rainbow-moment',
    title: 'Rainbow Moment',
    prompt: 'Rainbow Moment',
    templateId: 340894729537344,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_rainbow_250603.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_rainbow_250603.mp4',
  },
];

export const AI_FUNNY_ITEMS: CollectionItem[] = [
  {
    id: 'bald-swipe',
    title: 'Bald Swipe',
    prompt: 'Bald Swipe',
    templateId: 340361643937600,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_bald_250528.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_bald_250528.mp4',
  },
  {
    id: 'insta-bangs-spray',
    title: 'Insta-Bangs Spray',
    prompt: 'Insta-Bangs Spray',
    templateId: 358127926981120,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_spray_250904.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_spray_250904.mp4',
  },
  {
    id: 'kitten-hide-and-seek',
    title: 'Kitten Hide and Seek',
    prompt: 'Kitten Hide and Seek',
    templateId: 354568167143040,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_250815_2.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_250815_2.mp4',
  },
  {
    id: 'paw-princess',
    title: 'Paw Princess',
    prompt: 'Paw Princess',
    templateId: 330448062595520,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_dresspet_250401.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_dresspet_250401.mp4',
  },
  // Commented out for App Store review - hug related content
  // {
  //   id: 'huge-cutie',
  //   title: 'Huge Cutie',
  //   prompt: 'Huge Cutie',
  //   templateId: 329607251526400,
  //   image:
  //     'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_hugecutie_250327.gif?x-oss-process=style/cover-webp',
  //   videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_hugecutie_250327.mp4',
  // },
  {
    id: 'polar-bear-shock',
    title: 'Polar Bear Shock',
    prompt: 'Polar Bear Shock',
    templateId: 325501134629952,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_polarbear_250304.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_polarbear_250304.mp4',
  },
  {
    id: 'sheep-curls',
    title: 'Sheep Curls',
    prompt: 'Sheep Curls',
    templateId: 310371322329472,
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_curlyhair.gif?x-oss-process=style/cover-webp',
    videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_curlyhair.mp4',
  },
];

// Merge all collections into a single list for search
export const getAllCollectionsItems = (): CollectionItem[] => {
  return [
    ...VIRAL_ITEMS,
    // ...AI_ROMANCE_ITEMS, // Commented out for App Store review
    ...AI_STYLE_ITEMS,
    ...AI_DANCING_ITEMS,
    ...AI_CHARACTER_ITEMS,
    ...FASHION_ITEMS,
    ...FESTIVAL_ITEMS,
    ...AI_FUNNY_ITEMS,
  ];
};

// Export as constant for direct access
export const ALL_COLLECTIONS_ITEMS = getAllCollectionsItems();

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const featuredItems = useMemo<FeaturedItem[]>(
    () => [
      {
        id: 'fin-tastic-mermaid',
        title: 'Fin-tastic Mermaid',
        subtitle: 'Transform into a magical mermaid!',
        cta: 'Try Now',
        image:
          'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_mermaid_250528.gif?x-oss-process=style/cover-webp',
        prompt: 'Fin-tastic Mermaid',
        templateId: 340541567573824,
        videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_mermaid_250528.mp4',
      },
      {
        id: 'muscle-pro',
        title: 'Muscle Pro: Born to Built',
        subtitle: 'Show off your strength!',
        cta: 'Try Now',
        image:
          'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_muscle_250914.gif?x-oss-process=style/cover-webp',
        prompt: 'Muscle Pro: Born to Built',
        templateId: 359850491398912,
        videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_muscle_250914.mp4',
      },
      {
        id: 'born-to-barbie',
        title: 'Born to Barbie',
        subtitle: 'Born to Barbie',
        cta: 'Try Now',
        templateId: 335261821526784,
        image:
          'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-babii-251109.gif?x-oss-process=style/cover-webp',
        videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fweb-babii-251109.mp4',
      },
      // Commented out for App Store review
      // {
      //   id: 'officer-crush',
      //   title: 'Officer Crush',
      //   subtitle: 'Become the ultimate officer!',
      //   cta: 'Try Now',
      //   image:
      //     'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_officer.gif?x-oss-process=style/cover-webp',
      //   prompt: 'Officer Crush',
      //   templateId: 353279785150016,
      //   videUrl: 'https://media.pixverse.ai/asset%2Ftemplate%2Fapi_officer.mp4',
      // },

    ],
    []
  );

  const viralItems = useMemo(() => VIRAL_ITEMS, []);
  // const aiRomanceItems = useMemo(() => AI_ROMANCE_ITEMS, []); // Commented out for App Store review
  const aiRomanceItems = useMemo(() => [] as CollectionItem[], []); // Empty array for App Store review
  const aiStyleItems = useMemo(() => AI_STYLE_ITEMS, []);
  const aiDancingItems = useMemo(() => AI_DANCING_ITEMS, []);
  const aiCharacterItems = useMemo(() => AI_CHARACTER_ITEMS, []);
  const fashionItems = useMemo(() => FASHION_ITEMS, []);
  const festivalItems = useMemo(() => FESTIVAL_ITEMS, []);
  const aiFunnyItems = useMemo(() => AI_FUNNY_ITEMS, []);

  const handlePressCollectionItem = useCallback(
    (item: CollectionItem) => {
      router.push({
        pathname: '/item/[id]',
        params: {
          id: item.id,
          title: item.title,
          image: item.image,
          prompt: item.prompt ?? item.title,
          templateId: item.templateId?.toString(),
          videUrl: item.videUrl,
        },
      });
    },
    [router]
  );

  const [activeFeature, setActiveFeature] = useState(0);
  const featureScrollRef = useRef<ScrollView | null>(null);

  // Auto-advance featured carousel
  useEffect(() => {
    if (!featuredItems.length || !featureScrollRef.current) return;

    const interval = setInterval(() => {
      setActiveFeature((prev) => {
        const nextIndex = (prev + 1) % featuredItems.length;
        featureScrollRef.current?.scrollTo({
          x: nextIndex * CARD_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [featuredItems.length]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={[styles.stickyHeader, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={styles.iconButton}
          onPress={() => router.push('/search')}>
          <Ionicons name="search" size={24} color="#fff" />
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.proBadge}
            onPress={() => router.push('/pro-modal')}>
            <Ionicons name="sparkles" size={16} color="#fff" />
            <Text style={styles.proText}>PRO</Text>
          </Pressable>

          <Pressable
            style={styles.iconButton}
            onPress={() => router.push('/settings-modal')}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}>

        <View style={styles.featureCarousel}>
          <ScrollView
            ref={featureScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH}
            decelerationRate="fast"
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
              setActiveFeature(index);
            }}
            snapToAlignment="start">
            {featuredItems.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.featureCard, { width: CARD_WIDTH }]}
                onPress={() => {
                  if (item.templateId) {
                    router.push({
                      pathname: '/item/[id]',
                      params: {
                        id: item.id,
                        title: item.title,
                        image: item.image,
                        prompt: item.prompt ?? item.title,
                        templateId: item.templateId.toString(),
                        videUrl: item.videUrl ?? '',
                      },
                    });
                  }
                }}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.featureImage}
                  cachePolicy="memory-disk"
                  contentFit="cover"
                  transition={200}
                  placeholderContentFit="cover"
                />
                <View style={styles.featureOverlay} />
                <LinearGradient
                  colors={['rgba(3,3,8,0)', 'rgba(0, 0, 0, 0.95)']}
                  locations={[0.2, 1]}
                  style={styles.featureGradient}
                />
                <View style={styles.featureContent}>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>{item.title}</Text>
                    <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => {
                      if (item.templateId) {
                        router.push({
                          pathname: '/item/[id]',
                          params: {
                            id: item.id,
                            title: item.title,
                            image: item.image,
                            prompt: item.prompt ?? item.title,
                            templateId: item.templateId.toString(),
                            videUrl: item.videUrl ?? '',
                          },
                        });
                      }
                    }}>
                    <LinearGradient
                      colors={["#EA6198", "#7135FF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                      pointerEvents="none"
                    />
                    <Text style={styles.primaryButtonText}>{item.cta}</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </ScrollView>
 
          <View style={styles.pagination}>
            {featuredItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.paginationDot,
                  activeFeature === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
          
              
 
        </View>

        <MemoizedCollectionSection
          title="Popular"
          items={viralItems}
          limit={6}
          onSeeAll={(sectionTitle, sectionItems) =>
            router.push({
              pathname: '/all-items',
              params: {
                title: sectionTitle,
                items: JSON.stringify(sectionItems),
              },
            })
          }
          onPressItem={handlePressCollectionItem}
        />
        {/* Commented out for App Store review - AI Romance collection */}
        {/* <MemoizedCollectionSection
          title="AI Romance"
          items={aiRomanceItems}
          limit={6}
          onSeeAll={(sectionTitle, sectionItems) =>
            router.push({
              pathname: '/all-items',
              params: {
                title: sectionTitle,
                items: JSON.stringify(sectionItems),
              },
            })
          }
          onPressItem={handlePressCollectionItem}
        /> */}

        <MemoizedCollectionSection
          title="Style Fusion"
          items={aiStyleItems}
          limit={6}
          onSeeAll={(sectionTitle, sectionItems) =>
            router.push({
              pathname: '/all-items',
              params: {
                title: sectionTitle,
                items: JSON.stringify(sectionItems),
              },
            })
          }
          onPressItem={handlePressCollectionItem}
        />

        <MemoizedCollectionSection
          title="Beat Motion"
          items={aiDancingItems}
          limit={6}
          onSeeAll={(sectionTitle, sectionItems) =>
            router.push({
              pathname: '/all-items',
              params: {
                title: sectionTitle,
                items: JSON.stringify(sectionItems),
              },
            })
          }
          onPressItem={handlePressCollectionItem}
        />

        <MemoizedCollectionSection
          title="Avatar"
          items={aiCharacterItems}
          limit={6}
          onSeeAll={(sectionTitle, sectionItems) =>
            router.push({
              pathname: '/all-items',
              params: {
                title: sectionTitle,
                items: JSON.stringify(sectionItems),
              },
            })
          }
          onPressItem={handlePressCollectionItem}
        />

        <MemoizedCollectionSection
          title="Fashion"
          items={fashionItems}
          limit={6}
          onSeeAll={(sectionTitle, sectionItems) =>
            router.push({
              pathname: '/all-items',
              params: {
                title: sectionTitle,
                items: JSON.stringify(sectionItems),
              },
            })
          }
          onPressItem={handlePressCollectionItem}
        />

        <MemoizedCollectionSection
          title="Festival Vibe"
          items={festivalItems}
          limit={6}
          onSeeAll={(sectionTitle, sectionItems) =>
            router.push({
              pathname: '/all-items',
              params: {
                title: sectionTitle,
                items: JSON.stringify(sectionItems),
              },
            })
          }
          onPressItem={handlePressCollectionItem}
        />

        <MemoizedCollectionSection
          title="Giggle World"
          items={aiFunnyItems}
          limit={6}
          onSeeAll={(sectionTitle, sectionItems) =>
            router.push({
              pathname: '/all-items',
              params: {
                title: sectionTitle,
                items: JSON.stringify(sectionItems),
              },
            })
          }
          onPressItem={handlePressCollectionItem}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

type CollectionSectionProps = {
  title: string;
  items: CollectionItem[];
  limit?: number;
  onSeeAll?: (title: string, items: CollectionItem[]) => void;
  onPressItem?: (item: CollectionItem) => void;
};

// Memoized collection card component
const CollectionCard = React.memo(({
  item,
  isLoading,
  onLoadStart,
  onLoadEnd,
  onPress
}: {
  item: CollectionItem;
  isLoading: boolean;
  onLoadStart: () => void;
  onLoadEnd: () => void;
  onPress: () => void;
}) => {
  return (
    <Pressable style={styles.collectionCard} onPress={onPress}>
      <Image
        source={{ uri: item.image }}
        style={styles.collectionImage}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        onError={onLoadEnd}
        cachePolicy="memory-disk"
        contentFit="cover"
        transition={200}
        placeholderContentFit="cover"
      />
      {isLoading && (
        <View style={styles.imageLoadingOverlay}>
          <ActivityIndicator size="small" color="#9BA0BC" />
        </View>
      )}
      <View style={styles.cardOverlay} />
      <View style={styles.cardContent}>
        {item.badge && (
          <View
            style={[
              styles.badge,
              item.badge === 'Hot' ? styles.badgeHot : styles.badgeNew,
            ]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <View style={styles.collectionTitleWrapper}>
          <Text
            style={styles.collectionTitle}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.image === nextProps.item.image &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.badge === nextProps.item.badge &&
    prevProps.isLoading === nextProps.isLoading
  );
});

CollectionCard.displayName = 'CollectionCard';

function CollectionSection({ title, items, limit, onSeeAll, onPressItem }: CollectionSectionProps) {
  const displayItems = useMemo(() => {
    return limit ? items.slice(0, limit) : items;
  }, [items, limit]);

  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const handleImageLoadStart = useCallback((itemId: string) => {
    setLoadingImages((prev) => {
      if (prev.has(itemId)) return prev;
      return new Set(prev).add(itemId);
    });
  }, []);

  const handleImageLoadEnd = useCallback((itemId: string) => {
    setLoadingImages((prev) => {
      if (!prev.has(itemId)) return prev;
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  }, []);

  const handleSeeAllPress = useCallback(() => {
    if (onSeeAll) {
      onSeeAll(title, items);
    }
  }, [onSeeAll, title, items]);

  const handleItemPress = useCallback((item: CollectionItem) => {
    onPressItem?.(item);
  }, [onPressItem]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <Pressable hitSlop={8} onPress={handleSeeAllPress}>
            <Ionicons name="chevron-forward" size={18} color="#A8A9C3" />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        <View style={styles.sectionRow}>
          {displayItems.map((item) => {
            const isLoading = loadingImages.has(item.id);
            return (
              <CollectionCard
                key={item.id}
                item={item}
                isLoading={isLoading}
                onLoadStart={() => handleImageLoadStart(item.id)}
                onLoadEnd={() => handleImageLoadEnd(item.id)}
                onPress={() => handleItemPress(item)}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// Memoize CollectionSection to prevent unnecessary re-renders
const MemoizedCollectionSection = React.memo(CollectionSection, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.items === nextProps.items &&
    prevProps.limit === nextProps.limit &&
    prevProps.onSeeAll === nextProps.onSeeAll &&
    prevProps.onPressItem === nextProps.onPressItem
  );
});

MemoizedCollectionSection.displayName = 'CollectionSection';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0D16',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F0D16',
    paddingBottom: 12,
  },
  iconButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 'auto',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6F39FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
  },
  proText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'space-between',
    zIndex: 20,
  },
  featureCarousel: {
    marginTop: 0,
    height: HERO_HEIGHT + 32,
  },
  featureCard: {
    height: HERO_HEIGHT,
  
    marginRight: 0,
    overflow: 'hidden',
    backgroundColor: '#1E1B2D',
  },
  featureImage: {
    ...StyleSheet.absoluteFillObject,
  },
  featureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 10, 20, 0.45)',
  },
  featureGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT * 0.7,
  },
  featureContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 28,
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignSelf:"center"
  },
  featureTextContainer: {
    width: '100%',
    gap: 4,
    marginBottom: 12,
  },
  featureTitle: {
    color: '#F5F3FF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  featureSubtitle: {
    color: '#C7C9E8',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  primaryButton: {
    alignSelf: 'center',
    borderRadius: 40,
    paddingHorizontal: 35,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  pagination: {
    position: 'absolute',
    bottom: 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: '#6B6D85',
  },
  paginationDotActive: {
    width: 18,
    backgroundColor: '#C7C9E8',
  },
  section: {
    // marginTop: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
   
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  sectionLink: {
    color: '#A8A9C3',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  collectionCard: {
    width: 160,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E1B2D',
  },
  collectionImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 7, 16, 0.35)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  badgeNew: {
    backgroundColor: '#6F39FF',
  },
  badgeHot: {
    backgroundColor: '#FF4F6D',
  },
  collectionTitleWrapper: {
    marginTop: 'auto',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(10, 7, 16, 0.72)',
    maxWidth: '100%',
  },
  collectionTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 13, 22, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  bottomSpacer: {
    height: 0,
  },
});

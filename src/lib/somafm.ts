import ora from 'ora';

const API_URL = 'https://somafm.com/channels.json';

interface RawChannel {
  [key: string]: unknown;
  description?: string;
  dj?: string;
  genre?: string;
  id: string;
  image?: string;
  lastPlaying?: string;
  listeners?: string;
  playlists?: RawPlaylist[];
  title: string;
}

interface RawPlaylist {
  format?: string;
  quality?: string;
  url: string;
}

export interface SomaChannel {
  description: string;
  dj: string;
  genre: string;
  id: string;
  image: string;
  lastPlaying: string;
  listeners: number;
  playlists: SomaPlaylist[];
  title: string;
}

export interface SomaPlaylist {
  format: string;
  quality: string;
  url: string;
}

function mapQuality(value: string) {
  const quality = value.toLowerCase();

  if (quality.includes('highest') || quality.includes('hq')) return 'highest';
  if (quality.includes('fast') || quality.includes('128')) return 'high';
  if (quality.includes('slow') || quality.includes('64')) return 'slow';

  return 'unknown';
}

function mapFormat(value: string) {
  const format = value.toLowerCase();

  if (format.includes('aac')) return 'aac';
  if (format.includes('mp3')) return 'mp3';
  if (format.includes('opus')) return 'opus';
  if (format.includes('ogg')) return 'ogg';

  return 'unknown';
}

function normalizePlaylists(channel: RawChannel) {
  const direct =
    channel.playlists
      ?.filter(playlist => Boolean(playlist?.url))
      .map(playlist => ({
        format: mapFormat(playlist.format || playlist.url),
        quality: mapQuality(playlist.quality || playlist.url),
        url: playlist.url,
      })) ?? [];

  if (direct.length) return direct;

  const derived: SomaPlaylist[] = [];

  Object.entries(channel).forEach(([key, value]) => {
    if (typeof value !== 'string' || !value.startsWith('http')) return;

    if (
      value.includes('.pls') ||
      value.includes('.m3u') ||
      value.includes('.m3u8')
    ) {
      derived.push({
        format: mapFormat(key),
        quality: mapQuality(key),
        url: value,
      });
    }
  });

  return derived;
}

function sortPlaylists(playlists: SomaPlaylist[]) {
  const formatScore: Record<string, number> = {
    aac: 3,
    mp3: 2,
    opus: 1,
    unknown: 0,
  };

  const qualityScore: Record<string, number> = {
    high: 2,
    highest: 3,
    slow: 1,
    unknown: 0,
  };

  return [...playlists].sort((left, right) => {
    const leftFormat = formatScore[left.format] ?? 0;
    const rightFormat = formatScore[right.format] ?? 0;

    if (leftFormat !== rightFormat) return rightFormat - leftFormat;

    const leftQuality = qualityScore[left.quality] ?? 0;
    const rightQuality = qualityScore[right.quality] ?? 0;

    return rightQuality - leftQuality;
  });
}

function parseListeners(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function fetchStations() {
  const spinner = ora('Loading stations from SomaFM').start();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { channels?: RawChannel[] };
    const channels = data.channels ?? [];

    const normalized = channels
      .map(channel => ({
        description: channel.description || 'No description',
        dj: channel.dj || 'Unknown',
        genre: channel.genre || 'Unknown',
        id: channel.id,
        image: channel.image || '',
        lastPlaying: channel.lastPlaying || '',
        listeners: parseListeners(channel.listeners),
        playlists: normalizePlaylists(channel),
        title: channel.title,
      }))
      .filter(channel => channel.playlists.length > 0);

    spinner.succeed(`Loaded ${normalized.length} stations`);

    return normalized as SomaChannel[];
  } catch (error) {
    spinner.fail('Failed to load stations');

    if (error instanceof Error) {
      throw new Error(`SomaFM API error: ${error.message}`);
    }

    throw new Error('SomaFM API error');
  }
}

export function getStationById(channels: SomaChannel[], id: string) {
  return channels.find(
    channel => channel.id.toLowerCase() === id.toLowerCase(),
  );
}

export async function resolvePlayableStream(
  channel: SomaChannel,
  preferredQuality?: string,
) {
  const sorted = sortPlaylists(channel.playlists);
  const filtered = preferredQuality
    ? sorted.filter(playlist => playlist.quality === preferredQuality)
    : sorted;
  const candidate = filtered[0] || sorted[0];

  if (!candidate) {
    throw new Error(`No stream candidates found for station: ${channel.id}`);
  }

  if (!candidate.url.endsWith('.pls')) {
    return candidate.url;
  }

  const response = await fetch(candidate.url);

  if (!response.ok) {
    throw new Error(`Could not load playlist file (${response.status})`);
  }

  const playlistContent = await response.text();
  const match = playlistContent.match(/^File\d+=(.+)$/im);

  if (!match?.[1]) {
    throw new Error(`Could not parse playlist for station: ${channel.id}`);
  }

  return match[1].trim();
}

function formatListeners(count: number) {
  return new Intl.NumberFormat('en-US').format(count);
}

function fitColumn(value: string, width: number) {
  if (value.length <= width) return value.padEnd(width);
  return `${value.slice(0, Math.max(0, width - 1))}…`;
}

export function stationChoices(channels: SomaChannel[]) {
  const titleWidth = 28;
  const idWidth = 16;
  const listenersWidth = 10;
  const genreWidth = 24;

  return [...channels]
    .sort((left, right) => right.listeners - left.listeners)
    .map(channel => {
      const title = fitColumn(channel.title, titleWidth);
      const id = fitColumn(channel.id, idWidth);
      const listeners = fitColumn(
        formatListeners(channel.listeners),
        listenersWidth,
      );
      const genre = fitColumn(channel.genre || 'Unknown', genreWidth);

      return {
        name: `${title} | ${id} | ${listeners} | ${genre}`,
        value: channel.id,
      };
    });
}

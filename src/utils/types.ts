export interface TorrentSchema {
  id: string;
  name: string;
  filesize: string;
  magnet: string;
  seeders: string;
}

export interface StatusResponse {
  status: number;
  message: string;
}

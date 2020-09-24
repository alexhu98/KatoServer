export interface MediaFolder {
  url: string,
  name: string,
}

export interface MediaFile {
  url: string,
  fileSize: number,
  lastModified: number,
  duration: number,
}

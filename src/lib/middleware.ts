import type { TransformCallback, TransformOptions } from 'stream';
import { Transform } from 'stream';

export class MiddlewareStream extends Transform {
  private firstChunkLogged: boolean;
  private onFirstData: () => void;

  constructor(onFirstData: () => void, options?: TransformOptions) {
    super(options);

    this.firstChunkLogged = false;
    this.onFirstData = onFirstData;
  }

  _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    if (!this.firstChunkLogged) {
      this.onFirstData();

      this.firstChunkLogged = true;
    }

    this.push(chunk);

    callback();
  }
}

import { Position } from '../../types';

export default class BufferUtil {
  public static writePosition(id: number, pos: Position): Buffer {
    const buf = Buffer.alloc(5);
    buf.writeInt8(id, 0);
    buf.writeUInt16BE(pos.x, 1);
    buf.writeUInt16BE(pos.y, 3);
    return buf;
  }

  public static readPosition(buf: Buffer): { id: number; pos: Position } {
    return {
      id: buf.readInt8(0),
      pos: {
        x: buf.readUInt16BE(1),
        y: buf.readUInt16BE(3),
      },
    };
  }

  public static writeMiniPosition(pos: Position): Buffer {
    const buf = Buffer.alloc(4);
    buf.writeUInt16BE(pos.x, 0);
    buf.writeUInt16BE(pos.y, 2);
    return buf;
  }

  public static readMiniPosition(buf: Buffer): { pos: Position } {
    return {
      pos: {
        x: buf.readUInt16BE(0),
        y: buf.readUInt16BE(2),
      },
    };
  }

  public static writeDelete(id: number): Buffer {
    const buf = Buffer.alloc(1);
    buf.writeInt8(id, 0);
    return buf;
  }

  public static readDelete(buf: Buffer): { id: number } {
    return {
      id: buf.readInt8(0),
    };
  }

  public static read(buf: Buffer):
    | {
        op: 'delete';
        data: {
          id: number;
        };
      }
    | {
        op: 'position';
        data: {
          id?: number;
          pos: Position;
        };
      } {
    if (buf.length === 1)
      return {
        op: 'delete',
        data: this.readDelete(buf),
      };
    else if (buf.length === 4)
      return {
        op: 'position',
        data: this.readMiniPosition(buf),
      };
    else
      return {
        op: 'position',
        data: this.readPosition(buf),
      };
  }
}

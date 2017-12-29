// Type definitions for vala
// Definitions by: James Abney <https://github.com/jabney>
export = vala;

declare function vala(text: string, segments: vala.Segment[], defaultClass?: string): string;

declare namespace vala {
  export interface Segment {
    start: number
    end?: number
    length?: number
    tag?: string
    cls?: string
    attrs?: {[key:string]: string}
    data?: {[key:string]: string}
  }
}

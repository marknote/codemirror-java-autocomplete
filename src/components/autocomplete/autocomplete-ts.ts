import { Completion } from '@codemirror/autocomplete';
import { CaretPosition } from './types';
import  TsServer from './ts/tsserver';
import EventEmitter from 'events';

export const emitter = new EventEmitter();

const tsServer = new TsServer();

export function completeTs(code: string, caretPosition: CaretPosition): Completion[] {

  const lines = code.split('\n');
  const {line, column} = caretPosition;
  let pos = column;
  for (let i = 0; i < line; i++) {
    pos += lines[i].length;
  }
  const result = tsServer.onCompleteRequest(code, pos);
  if (!result) {
    console.log('Unable to get completions', { pos });
    return [];
  }

  return result.entries.map((c) => {
      return {
        type: c.kind,
        label: c.name,
        // TODO:: populate details and info
        boost: 1 / Number(c.sortText),
      };
    });
}

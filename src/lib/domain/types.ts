import { ParseTree } from 'antlr4ts/tree';
import { TokenStream } from 'antlr4ts';



export type CaretPosition = { line: number; column: number };
export type TokenPosition = { index: number; context: ParseTree; text: string };
export type ComputeTokenPositionFunction = (
  parseTree: ParseTree,
  tokens: TokenStream,
  caretPosition: CaretPosition
) => TokenPosition;

export type CodeInfo = {
  code: string;
  language: string;
};

/*export type EditorProp = {
    code: string;
    language: string;
    langFn: LanguageSupport;
    completor: (code: string, caretPosition: CaretPosition) => Completion[];
  };*/

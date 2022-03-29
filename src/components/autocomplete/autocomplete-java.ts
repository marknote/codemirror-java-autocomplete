import { Completion } from '@codemirror/autocomplete';
import { JavaLexer } from '../../generated/JavaLexer';
import { JavaParser } from '../../generated/JavaParser';
import { CaretPosition } from './types';
import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { getSuggestionsForParse } from './suggest';

export function completeJava(code: string, caretPosition: CaretPosition): Completion[] {
    const lexer = new JavaLexer(CharStreams.fromString(code));
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new JavaParser(tokenStream);
    return getSuggestionsForParse(parser,
        parser.expression(),
        caretPosition,
        tokenStream,
        JavaLexer.IDENTIFIER
        );
}
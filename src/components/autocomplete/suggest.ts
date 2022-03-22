import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { JavaLexer } from '../../grammar/JavaLexer';
import { JavaParser } from '../../grammar/JavaParser';
import * as c3 from 'antlr4-c3';
import {CaretPosition,  TokenPosition} from './types';
import { TerminalNode} from "antlr4ts/tree";
import { computeTokenPosition } from './compute-token-position';


export function getSuggestions(code: string, caretPosition: CaretPosition) {
  
    const lexer = new JavaLexer(CharStreams.fromString(code));
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new JavaParser(tokenStream);
    const parseTree = parser.expression();
    const position = computeTokenPosition(parseTree, tokenStream, caretPosition);
    if (!position) {
        return [];
    }
    return getSuggestionsForParse(
        parser, position);
}

function getSuggestionsForParse(
    parser: JavaParser,
    position: TokenPosition) {
    const core = new c3.CodeCompletionCore(parser);
    // Luckily, the Kotlin lexer defines all keywords and identifiers after operators,
    // so we can simply exclude the first non-keyword tokens
    const ignored:number[] = [];
    //We don't handle labels for simplicity
    core.ignoredTokens = new Set(ignored);
    core.preferredRules = new Set([JavaParser.RULE_variableDeclarator, JavaParser.RULE_arguments]);
    const candidates = core.collectCandidates(position.index);
    const completions = [];

    const tokens: string[] = [];
    candidates.tokens.forEach((_, k) => {
        
            const symbolicName = parser.vocabulary.getSymbolicName(k);
            if (symbolicName) {
                tokens.push(symbolicName.toLowerCase());
            }
        
    });
    const isIgnoredToken =
        position.context instanceof TerminalNode &&
        ignored.indexOf(position.context.symbol.type) >= 0;
    const textToMatch = isIgnoredToken ? '' : position.text;
    completions.push(...filterTokens(textToMatch, tokens));
    return completions;
}

function filterTokens(text: string, candidates: string[]) {
    if (text.trim().length === 0) {
        return candidates;
    } else {
        return candidates.filter(c => c.toLowerCase().startsWith(text.toLowerCase()));
    }
}
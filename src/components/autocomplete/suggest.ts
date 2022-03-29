import { CommonTokenStream, Parser } from 'antlr4ts';

import * as c3 from 'antlr4-c3';
import {CaretPosition} from './types';
import { ParseTree, TerminalNode} from 'antlr4ts/tree';
import { computeTokenPosition } from './compute-token-position';
import { Completion } from '@codemirror/autocomplete';


export function getSuggestionsForParse(
    parser: Parser,
    parseTree: ParseTree,
    caretPosition: CaretPosition,
    tokenStream: CommonTokenStream,
    identifierType: number) : Completion[]{

    const tokenPosition = computeTokenPosition(parseTree, tokenStream, caretPosition);
    if (!tokenPosition) {
        return [];
    }
    const core = new c3.CodeCompletionCore(parser);
    // Luckily, the Kotlin lexer defines all keywords and identifiers after operators,
    // so we can simply exclude the first non-keyword tokens
    const ignored:number[] = [];
    core.ignoredTokens = new Set(ignored);

    const candidates = core.collectCandidates(tokenPosition.index);
    console.log(candidates);
    let completions: Completion[] = [];

    candidates.tokens.forEach((_, k) => {
        const symbolicName = parser.vocabulary.getSymbolicName(k);
        if (symbolicName) {
            completions.push(
                {label: symbolicName.toLowerCase(),
                  type: 'keyword'
                });
        }
    });

    completions = completions.concat(suggestIdentifiers(tokenStream, caretPosition, identifierType));

    const isIgnoredToken =
        tokenPosition.context instanceof TerminalNode &&
        ignored.indexOf(tokenPosition.context.symbol.type) >= 0;
    const textToMatch = isIgnoredToken ? '' : tokenPosition.text;
    return filterTokens(textToMatch, completions);

}

function suggestIdentifiers(tokenStream: CommonTokenStream,
    caretPosition: CaretPosition, identifierType: number): Completion[] {
    return tokenStream.getTokens()
    .filter(item => item.type === identifierType
        && item.text != null
        && item.line !== caretPosition.line
        )
    .map(item => {
        return {
            label: item.text || '',
            type: 'variable'
        };
    });
}

function filterTokens(text: string, candidates: Completion[]): Completion[] {
    if (text.trim().length === 0) {
        return candidates;
    } else {
        return candidates.filter(c => c.label.toLowerCase().startsWith(text.toLowerCase()));
    }
}
import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { JavaLexer } from '../../generated/JavaLexer';
import { JavaParser } from '../../generated/JavaParser';
import * as c3 from 'antlr4-c3';
import {CaretPosition, TokenPosition} from './types';
import { TerminalNode} from 'antlr4ts/tree';
import { computeTokenPosition } from './compute-token-position';
import { Completion } from '@codemirror/autocomplete';



export function getSuggestions(code: string, caretPosition: CaretPosition): Completion[] {
    const lexer = new JavaLexer(CharStreams.fromString(code));
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new JavaParser(tokenStream);
    return getSuggestionsForParse(parser, caretPosition, tokenStream);
}

function getSuggestionsForParse(
    parser: JavaParser,
    caretPosition: CaretPosition,
    tokenStream: CommonTokenStream) : Completion[]{

    const tokenPosition = computeTokenPosition(parser.expression(), tokenStream, caretPosition);
    if (!tokenPosition) {
        return [];
    }
    const core = new c3.CodeCompletionCore(parser);
    // Luckily, the Kotlin lexer defines all keywords and identifiers after operators,
    // so we can simply exclude the first non-keyword tokens
    const ignored:number[] = [];
    //We don't handle labels for simplicity
    core.ignoredTokens = new Set(ignored);
    /*core.preferredRules = new Set([
        JavaParser.RULE_identifier,
        JavaParser.RULE_memberDeclaration,
        JavaParser.RULE_methodDeclaration,
        JavaParser.RULE_variableDeclarator,
        JavaParser.RULE_arguments,
        JavaParser.RULE_fieldDeclaration,
        JavaParser.RULE_constDeclaration,
        JavaParser.RULE_variableDeclarator,
        JavaParser.RULE_moduleDeclaration,
    ]);*/
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

    completions = completions.concat(suggestIdentifiers(tokenStream, tokenPosition, caretPosition));

    const isIgnoredToken =
        tokenPosition.context instanceof TerminalNode &&
        ignored.indexOf(tokenPosition.context.symbol.type) >= 0;
    const textToMatch = isIgnoredToken ? '' : tokenPosition.text;
    return filterTokens(textToMatch, completions);

}

function suggestIdentifiers(tokenStream: CommonTokenStream, tokenPosition: TokenPosition, caretPosition: CaretPosition): Completion[] {
    return tokenStream.getTokens()
    .filter(item => item.type === JavaLexer.IDENTIFIER
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
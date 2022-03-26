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
    const completions: Completion[] = [];

    candidates.tokens.forEach((_, k) => {
        const symbolicName = parser.vocabulary.getSymbolicName(k);
        if (symbolicName) {
            completions.push(
                {label: symbolicName.toLowerCase(),
                  type: 'keyword'
                });
        }
    });

    completions.concat(suggestVariables(tokenStream, tokenPosition, caretPosition));

    const isIgnoredToken =
        tokenPosition.context instanceof TerminalNode &&
        ignored.indexOf(tokenPosition.context.symbol.type) >= 0;
    const textToMatch = isIgnoredToken ? '' : tokenPosition.text;
    return filterTokens(textToMatch, completions);

}





function suggestVariables(tokenStream: CommonTokenStream, tokenPosition: TokenPosition, caretPosition: CaretPosition): Completion[] {
    const completions = [];
    const ts = tokenStream.getTokens();
    const tok = tokenPosition.index;

    for (let i = 0; i <= tok; i++) {
        const item = ts[i];
        if (item.text != null
            && item.type === JavaLexer.IDENTIFIER
            && item.line !== caretPosition.line) {
            completions.push({
                label: item.text,
                type: 'variable'
            });
        }
    }
    return completions;
}

function filterTokens(text: string, candidates: Completion[]): Completion[] {
    if (text.trim().length === 0) {
        return candidates;
    } else {
        return candidates.filter(c => c.label.toLowerCase().startsWith(text.toLowerCase()));
    }
}
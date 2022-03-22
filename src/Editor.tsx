import CodeMirror, { ViewUpdate } from '@uiw/react-codemirror';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import { java } from '@codemirror/lang-java';
import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { JavaLexer } from './grammar/JavaLexer';
import { JavaParser } from './grammar/JavaParser';
import * as c3 from 'antlr4-c3';
import {CaretPosition,  TokenPosition} from './components/autocomplete/types';
import { SymbolTableVisitor } from './components/autocomplete/symbol-table-visitor';
import {ParseTree, TerminalNode} from "antlr4ts/tree";
import { computeTokenPosition } from './components/autocomplete/compute-token-position';
let currentContent = '';
let currentCursor = {line: 0, column: 0};

function getSuggestions(code: string, caretPosition: CaretPosition) {
  
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

const parseAndProvideCandidates = (content: string) => {
    return getSuggestions(content, currentCursor);
}

const javaCompletion = autocompletion({
    activateOnTyping: true,
    override: [
      async (ctx) => {
        const { pos } = ctx;
        try {
          const result = parseAndProvideCandidates(currentContent);
          if (!result || result.length === 0) {
            console.log('Unable to get completions', { pos });
            return null;
          }
          console.log('result', result);
          const entries = result.map(item => {
            return {type: 'keywords', label: item}
          });
          const completions = {entries};

  
          return completeFromList(
            // @ts-ignore
            completions.entries.map((c, i) => {
              let suggestions = {
                type: c.type,
                label: c.label,
              };
  
              return suggestions;
            })
          )(ctx);
        } catch (e) {
          console.log('Unable to get completions', { pos, error: e });
          return null;
        }
      },
    ],
  });

function onCodeChange(value: string, viewUpdate:ViewUpdate) {
    console.log('value:', value);
    currentContent = value;
    console.log('viewupdate',viewUpdate);
    const range = viewUpdate.state.selection.ranges[0];
    //const doc = viewUpdate.state.doc;
    const pos = range.from;
    const subText = value.substring(0, pos);
    const parts = subText.split('\n');
    const line = parts.length;
    const column = parts[parts.length - 1].length;
    currentCursor = {line, column };
}

export default function Editor() {
    const initCode = `
public class Demo {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
    `;
  return (
    <CodeMirror
      value={initCode}
      height="100vh"
      extensions={[javaCompletion, java()]}
      onChange={(value, viewUpdate) => {
        onCodeChange(value, viewUpdate);
      }}
    />
  );


}
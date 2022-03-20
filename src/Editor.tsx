import CodeMirror, { ViewUpdate } from '@uiw/react-codemirror';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import { java } from '@codemirror/lang-java';
import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { JavaLexer } from './grammar/JavaLexer';
import { JavaParser } from './grammar/JavaParser';
import * as c3 from 'antlr4-c3';

let currentContent = '';

const parseAndProvideCandidates = (content: string) => {
    const inputStream = CharStreams.fromString(content);
    const lexer = new JavaLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);

    const parser = new JavaParser(tokenStream);

    //parser.expression();

    const core = new c3.CodeCompletionCore(parser);
    core.preferredRules = new Set([
        JavaParser.RULE_classType, JavaParser.RULE_packageDeclaration, JavaParser.RULE_identifier,
    ]);
    const candidates = core.collectCandidates(0);
    return candidates;
}

const javaCompletion = autocompletion({
    activateOnTyping: true,
    override: [
      async (ctx) => {
        const { pos } = ctx;
        try {
          const result = parseAndProvideCandidates(currentContent);
          console.log('result', result);
          const completions = {entries:[{kind:'keywords', name:'abc'}]};
          if (!completions) {
            console.log('Unable to get completions', { pos });
            return null;
          }
  
          return completeFromList(
            // @ts-ignore
            completions.entries.map((c, i) => {
              let suggestions = {
                type: c.kind,
                label: c.name,
                // TODO:: populate details and info
                //boost: 1 / Number(c.sortText),
              };
  
              return suggestions;
            })
          )(ctx);
        } catch (e) {
          console.log('Unable to get completions', { pos, error: e });
          return null;
        }
      }, //, 200),
    ],
  });

function onCodeChange(value: string, viewUpdate:ViewUpdate) {
    console.log('value:', value);
    currentContent = value;
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
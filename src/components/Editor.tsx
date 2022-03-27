import CodeMirror, { ViewUpdate } from '@uiw/react-codemirror';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import { indentUnit } from '@codemirror/language';

import { java } from '@codemirror/lang-java';
import { getSuggestions } from './autocomplete/suggest';

let currentContent = '';
let currentCursor = {line: 0, column: 0};

const javaCompletion = autocompletion({
    activateOnTyping: true,
    override: [
      async (ctx) => {
        const { pos } = ctx;
        try {
          const completions = getSuggestions(currentContent, currentCursor);
          if (!completions || completions.length === 0) {
            console.log('Unable to get completions', { pos });
            return null;
          }
          return completeFromList(completions)(ctx);
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
    private List<String> lists = new ArrayList<>();
    public static void main(String[] args) {
        String message = "";
        System.out.println(message);
    }
    
    private void doSomething() {
        
    }
}
    `;
  return (
    <CodeMirror
      value={initCode}
      height="100vh"
      extensions={[javaCompletion, java(), indentUnit.of('    ')]}
      onChange={(value, viewUpdate) => {
        onCodeChange(value, viewUpdate);
      }}
    />
  );


}
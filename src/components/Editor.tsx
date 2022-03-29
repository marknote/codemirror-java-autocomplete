import  { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import { indentUnit } from '@codemirror/language';

import { java } from '@codemirror/lang-java';
import { completeJava } from './autocomplete/autocomplete-java';

type EditorProps = {
  initCode: string,
  language: string
}


export default function Editor(props: EditorProps) {
  const [currentContent, setCurrentContent] = useState(props.initCode);
  const javaCompletion = autocompletion({
    activateOnTyping: true,
    override: [
      async (ctx) => {
        const { pos } = ctx;
        try {
          const subText = currentContent.substring(0, pos);
          const parts = subText.split('\n');
          const line = parts.length;
          const column = parts[parts.length - 1].length;
          const currentCursor = {line, column };
          const completions = completeJava(currentContent, currentCursor);
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

  return (
    <CodeMirror
      value={currentContent}
      height="100vh"
      extensions={[javaCompletion, java(), indentUnit.of('    ')]}
      onChange={(value) => {
        setCurrentContent(value);
      }}
    />
  );


}
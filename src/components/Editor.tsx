import  { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import EditorProp from '../lib/domain/EditorProp';




export default function Editor(props: EditorProp) {
  const [currentContent, setCurrentContent] = useState(props.code);
  const languageCompletion = autocompletion({
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
          const completions = props.completor(currentContent, currentCursor);
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
      extensions={[languageCompletion, props.langFn, props.indent]}
      onChange={(value) => {
        setCurrentContent(value);
      }}
    />
  );


}
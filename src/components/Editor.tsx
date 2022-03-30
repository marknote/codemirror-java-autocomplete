import  { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { autocompletion, completeFromList, Completion } from '@codemirror/autocomplete';
import { indentUnit } from '@codemirror/language';

import { CaretPosition } from './autocomplete/types';
import { LanguageSupport } from '@codemirror/language';

type EditorProps = {
  initCode: string,
  language: string,
  lang: LanguageSupport,
  completor: (code: string, caretPosition: CaretPosition) => Completion[]
}

export default function Editor(props: EditorProps) {
  const [currentContent, setCurrentContent] = useState(props.initCode);
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
      extensions={[languageCompletion, props.lang, indentUnit.of('    ')]}
      onChange={(value) => {
        setCurrentContent(value);
      }}
    />
  );


}
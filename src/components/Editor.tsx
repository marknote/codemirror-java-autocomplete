import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import EditorProp from '../lib/domain/EditorProp';

export default function Editor(props: EditorProp) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const onSelectMode = (mode: 'light' | 'dark') => {
    setMode(mode);
  };

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
          const currentCursor = { line, column };
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

  useEffect(() => {
    // Add listener to update styles
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) =>
        onSelectMode(e.matches ? 'dark' : 'light')
      );

    // Setup dark/light mode for the first time
    onSelectMode(
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    );

    // Remove listener
    return () => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', () => {});
    };
  }, []);

  return (
    <CodeMirror
      value={currentContent}
      theme={mode}
      height="100vh"
      extensions={[languageCompletion, props.langFn, props.indent]}
      onChange={(value) => {
        setCurrentContent(value);
      }}
    />
  );
}

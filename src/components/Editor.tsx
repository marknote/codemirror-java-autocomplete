import { useEffect, useState, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import EditorProp from '../lib/domain/EditorProp';
import { AnyRecord } from 'dns';

export default function Editor(props: EditorProp) {
  const editor = useRef();
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const onSelectMode = (mode: 'light' | 'dark') => {
    setMode(mode);
  };

  const [currentContent, setCurrentContent] = useState(props.code);
  const languageCompletion = props.completor == null ?
    autocompletion({
      activateOnTyping: true})
    :autocompletion({
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
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const completions = props.completor!(currentContent, currentCursor);
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
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .removeEventListener('change', () => {});
    };
  }, []);

  const saveContent = (code: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    console.log(code);
    if (
      win.webkit
      && win.webkit.messageHandlers
      && win.webkit.messageHandlers.editorHandler) {
        win.webkit.messageHandlers.editorHandler.postMessage(
          {event:'textChanged',
         code,
         currentPath: props.currentPath
        });
    }
  };

  function surroundSelectionWithPrefixString(prefix: string, suffix:string) {

    const editorCurrent = editor.current as any;
    console.log(editorCurrent);
    if (editorCurrent == null) {
      return;
    }
    const range = editorCurrent.view.state.selection.ranges[0];

    const transaction = editorCurrent.view.state.update({
      changes: [
        { from: range.from, insert: prefix },
        { from: range.to, insert: suffix },
      ],
    });
    // At this point the view still shows the old state.
    editorCurrent.view.dispatch(transaction);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).surroundSelectionWithPrefixString = surroundSelectionWithPrefixString;

  return (
    <CodeMirror
    ref={editor}
      value={currentContent}
      theme={mode}
      height="100vh"
      extensions={[languageCompletion, props.langFn, props.indent]}
      onChange={(value) => {
        setCurrentContent(value);
        saveContent(value);
      }}
    />
  );
}

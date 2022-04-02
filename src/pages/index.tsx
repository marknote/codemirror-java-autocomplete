import Editor from '../components/Editor';
//import { completeJava } from '../components/autocomplete/autocomplete-java';

//import { java } from '@codemirror/lang-java';
import { useEffect, useState } from 'react';
import { CodeInfo } from '../lib/domain/types';
import EditorProp from '../lib/domain/EditorProp';

export default function App() {
  const [data, setData] = useState<EditorProp | null>(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/code?path=a.js',{method: 'POST'})
      .then((res) => res.json())
      .then((data: CodeInfo) => {
        const editorProp = new EditorProp(data.code, data.language);
        setData(editorProp);
        setLoading(false);
      });
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (!data) {
    return <p>No profile data</p>;
  }

  return <Editor code={data.code}
  language={data.language}
  langFn={data.langFn}
  completor={data.completor}
  indent={data.indent}
  />;

}


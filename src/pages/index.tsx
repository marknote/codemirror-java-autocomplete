import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CodeInfo } from '../lib/domain/types';
import EditorProp from '../lib/domain/EditorProp';
import Editor from '../components/Editor';

export default function App() {
  const router = useRouter();
  let path = router.asPath;
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  const [data, setData] = useState<EditorProp | null>(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/code${path}`, { method: 'POST' })
      .then((res) => res.json())
      .then((data: CodeInfo) => {
        const editorProp = new EditorProp(data.code, data.language, path);
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

  return (
    <Editor
      code={data.code}
      language={data.language}
      langFn={data.langFn}
      completor={data.completor}
      indent={data.indent}
      currentPath={path}
    />
  );
}

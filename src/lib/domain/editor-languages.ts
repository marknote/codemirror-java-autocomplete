import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { json } from '@codemirror/lang-json';
import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';
import { LanguageSupport, LanguageDescription } from '@codemirror/language';
import { StreamLanguage } from '@codemirror/stream-parser';
import { lua } from '@codemirror/legacy-modes/mode/lua';
import { go } from '@codemirror/legacy-modes/mode/go';
import { r } from '@codemirror/legacy-modes/mode/r';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { swift } from '@codemirror/legacy-modes/mode/swift';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';
import { vb } from '@codemirror/legacy-modes/mode/vb';
import { vbScript } from '@codemirror/legacy-modes/mode/vbscript';

const text = markdown();

const markdownEx = markdown({
  codeLanguages: [
    LanguageDescription.of({
      name: 'javascript',
      alias: ['js', 'jsx', 'ts', 'tsx'],
      async load() {
        return javascript({jsx: true, typescript: true});
      },
    }),
    LanguageDescription.of({
      name: 'json',
      async load() {
        return json();
      },
    }),
    LanguageDescription.of({
      name: 'html',
      alias: ['htm'],
      async load() {
        return html();
      },
    }),
    LanguageDescription.of({
      name: 'css',
      async load() {
        return css();
      },
    }),
    LanguageDescription.of({
      name: 'python',
      alias: ['py'],
      async load() {
        return python();
      },
    }),
    LanguageDescription.of({
      name: 'java',
      async load() {
        return java();
      },
    }),
  ],
});

const LANGUAGES = {
  'cpp': cpp(),
  'css': css(),
  'go': new LanguageSupport(StreamLanguage.define(go)),
  'html': html(),
  'javascript': javascript(),
  'java': java(),
  'js': javascript(),
  'jsx': javascript({jsx: true}),
  'json': json(),
  'lua': new LanguageSupport(StreamLanguage.define(lua)),
  'markdown': markdownEx,
  'python': python(),
  'r': new LanguageSupport(StreamLanguage.define(r)),
  'ruby': new LanguageSupport(StreamLanguage.define(ruby)),
  'bash': new LanguageSupport(StreamLanguage.define(shell)),
  'rust': rust(),
  'sql': sql(),
  'swift': new LanguageSupport(StreamLanguage.define(swift)),
  'typescript': javascript({jsx: true, typescript: true}),
  'vb': new LanguageSupport(StreamLanguage.define(vb)),
  'vbscript': new LanguageSupport(StreamLanguage.define(vbScript)),
  'xml': xml(),
  'yaml': new LanguageSupport(StreamLanguage.define(yaml)),
};
const LANGUAGE_MAP = new Map<string, LanguageSupport>(Object.entries(LANGUAGES));

export const retrieveLanguage = (name: string) => {
  return LANGUAGE_MAP.get(name) || text;
};

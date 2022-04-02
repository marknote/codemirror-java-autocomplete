import { LanguageSupport, indentUnit } from '@codemirror/language';
import { Extension } from '@codemirror/state';

import { Completion } from '@codemirror/autocomplete';
import { CaretPosition } from './types';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { completeTs } from '../../components/autocomplete/autocomplete-ts';
import { completeJava } from '../../components/autocomplete/autocomplete-java';

type Completor = (code: string, caretPosition: CaretPosition) => Completion[];

export default class EditorProp  {
    langFn: LanguageSupport;
    completor: Completor;
    indent: Extension;

    constructor (
        public readonly code: string,
        public readonly language: string
    ) {
        this.langFn = EditorProp.fnFromLanguage(language);
        this.completor = EditorProp.completorFromLanguage(language);
        this.indent = EditorProp.indentFromLanguage(language);
    }

    static  fnFromLanguage(lang: string): LanguageSupport {
        if (lang === 'java') {
            return java();
        } else {
            return javascript();
        }
    }

    static indentFromLanguage(lang: string): Extension {
        if (lang === 'java') {
            return indentUnit.of('    ');
        } else {
            return indentUnit.of('  ');
        }
    }

    static  completorFromLanguage(lang: string): Completor {
        if (lang === 'java') {
            return completeJava;
        } else {
            return completeTs;
        }
    }

  }
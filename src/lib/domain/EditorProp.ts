import { LanguageSupport, indentUnit } from '@codemirror/language';
import { Extension } from '@codemirror/state';

import { Completion } from '@codemirror/autocomplete';
import { CaretPosition } from './types';
import { completeTs } from '../../components/autocomplete/autocomplete-ts';
import { completeJava } from '../../components/autocomplete/autocomplete-java';
import { retrieveLanguage } from './editor-languages';

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
        return retrieveLanguage(lang);
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
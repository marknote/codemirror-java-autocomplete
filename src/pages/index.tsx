import Editor from '../components/Editor';
//import { completeJava } from '../components/autocomplete/autocomplete-java';
import { completeTs } from '../components/autocomplete/autocomplete-ts';

//import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';

/*const initCode = `
public class Demo {
    private List<String> lists = new ArrayList<>();
    public static void main(String[] args) {
        String message = "";
        System.out.println(message);
    }
    
    private void doSomething() {
        
    }
}
    `;*/
const jsCode = `console.log('Hello')`;

export default function App() {
  //return <Editor initCode={initCode} language="java" completor={completeJava} />;
  return <Editor initCode={jsCode} language="javascript" lang={javascript()} completor={completeTs} />;

}


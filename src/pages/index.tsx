import Editor from '../components/Editor';

const initCode = `
public class Demo {
    private List<String> lists = new ArrayList<>();
    public static void main(String[] args) {
        String message = "";
        System.out.println(message);
    }
    
    private void doSomething() {
        
    }
}
    `;

export default function App() {
  return <Editor initCode={initCode} language="java"/>;

}


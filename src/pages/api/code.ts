import type { NextApiRequest, NextApiResponse } from 'next';
import { CodeInfo } from '../../lib/domain/types';

export default (req: NextApiRequest, res: NextApiResponse<CodeInfo>) => {
  const path = req.query['path'] as string;
  let code = { code: "console.log('Hello');", language: 'javascript' };
  const pos = path.lastIndexOf('.');
  const extention = pos > 0 && pos + 1 < path.length ? path.substring(pos + 1) : '';
  switch(extention) {
    case 'java':
      code = {
        code: `
  public class Demo {
      private List<String> lists = new ArrayList<>();
      public static void main(String[] args) {
          String message = "";
          System.out.println(message);
      }
      
      private void doSomething() {
          
      }
  }`,
        language: 'java',
      };
      break;
    case 'md':
      code = {code: `### markdown 
\`\`\`js
const message = 'Hello';
console.log(message);
\`\`\`      
      `, language: 'markdown'};
      break;
      default:
        code = {code: `# Test 
        \`\`\`js
        const message = 'Hello';
        console.log(message);
        \`\`\`      
              `, language: 'markdown'};
  }

  res.status(200).json(code);
};

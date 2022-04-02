import type { NextApiRequest, NextApiResponse } from 'next';
import { CodeInfo } from '../../lib/domain/types';

export default (req: NextApiRequest, res: NextApiResponse<CodeInfo>) => {
  const path = req.query['path'];
  let code = { code: "console.log('Hello')", language: 'javascript' };
  if (path.includes('.java')) {
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
  }

  res.status(200).json(code);
};

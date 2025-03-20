// This file is used to declare custom types for TypeScript
// This is a declaration file for TypeScript to recognize the raw-loader module
declare module '!!raw-loader!*' {
    const content: string;
    export default content;
  }
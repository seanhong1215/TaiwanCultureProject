import { Quill } from "react-quill";

// 獨立成檔案：react-refresh 要求一個檔案只匯出元件，
// modules/formats 這些設定值跟 QuillToolbar 元件放在一起會讓 Fast Refresh 失效。

function undoChange() {
  this.quill.history.undo();
}

function redoChange() {
  this.quill.history.undo();
}

// 調整字體尺寸，改用 px 表示
const Size = Quill.import("formats/size");
Size.whitelist = ["16px", "18px", '24px', '32px', '48px'];
Quill.register(Size, true);

export const modules = {
  toolbar: {
    container: "#toolbar",
    handlers: {
      undo: undoChange,
      redo: redoChange
    }
  },
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true
  }
};

// 每新增或移除 Quill Editor 內建的工具，記得要在 formats 做相應的調整
export const formats = [
  "header",
  "size",
  "bold",
  "italic",
  "underline",
  "align",
  "strike",
  "script",
  "blockquote",
  "background",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "code-block"
];

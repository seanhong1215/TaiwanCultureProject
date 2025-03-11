
import { Quill } from "react-quill"
import './EditorToolbar.scss';



const CustomUndo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
    <path
      className="ql-stroke"
      d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"
    />
  </svg>
)

const CustomRedo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
    <path
      className="ql-stroke"
      d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"
    />
  </svg>
)

function undoChange() {
  this.quill.history.undo()
}

function redoChange() {
  this.quill.history.undo()
}

// 調整字體尺寸，改用 px 表示
const Size = Quill.import("formats/size")
Size.whitelist = ["16px", "18px", '24px', '32px', '48px']
Quill.register(Size, true)

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
}

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
]

export const QuillToolbar = () => {
  
  return (
    <div id="toolbar">
      <span className="ql-formats">
        <select className="ql-size" defaultValue="medium">
          {/* 對應前面設定的字體尺寸 */}
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="24px">24px</option>
          <option value="32px">32px</option>
          <option value="48px">48px</option>
        </select>
        <select className="ql-header" defaultValue="">
          <option value="2">大標題</option>
          <option value="3">子標題</option>
          <option value="">內文</option>
        </select>
      </span>
      <span className="ql-formats">
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-blockquote" />
      </span>
      <span className="ql-formats">
        <select className="ql-align" />
        {/* 可以客製化自己喜歡的顏色 */}
        <select className="ql-color">
          <option value="#000000" />
          <option value="#F44336" />
          <option value="#E91E63" />
        </select>
        <select className="ql-background" />
      </span>
      <span className="ql-formats">
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
        <button className="ql-indent" value="-1" />
        <button className="ql-indent" value="+1" />
      </span>
      <span className="ql-formats">
        <button className="ql-link" />
        <button className="ql-image" />
        <button className="ql-video" />
      </span>
      <span className="ql-formats">
        <button className="ql-clean" />
        <button className="ql-undo">
          <CustomUndo />
        </button>
        <button className="ql-redo">
          <CustomRedo />
        </button>
      </span>
    </div>
  )
}

export default QuillToolbar
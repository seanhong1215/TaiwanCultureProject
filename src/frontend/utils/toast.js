import Swal from 'sweetalert2';

/**
 * 輕量提示（toast）。
 *
 * 專案原本所有回饋都用 Swal.fire 的置中強制彈窗 —— 連「加入收藏」
 * 這種次要動作也會蓋住整個畫面、還要按一次 OK 才能繼續。
 * 收藏、複製、儲存這類操作應該用不打斷流程的提示；
 * 需要使用者做決定的場合（例如刪除確認）才保留原本的彈窗。
 *
 * 沿用專案既有的 sweetalert2，不額外引入套件。
 */
const ToastBase = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2400,
  timerProgressBar: true,
  didOpen: (element) => {
    // 滑鼠移上去時暫停倒數，讓使用者有時間讀完
    element.addEventListener('mouseenter', Swal.stopTimer);
    element.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

const fire = (icon, title) => ToastBase.fire({ icon, title });

const toast = {
  success: (title) => fire('success', title),
  error: (title) => fire('error', title),
  warning: (title) => fire('warning', title),
  info: (title) => fire('info', title),
};

export default toast;

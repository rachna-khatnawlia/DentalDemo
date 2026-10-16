import Toast from "react-native-toast-message";

class ToastService {
  /**
   * Display a success toast
   */
  static success(message: string, title: string = "Success") {
    Toast.show({
      type: "success",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 3500,
      autoHide: true,
      topOffset: 55,
    });
  }

  /**
   * Display an error toast
   */
  static error(message: string, title: string = "Error") {
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 55,
    });
  }

  /**
   * Display a warning toast
   */
  static warning(message: string, title: string = "Warning") {
    Toast.show({
      type: "warning",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 3500,
      autoHide: true,
      topOffset: 55,
    });
  }

  /**
   * Display an informational toast
   */
  static info(message: string, title: string = "Information") {
    Toast.show({
      type: "info",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 3500,
      autoHide: true,
      topOffset: 55,
    });
  }

  /**
   * Dismiss active toast
   */
  static hide() {
    Toast.hide();
  }
}

export default ToastService;

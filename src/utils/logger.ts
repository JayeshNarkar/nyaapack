import logUpdate from "log-update";

export class Logger {
  private static isProgressActive = false;

  static startProgress() {
    this.isProgressActive = true;
  }

  static stopProgress() {
    this.isProgressActive = false;
    logUpdate.done();
  }

  static log(message: string) {
    if (this.isProgressActive) {
      logUpdate.done();
      console.log(message);
      this.startProgress();
    } else {
      console.log(message);
    }
  }

  static error(message: string) {
    if (this.isProgressActive) {
      logUpdate.done();
      console.error(message);
      this.startProgress();
    } else {
      console.error(message);
    }
  }

  static updateProgress(text: string) {
    if (this.isProgressActive) {
      logUpdate(text);
    }
  }
}

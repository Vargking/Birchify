import { Component, type ReactNode } from "react";
import { BirchLogo } from "./icons";

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="recovery-page">
          <BirchLogo size={58} />
          <h1>工作室需要稍作休息。</h1>
          <p>页面遇到了问题。本机已保存的简历不会因此被删除。</p>
          <button
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            重新打开 Birchify
          </button>
          <small>如果问题仍然存在，请尝试强制刷新页面（Ctrl + F5）。</small>
        </main>
      );
    return this.props.children;
  }
}

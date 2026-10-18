// A CSP-restricted opaque-origin iframe creates the dedicated Worker.
// This isolation works on static hosts, including GitHub Pages, without headers.
function workerMain() {
self.onmessage = ({ data }) => {
  const logs = [];
  try {
    const run = new Function(
      "config",
      "console",
      `"use strict";\n${data.code}`,
    );
    const result = run(structuredClone(data.config), {
      log: (...items) => {
        if (logs.length < 40)
          logs.push(
            items
              .map((x) =>
                typeof x === "object" ? JSON.stringify(x) : String(x),
              )
              .join(" ")
              .slice(0, 2000),
          );
      },
    });
    if (result === undefined)
      throw Error("还没有返回结果。请在最后写 return { ... };");
    self.postMessage({ ok: true, result, logs });
  } catch (error) {
    self.postMessage({
      ok: false,
      error: error.name + ": " + error.message,
      logs,
    });
  }
};
}

export class SandboxedRunner {
  constructor() {
    this.frame = document.createElement("iframe");
    this.frame.hidden = true;
    this.frame.title = "代码练习隔离环境";
    this.frame.setAttribute("sandbox", "allow-scripts");
    const source = `(${workerMain.toString()})()`;
    const encoded = JSON.stringify(source).replaceAll("<", "\\u003c");
    this.frame.srcdoc = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'"><script>
      const url = URL.createObjectURL(new Blob([${encoded}], {type:'text/javascript'}));
      const worker = new Worker(url);
      URL.revokeObjectURL(url);
      worker.onmessage = event => parent.postMessage({kind:'result',data:event.data}, '*');
      worker.onerror = event => parent.postMessage({kind:'error',message:event.message}, '*');
      onmessage = event => { if(event.source === parent) worker.postMessage(event.data); };
      parent.postMessage({kind:'ready'}, '*');
    <\/script>`;
    this.listener = event => {
      if(event.source !== this.frame.contentWindow) return;
      if(event.data?.kind === 'ready') {
        this.ready = true;
        if(this.pending) this.postMessage(this.pending);
      } else if(event.data?.kind === 'result') {
        this.onmessage?.({data:event.data.data});
      } else if(event.data?.kind === 'error') {
        this.onerror?.({message:event.data.message,preventDefault(){}});
      }
    };
    window.addEventListener('message', this.listener);
    document.body.append(this.frame);
  }
  postMessage(data) {
    if(this.ready) this.frame.contentWindow.postMessage(data, '*');
    else this.pending = data;
  }
  terminate() {
    window.removeEventListener('message', this.listener);
    this.frame.remove();
    this.pending = null;
  }
}

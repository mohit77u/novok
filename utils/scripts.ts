export function loadScript(src: string, callback: any) {
    if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = callback;
        document.head.appendChild(script);
    } else {
        callback();
    }
}

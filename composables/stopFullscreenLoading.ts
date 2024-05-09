import { useFullscreenLoading } from "~/store/fullscreenLoading";

export async function stopFullscreenLoading() {
    useFullscreenLoading().stopLoading();
}

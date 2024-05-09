import { useFullscreenLoading } from "~/store/fullscreenLoading";

export async function startFullscreenLoading() {
    useFullscreenLoading().startLoading();
}

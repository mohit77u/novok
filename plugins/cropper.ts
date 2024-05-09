import VueCropper from "vue-cropperjs";
import "cropperjs/dist/cropper.css";

export default defineNuxtPlugin((nuxtApp) => {
    // Doing something with nuxtApp
    nuxtApp.vueApp.component('vue-cropper', VueCropper);
});

